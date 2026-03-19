from sqlalchemy.orm import Session
from uuid import UUID
import os
import uuid as uuid_lib
import re
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from app.models.document import Document
from app.models.application import Application
from app.core.config import settings
from app.core.logging import logger


class DocumentService:
    """Service layer for document operations with secure file handling"""
    
    @staticmethod
    def _sanitize_filename(filename: str) -> str:
        """
        Sanitize filename to prevent path traversal and invalid characters.
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove any path components
        filename = os.path.basename(filename)
        
        # Remove or replace dangerous characters
        # Keep only alphanumeric, dash, underscore, and dot
        filename = re.sub(r'[^\w\s\-\.]', '', filename)
        
        # Remove multiple dots (prevent extension confusion)
        filename = re.sub(r'\.{2,}', '.', filename)
        
        # Limit filename length (excluding extension)
        name, ext = os.path.splitext(filename)
        if len(name) > 100:
            name = name[:100]
        
        # If filename becomes empty after sanitization, use a default
        if not name:
            name = "document"
        
        return f"{name}{ext}".lower()
    
    @staticmethod
    def _validate_file_extension(filename: str) -> bool:
        """
        Validate file extension against allowed extensions.
        
        Args:
            filename: Filename to validate
            
        Returns:
            True if extension is allowed
        """
        ext = Path(filename).suffix.lower()
        return ext in settings.ALLOWED_UPLOAD_EXTENSIONS
    
    @staticmethod
    def _validate_mime_type(content_type: str) -> bool:
        """
        Validate MIME type against allowed types.
        
        Args:
            content_type: MIME type to validate
            
        Returns:
            True if MIME type is allowed
        """
        return content_type in settings.ALLOWED_MIME_TYPES
    
    @staticmethod
    def _get_upload_directory(application_id: UUID) -> str:
        """
        Get upload directory path for an application.
        Creates directory if it doesn't exist.
        
        Args:
            application_id: Application UUID
            
        Returns:
            Upload directory path
        """
        upload_dir = os.path.join(settings.UPLOAD_DIR, str(application_id))
        Path(upload_dir).mkdir(parents=True, exist_ok=True)
        return upload_dir
    
    @staticmethod
    async def upload_document(
        db: Session,
        application_id: UUID,
        file: UploadFile
    ) -> Document:
        """
        Upload a document for an application with security validations.
        
        Args:
            db: Database session
            application_id: Application UUID
            file: Uploaded file
            
        Returns:
            Created document instance
            
        Raises:
            HTTPException: 404 if application not found, 400 if validation fails
        """
        # Check application exists
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            logger.warning(f"Document upload attempted for non-existent application: {application_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Validate filename exists
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename is required"
            )
        
        # Validate file extension
        if not DocumentService._validate_file_extension(file.filename):
            logger.warning(f"Invalid file extension attempted: {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_UPLOAD_EXTENSIONS)}"
            )
        
        # Validate MIME type
        if not DocumentService._validate_mime_type(file.content_type):
            logger.warning(f"Invalid MIME type attempted: {file.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: PDF, JPEG, PNG"
            )
        
        # Read file content
        try:
            content = await file.read()
        except Exception as e:
            logger.error(f"Error reading uploaded file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to read file"
            )
        
        # Validate file size
        file_size = len(content)
        if file_size > settings.max_upload_bytes:
            logger.warning(
                f"File too large: {file_size} bytes "
                f"(max: {settings.max_upload_bytes} bytes)"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_MB}MB"
            )
        
        # Validate minimum file size (prevent empty files)
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        # Sanitize filename
        safe_filename = DocumentService._sanitize_filename(file.filename)
        
        # Generate unique filename to prevent collisions
        file_extension = Path(safe_filename).suffix
        unique_filename = f"{uuid_lib.uuid4()}{file_extension}"
        
        # Get application-specific upload directory
        upload_dir = DocumentService._get_upload_directory(application_id)
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file to disk
        try:
            with open(file_path, "wb") as buffer:
                buffer.write(content)
        except Exception as e:
            logger.error(f"Error saving file to disk: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save file"
            )
        
        # Create document record in database
        document = Document(
            application_id=application_id,
            filename=safe_filename,  # Store sanitized original filename
            content_type=file.content_type,
            file_path=file_path  # Store full path for retrieval
        )
        
        try:
            db.add(document)
            db.commit()
            db.refresh(document)
        except Exception as e:
            # If database commit fails, remove the uploaded file
            try:
                os.remove(file_path)
            except:
                pass
            logger.error(f"Error creating document record: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save document record"
            )
        
        logger.info(
            f"Document uploaded successfully: {document.id} "
            f"({safe_filename}, {file_size} bytes) for application {application_id}"
        )
        return document
    
    @staticmethod
    def get_document_by_id(db: Session, document_id: UUID) -> Document:
        """
        Get document by ID.
        
        Args:
            db: Database session
            document_id: Document UUID
            
        Returns:
            Document instance
            
        Raises:
            HTTPException: 404 if document not found
        """
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        return document
    
    @staticmethod
    def list_application_documents(db: Session, application_id: UUID) -> list[Document]:
        """
        List all documents for an application.
        
        Args:
            db: Database session
            application_id: Application UUID
            
        Returns:
            List of documents
        """
        documents = db.query(Document).filter(
            Document.application_id == application_id
        ).order_by(Document.uploaded_at.desc()).all()
        return documents
    
    @staticmethod
    def delete_document(db: Session, document_id: UUID) -> None:
        """
        Delete a document and its file from disk.
        
        Args:
            db: Database session
            document_id: Document UUID
            
        Raises:
            HTTPException: 404 if document not found
        """
        document = DocumentService.get_document_by_id(db, document_id)
        
        # Delete physical file
        try:
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
                logger.info(f"Deleted file: {document.file_path}")
        except Exception as e:
            logger.error(f"Error deleting file {document.file_path}: {e}")
            # Continue with database deletion even if file deletion fails
        
        # Delete database record
        try:
            db.delete(document)
            db.commit()
            logger.info(f"Document deleted: {document_id}")
        except Exception as e:
            logger.error(f"Error deleting document record: {e}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document"
            )
