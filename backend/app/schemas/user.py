from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole


class RegisterRequest(BaseModel):
    """Request schema for user registration"""
    full_name: str = Field(..., min_length=2, max_length=255, description="User's full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    """Request schema for user login"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")


class TokenResponse(BaseModel):
    """Response schema for authentication tokens"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class UserResponse(BaseModel):
    """Response schema for user data"""
    id: UUID
    full_name: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
