from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole


class RegisterRequest(BaseModel):
    """Request schema for user registration"""
    full_name: str = Field(..., min_length=2, max_length=255, description="User's full name")
    email: EmailStr = Field(..., description="Valid email address")
    # max_length=72 guards ASCII passwords at the Pydantic level.
    # The byte-length validator below also catches multi-byte characters
    # that could exceed bcrypt's hard 72-byte limit with fewer characters.
    password: str = Field(..., min_length=8, max_length=72, description="Password (8–72 characters)")

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()

    @field_validator('password')
    @classmethod
    def validate_password_bytes(cls, v: str) -> str:
        if len(v.encode('utf-8')) > 72:
            raise ValueError(
                "Password must not exceed 72 bytes when encoded as UTF-8 "
                "(some special characters count as more than one byte)."
            )
        return v


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
