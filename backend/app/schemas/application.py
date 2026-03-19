from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from app.models.application import ApplicationStatus, ApplicationType


class ApplicationCreatePurchase(BaseModel):
    """Schema for creating a purchase application"""
    vehicle_id: UUID = Field(..., description="ID of the vehicle to purchase")
    
    model_config = ConfigDict(use_enum_values=False)


class ApplicationCreateRental(BaseModel):
    """Schema for creating a rental application"""
    vehicle_id: UUID = Field(..., description="ID of the vehicle to rent")
    
    model_config = ConfigDict(use_enum_values=False)


class ApplicationResponse(BaseModel):
    """Schema for application response"""
    id: UUID
    user_id: UUID
    vehicle_id: UUID
    type: ApplicationType
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=False)


class ApplicationWithDetails(ApplicationResponse):
    """Schema for application with user and vehicle details"""
    user_email: str
    user_full_name: str
    vehicle_brand: str
    vehicle_model: str
    vehicle_year: int
    vehicle_price: float


class ApplicationStatusUpdate(BaseModel):
    """Schema for updating application status (admin only)"""
    status: ApplicationStatus = Field(..., description="New application status")
    
    model_config = ConfigDict(use_enum_values=False)
