from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
from app.core.logging import logger


class VehicleService:
    """Service layer for vehicle operations"""
    
    @staticmethod
    def create_vehicle(db: Session, vehicle_data: VehicleCreate) -> Vehicle:
        """
        Create a new vehicle.
        
        Args:
            db: Database session
            vehicle_data: Vehicle creation data
            
        Returns:
            Created vehicle instance
        """
        new_vehicle = Vehicle(
            brand=vehicle_data.brand,
            model=vehicle_data.model,
            year=vehicle_data.year,
            mileage=vehicle_data.mileage,
            price=vehicle_data.price,
            available_for_sale=vehicle_data.available_for_sale,
            available_for_rent=vehicle_data.available_for_rent
        )
        
        db.add(new_vehicle)
        db.commit()
        db.refresh(new_vehicle)
        
        logger.info(f"Vehicle created: {new_vehicle.brand} {new_vehicle.model} (ID: {new_vehicle.id})")
        return new_vehicle
    
    @staticmethod
    def get_vehicle_by_id(db: Session, vehicle_id: UUID) -> Vehicle:
        """
        Get vehicle by ID.
        
        Args:
            db: Database session
            vehicle_id: Vehicle UUID
            
        Returns:
            Vehicle instance
            
        Raises:
            HTTPException: 404 if vehicle not found
        """
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        return vehicle
    
    @staticmethod
    def list_vehicles(
        db: Session,
        for_sale: Optional[bool] = None,
        for_rent: Optional[bool] = None,
        brand: Optional[str] = None,
        model: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_year: Optional[int] = None,
        max_year: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[list[Vehicle], int]:
        """
        List vehicles with optional filters.
        
        Args:
            db: Database session
            for_sale: Filter by available for sale
            for_rent: Filter by available for rent
            brand: Filter by brand (case-insensitive partial match)
            model: Filter by model (case-insensitive partial match)
            min_price: Minimum price filter
            max_price: Maximum price filter
            min_year: Minimum year filter
            max_year: Maximum year filter
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (vehicles list, total count)
        """
        query = db.query(Vehicle)
        
        # Apply filters
        if for_sale is not None:
            query = query.filter(Vehicle.available_for_sale == for_sale)
        
        if for_rent is not None:
            query = query.filter(Vehicle.available_for_rent == for_rent)
        
        if brand:
            query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
        
        if model:
            query = query.filter(Vehicle.model.ilike(f"%{model}%"))
        
        if min_price is not None:
            query = query.filter(Vehicle.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Vehicle.price <= max_price)
        
        if min_year is not None:
            query = query.filter(Vehicle.year >= min_year)
        
        if max_year is not None:
            query = query.filter(Vehicle.year <= max_year)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        vehicles = query.offset(skip).limit(limit).all()
        
        return vehicles, total
    
    @staticmethod
    def update_vehicle(db: Session, vehicle_id: UUID, vehicle_data: VehicleUpdate) -> Vehicle:
        """
        Update a vehicle.
        
        Args:
            db: Database session
            vehicle_id: Vehicle UUID
            vehicle_data: Vehicle update data
            
        Returns:
            Updated vehicle instance
            
        Raises:
            HTTPException: 404 if vehicle not found
        """
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        
        # Update only provided fields
        update_data = vehicle_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(vehicle, field, value)
        
        db.commit()
        db.refresh(vehicle)
        
        logger.info(f"Vehicle updated: {vehicle.brand} {vehicle.model} (ID: {vehicle.id})")
        return vehicle
    
    @staticmethod
    def switch_availability(
        db: Session,
        vehicle_id: UUID,
        for_sale: Optional[bool] = None,
        for_rent: Optional[bool] = None
    ) -> Vehicle:
        """
        Switch vehicle availability between sale and rent.
        
        Args:
            db: Database session
            vehicle_id: Vehicle UUID
            for_sale: Set availability for sale
            for_rent: Set availability for rent
            
        Returns:
            Updated vehicle instance
            
        Raises:
            HTTPException: 404 if vehicle not found
        """
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        
        if for_sale is not None:
            vehicle.available_for_sale = for_sale
        
        if for_rent is not None:
            vehicle.available_for_rent = for_rent
        
        db.commit()
        db.refresh(vehicle)
        
        logger.info(
            f"Vehicle availability updated: {vehicle.brand} {vehicle.model} "
            f"(Sale: {vehicle.available_for_sale}, Rent: {vehicle.available_for_rent})"
        )
        return vehicle
    
    @staticmethod
    def delete_vehicle(db: Session, vehicle_id: UUID) -> None:
        """
        Delete a vehicle.
        
        Args:
            db: Database session
            vehicle_id: Vehicle UUID
            
        Raises:
            HTTPException: 404 if vehicle not found
        """
        vehicle = VehicleService.get_vehicle_by_id(db, vehicle_id)
        
        db.delete(vehicle)
        db.commit()
        
        logger.info(f"Vehicle deleted: {vehicle.brand} {vehicle.model} (ID: {vehicle_id})")
