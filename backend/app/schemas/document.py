from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID


class DocumentResponse(BaseModel):
    """Schema for document response"""
    id: UUID
    application_id: UUID
    filename: str
    content_type: str
    file_path: str
    uploaded_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response"""
    message: str
    document_id: UUID
    filename: str
