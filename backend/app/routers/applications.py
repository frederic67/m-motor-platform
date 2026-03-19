from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.db.session import get_db
from app.schemas.application import (
    ApplicationCreatePurchase,
    ApplicationCreateRental,
    ApplicationResponse,
    ApplicationWithDetails,
    ApplicationStatusUpdate
)
from app.models.application import ApplicationStatus
from app.services.application_service import ApplicationService
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.core.logging import logger

router = APIRouter()


@router.post("/purchase", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_application(
    application_data: ApplicationCreatePurchase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a purchase application for a vehicle.
    
    **Authenticated** - requires login.
    Vehicle must be available for sale.
    """
    logger.info(f"User {current_user.email} creating purchase application for vehicle {application_data.vehicle_id}")
    application = ApplicationService.create_purchase_application(db, current_user.id, application_data)
    logger.info(f"Purchase application created: {application.id}")
    return application


@router.post("/rental", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_rental_application(
    application_data: ApplicationCreateRental,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a rental application for a vehicle.
    
    **Authenticated** - requires login.
    Vehicle must be available for rent.
    """
    logger.info(f"User {current_user.email} creating rental application for vehicle {application_data.vehicle_id}")
    application = ApplicationService.create_rental_application(db, current_user.id, application_data)
    logger.info(f"Rental application created: {application.id}")
    return application


@router.get("/me", response_model=list[ApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all applications for the current user.
    
    **Authenticated** - requires login.
    Returns only applications belonging to the authenticated user.
    """
    applications = ApplicationService.list_user_applications(db, current_user.id)
    return applications


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get application details by ID.
    
    **Authenticated** - requires login.
    Users can only view their own applications (admins can view all).
    """
    application = ApplicationService.get_application_by_id(db, application_id)
    
    # Check authorization: user must own the application or be admin
    if application.user_id != current_user.id and not current_user.is_admin:
        logger.warning(f"User {current_user.email} attempted to access application {application_id} without permission")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this application"
        )
    
    return application


# ========================================
# Admin-only endpoints
# ========================================

@router.get("/admin/all", response_model=list[ApplicationWithDetails])
async def list_all_applications(
    status_filter: Optional[ApplicationStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all applications with user and vehicle details.
    
    **Admin only** - requires admin role.
    Returns all applications with detailed information.
    """
    skip = (page - 1) * page_size
    applications = ApplicationService.list_all_applications(
        db,
        status_filter=status_filter,
        skip=skip,
        limit=page_size
    )
    return applications


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: UUID,
    status_update: ApplicationStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update application status.
    
    **Admin only** - requires admin role.
    """
    logger.info(f"Admin {current_admin.email} updating application {application_id} status to {status_update.status}")
    application = ApplicationService.update_application_status(db, application_id, status_update)
    logger.info(f"Application status updated: {application_id} -> {status_update.status}")
    return application


@router.post("/{application_id}/approve", response_model=ApplicationResponse)
async def approve_application(
    application_id: UUID,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Approve an application.
    
    **Admin only** - requires admin role.
    Shortcut endpoint to approve an application.
    """
    logger.info(f"Admin {current_admin.email} approving application {application_id}")
    application = ApplicationService.approve_application(db, application_id)
    logger.info(f"Application approved: {application_id}")
    return application


@router.post("/{application_id}/reject", response_model=ApplicationResponse)
async def reject_application(
    application_id: UUID,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Reject an application.
    
    **Admin only** - requires admin role.
    Shortcut endpoint to reject an application.
    """
    logger.info(f"Admin {current_admin.email} rejecting application {application_id}")
    application = ApplicationService.reject_application(db, application_id)
    logger.info(f"Application rejected: {application_id}")
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: UUID,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete an application.

    **Admin only** - requires admin role.
    """
    logger.info(f"Admin {current_admin.email} deleting application {application_id}")
    ApplicationService.delete_application(db, application_id)
