from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.document_service import DocumentService
from app.services.application_service import ApplicationService
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.core.logging import logger

router = APIRouter()


@router.post(
    "/applications/{application_id}/documents",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_document(
    application_id: UUID,
    file: UploadFile = File(..., description="Document file (PDF, JPEG, PNG)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document for an application.
    
    **Authenticated** - requires login.
    Users can only upload documents to their own applications.
    Supported formats: PDF, JPEG, PNG, WebP.
    Maximum file size: 10MB.
    """
    # Check application exists and user owns it
    application = ApplicationService.get_application_by_id(db, application_id)
    
    if application.user_id != current_user.id and not current_user.is_admin:
        logger.warning(
            f"User {current_user.email} attempted to upload document to "
            f"application {application_id} without permission"
        )
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents to this application"
        )
    
    logger.info(f"User {current_user.email} uploading document for application {application_id}")
    document = await DocumentService.upload_document(db, application_id, file)
    logger.info(f"Document uploaded: {document.id} ({document.filename})")
    
    return DocumentUploadResponse(
        message="Document uploaded successfully",
        document_id=document.id,
        filename=document.filename
    )


@router.get(
    "/applications/{application_id}/documents",
    response_model=list[DocumentResponse]
)
async def list_application_documents(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all documents for an application.
    
    **Authenticated** - requires login.
    Users can only view documents for their own applications (admins can view all).
    """
    # Check application exists and user has access
    application = ApplicationService.get_application_by_id(db, application_id)
    
    if application.user_id != current_user.id and not current_user.is_admin:
        logger.warning(
            f"User {current_user.email} attempted to access documents for "
            f"application {application_id} without permission"
        )
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access documents for this application"
        )
    
    documents = DocumentService.list_application_documents(db, application_id)
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get document details by ID.
    
    **Authenticated** - requires login.
    Users can only view their own documents (admins can view all).
    """
    document = DocumentService.get_document_by_id(db, document_id)
    
    # Check authorization through application ownership
    application = ApplicationService.get_application_by_id(db, document.application_id)
    
    if application.user_id != current_user.id and not current_user.is_admin:
        logger.warning(
            f"User {current_user.email} attempted to access document {document_id} without permission"
        )
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )
    
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a document.
    
    **Admin only** - requires admin role.
    """
    logger.info(f"Admin {current_admin.email} deleting document {document_id}")
    DocumentService.delete_document(db, document_id)
    logger.info(f"Document deleted: {document_id}")
