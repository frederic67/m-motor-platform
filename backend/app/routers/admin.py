from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.schemas.application import ApplicationUpdateStatus, ApplicationWithDetails
from app.services.vehicle_service import VehicleService
from app.services.application_service import ApplicationService
from app.core.security import get_current_admin
from app.models.user import User
from app.core.logging import logger

router = APIRouter()

# Note: This router is deprecated. Admin routes are now integrated into their respective routers.
# Kept for backwards compatibility but all routes return 410 Gone.

@router.get("/", status_code=status.HTTP_410_GONE)
async def admin_deprecated():
    """
    This admin router is deprecated.
    
    Admin routes have been moved:
    - Vehicle management: /api/vehicles (POST, PUT, PATCH, DELETE require admin)
    - Application management: /api/applications/admin/* (requires admin)
    - Document management: /api/documents (DELETE requires admin)
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Admin routes have been reorganized. See API documentation for new endpoints."
    )
