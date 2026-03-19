from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID
from typing import Optional


class VehicleCreate(BaseModel):
    """Schema for creating a new vehicle"""
    brand: str = Field(..., min_length=1, max_length=100, description="Vehicle brand")
    model: str = Field(..., min_length=1, max_length=100, description="Vehicle model")
    year: int = Field(..., ge=1900, le=2100, description="Manufacturing year")
    mileage: int = Field(..., ge=0, description="Vehicle mileage in km")
    price: float = Field(..., ge=0, description="Vehicle price")
    image_url: Optional[str] = Field(None, max_length=500, description="Vehicle image URL")
    available_for_sale: bool = Field(default=False, description="Available for sale")
    available_for_rent: bool = Field(default=False, description="Available for rent")
    
    @field_validator('brand', 'model')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()
    
    @field_validator('year')
    @classmethod
    def validate_year(cls, v: int) -> int:
        current_year = datetime.now().year
        if v > current_year + 1:
            raise ValueError(f"Year cannot be greater than {current_year + 1}")
        return v


class VehicleUpdate(BaseModel):
    """Schema for updating a vehicle (all fields optional)"""
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    model: Optional[str] = Field(None, min_length=1, max_length=100)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    mileage: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    available_for_sale: Optional[bool] = None
    available_for_rent: Optional[bool] = None
    
    @field_validator('brand', 'model')
    @classmethod
    def validate_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip() if v else v
    
    @field_validator('year')
    @classmethod
    def validate_year(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            current_year = datetime.now().year
            if v > current_year + 1:
                raise ValueError(f"Year cannot be greater than {current_year + 1}")
        return v


class VehicleResponse(BaseModel):
    """Schema for vehicle response"""
    id: UUID
    brand: str
    model: str
    year: int
    mileage: int
    price: float
    image_url: Optional[str]
    available_for_sale: bool
    available_for_rent: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class VehicleListResponse(BaseModel):
    """Schema for paginated vehicle list response"""
    vehicles: list[VehicleResponse]
    total: int
    page: int
    page_size: int
    
    @property
    def total_pages(self) -> int:
        return (self.total + self.page_size - 1) // self.page_size if self.page_size > 0 else 0
