from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.core.logging import logger
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new customer account.
    
    - **full_name**: Full name of the user
    - **email**: Valid email address
    - **password**: Password (minimum 8 characters)
    """
    logger.info(f"Registration attempt for email: {user_data.email}")
    user = AuthService.create_user(db, user_data)
    logger.info(f"User registered successfully: {user.email}")
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with email and password to get access token.
    
    - **email**: User email
    - **password**: User password
    
    Returns JWT access token to use in Authorization header.
    """
    logger.info(f"Login attempt for email: {login_data.email}")
    token = AuthService.authenticate_user(db, login_data)
    logger.info(f"Login successful for email: {login_data.email}")
    return token


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get the currently authenticated user's profile including role.
    """
    return current_user
