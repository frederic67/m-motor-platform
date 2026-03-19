from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, status
from app.models.application import Application, ApplicationStatus, ApplicationType
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.application import (
    ApplicationCreatePurchase,
    ApplicationCreateRental,
    ApplicationStatusUpdate,
    ApplicationWithDetails
)
from app.core.logging import logger


class ApplicationService:
    """Service layer for application operations"""
    
    @staticmethod
    def create_purchase_application(
        db: Session,
        user_id: UUID,
        application_data: ApplicationCreatePurchase
    ) -> Application:
        """
        Create a purchase application.
        
        Args:
            db: Database session
            user_id: User UUID
            application_data: Purchase application data
            
        Returns:
            Created application instance
            
        Raises:
            HTTPException: 404 if vehicle not found, 400 if vehicle not available for sale
        """
        # Check vehicle exists and is available for sale
        vehicle = db.query(Vehicle).filter(Vehicle.id == application_data.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        if not vehicle.available_for_sale:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle is not available for sale"
            )
        
        # Create application
        new_application = Application(
            user_id=user_id,
            vehicle_id=application_data.vehicle_id,
            type=ApplicationType.PURCHASE,
            status=ApplicationStatus.PENDING
        )
        
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        
        logger.info(f"Purchase application created: {new_application.id} by user {user_id}")
        return new_application
    
    @staticmethod
    def create_rental_application(
        db: Session,
        user_id: UUID,
        application_data: ApplicationCreateRental
    ) -> Application:
        """
        Create a rental application.
        
        Args:
            db: Database session
            user_id: User UUID
            application_data: Rental application data
            
        Returns:
            Created application instance
            
        Raises:
            HTTPException: 404 if vehicle not found, 400 if vehicle not available for rent
        """
        # Check vehicle exists and is available for rent
        vehicle = db.query(Vehicle).filter(Vehicle.id == application_data.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        if not vehicle.available_for_rent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle is not available for rent"
            )
        
        # Create application
        new_application = Application(
            user_id=user_id,
            vehicle_id=application_data.vehicle_id,
            type=ApplicationType.RENTAL,
            status=ApplicationStatus.PENDING
        )
        
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        
        logger.info(f"Rental application created: {new_application.id} by user {user_id}")
        return new_application
    
    @staticmethod
    def get_application_by_id(db: Session, application_id: UUID) -> Application:
        """
        Get application by ID.
        
        Args:
            db: Database session
            application_id: Application UUID
            
        Returns:
            Application instance
            
        Raises:
            HTTPException: 404 if application not found
        """
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        return application
    
    @staticmethod
    def list_user_applications(db: Session, user_id: UUID) -> list[Application]:
        """
        List all applications for a specific user.
        
        Args:
            db: Database session
            user_id: User UUID
            
        Returns:
            List of applications
        """
        applications = db.query(Application).filter(Application.user_id == user_id).all()
        return applications
    
    @staticmethod
    def list_all_applications(
        db: Session,
        status_filter: ApplicationStatus = None,
        skip: int = 0,
        limit: int = 100
    ) -> list[ApplicationWithDetails]:
        """
        List all applications with user and vehicle details (admin only).
        
        Args:
            db: Database session
            status_filter: Optional status filter
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of applications with details
        """
        query = db.query(Application)
        
        if status_filter:
            query = query.filter(Application.status == status_filter)
        
        applications = query.offset(skip).limit(limit).all()
        
        # Build detailed response
        result = []
        for app in applications:
            result.append(ApplicationWithDetails(
                id=app.id,
                user_id=app.user_id,
                vehicle_id=app.vehicle_id,
                type=app.type,
                status=app.status,
                created_at=app.created_at,
                updated_at=app.updated_at,
                user_email=app.user.email,
                user_full_name=app.user.full_name,
                vehicle_brand=app.vehicle.brand,
                vehicle_model=app.vehicle.model,
                vehicle_year=app.vehicle.year,
                vehicle_price=app.vehicle.price
            ))
        
        return result
    
    @staticmethod
    def update_application_status(
        db: Session,
        application_id: UUID,
        status_update: ApplicationStatusUpdate
    ) -> Application:
        """
        Update application status (admin only).
        
        Args:
            db: Database session
            application_id: Application UUID
            status_update: Status update data
            
        Returns:
            Updated application instance
            
        Raises:
            HTTPException: 404 if application not found
        """
        application = ApplicationService.get_application_by_id(db, application_id)
        
        application.status = status_update.status
        
        db.commit()
        db.refresh(application)
        
        logger.info(
            f"Application status updated: {application_id} -> {status_update.status}"
        )
        return application
    
    @staticmethod
    def approve_application(db: Session, application_id: UUID) -> Application:
        """
        Approve an application.
        
        Args:
            db: Database session
            application_id: Application UUID
            
        Returns:
            Updated application instance
        """
        return ApplicationService.update_application_status(
            db,
            application_id,
            ApplicationStatusUpdate(status=ApplicationStatus.APPROVED)
        )
    
    @staticmethod
    def reject_application(db: Session, application_id: UUID) -> Application:
        """
        Reject an application.
        
        Args:
            db: Database session
            application_id: Application UUID
            
        Returns:
            Updated application instance
        """
        return ApplicationService.update_application_status(
            db,
            application_id,
            ApplicationStatusUpdate(status=ApplicationStatus.REJECTED)
        )

    @staticmethod
    def delete_application(db: Session, application_id: UUID) -> None:
        """
        Delete an application (admin only).

        Args:
            db: Database session
            application_id: Application UUID

        Raises:
            HTTPException: 404 if application not found
        """
        application = ApplicationService.get_application_by_id(db, application_id)
        db.delete(application)
        db.commit()
        logger.info(f"Application deleted: {application_id}")
