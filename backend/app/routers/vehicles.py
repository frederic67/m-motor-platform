from fastapi import APIRouter, Depends, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import os
import shutil
from pathlib import Path
from app.db.session import get_db
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, VehicleListResponse
from app.services.vehicle_service import VehicleService
from app.core.security import require_admin
from app.models.user import User
from app.core.logging import logger
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=VehicleListResponse)
async def list_vehicles(
    for_sale: Optional[bool] = Query(None, description="Filter by available for sale"),
    for_rent: Optional[bool] = Query(None, description="Filter by available for rent"),
    brand: Optional[str] = Query(None, description="Filter by brand (partial match)"),
    model: Optional[str] = Query(None, description="Filter by model (partial match)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_year: Optional[int] = Query(None, ge=1900, description="Minimum year"),
    max_year: Optional[int] = Query(None, le=2100, description="Maximum year"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    List all vehicles with optional filters.
    
    Public endpoint - no authentication required.
    Supports pagination and filtering by sale/rent status, brand, model, price range, and year.
    """
    skip = (page - 1) * page_size
    
    vehicles, total = VehicleService.list_vehicles(
        db=db,
        for_sale=for_sale,
        for_rent=for_rent,
        brand=brand,
        model=model,
        min_price=min_price,
        max_price=max_price,
        min_year=min_year,
        max_year=max_year,
        skip=skip,
        limit=page_size
    )
    
    return VehicleListResponse(
        vehicles=vehicles,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get vehicle details by ID.
    
    Public endpoint - no authentication required.
    """
    vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
    return vehicle


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new vehicle.
    
    **Admin only** - requires admin role.
    """
    logger.info(f"Admin {current_admin.email} creating vehicle: {vehicle_data.brand} {vehicle_data.model}")
    vehicle = VehicleService.create_vehicle(db, vehicle_data)
    logger.info(f"Vehicle created: {vehicle.id}")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: UUID,
    vehicle_data: VehicleUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update vehicle information.
    
    **Admin only** - requires admin role.
    """
    logger.info(f"Admin {current_admin.email} updating vehicle: {vehicle_id}")
    vehicle = VehicleService.update_vehicle(db, vehicle_id, vehicle_data)
    logger.info(f"Vehicle updated: {vehicle.id}")
    return vehicle


@router.patch("/{vehicle_id}/availability", response_model=VehicleResponse)
async def switch_vehicle_availability(
    vehicle_id: UUID,
    for_sale: Optional[bool] = Query(None, description="Set available for sale"),
    for_rent: Optional[bool] = Query(None, description="Set available for rent"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Switch vehicle availability between sale and rent.
    
    **Admin only** - requires admin role.
    Can enable/disable sale and/or rent availability.
    """
    logger.info(f"Admin {current_admin.email} switching availability for vehicle: {vehicle_id}")
    vehicle = VehicleService.switch_availability(db, vehicle_id, for_sale, for_rent)
    logger.info(f"Vehicle availability updated: {vehicle.id} (Sale: {vehicle.available_for_sale}, Rent: {vehicle.available_for_rent})")
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: UUID,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a vehicle.
    
    **Admin only** - requires admin role.
    """
    logger.info(f"Admin {current_admin.email} deleting vehicle: {vehicle_id}")
    VehicleService.delete_vehicle(db, vehicle_id)
    logger.info(f"Vehicle deleted: {vehicle_id}")


@router.post("/{vehicle_id}/image", response_model=VehicleResponse)
async def upload_vehicle_image(
    vehicle_id: UUID,
    file: UploadFile = File(...),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a vehicle.
    
    **Admin only** - requires admin role.
    Accepts: JPG, JPEG, PNG, WEBP
    Max size: 5MB
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPG, PNG, and WEBP are allowed."
        )
    
    # Validate file size (5MB)
    max_size = 5 * 1024 * 1024
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit."
        )
    
    # Get vehicle
    vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
    
    # Create uploads directory
    upload_dir = Path("uploads/vehicles")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    filename = f"{vehicle_id}{file_extension}"
    file_path = upload_dir / filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update vehicle with image URL
    image_url = f"/uploads/vehicles/{filename}"
    vehicle.image_url = image_url
    db.commit()
    db.refresh(vehicle)
    
    logger.info(f"Image uploaded for vehicle {vehicle_id}: {image_url}")
    
    return vehicle
