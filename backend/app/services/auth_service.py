from sqlalchemy.orm import Session
from datetime import timedelta
from uuid import UUID
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.core.logging import logger


class AuthService:
    """Service layer for authentication operations"""
    
    @staticmethod
    def create_user(db: Session, user_data: RegisterRequest, role: UserRole = UserRole.CUSTOMER) -> User:
        """
        Create a new user account.
        
        Args:
            db: Database session
            user_data: User registration data
            role: User role (defaults to CUSTOMER)
            
        Returns:
            Created user instance
            
        Raises:
            HTTPException: 400 if email already exists
        """
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.warning(f"Registration attempt with existing email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=role
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User created successfully: {new_user.email} (ID: {new_user.id})")
        return new_user
    
    @staticmethod
    def authenticate_user(db: Session, login_data: LoginRequest) -> TokenResponse:
        """
        Authenticate user and return access token.
        
        Args:
            db: Database session
            login_data: User login credentials
            
        Returns:
            Token response with access token
            
        Raises:
            HTTPException: 401 if credentials are invalid
        """
        # Find user by email
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            logger.warning(f"Login attempt with non-existent email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            logger.warning(f"Failed login attempt for user: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token (use user ID as subject)
        access_token_expires = timedelta(minutes=settings.JWT_EXPIRES_MIN)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        logger.info(f"User logged in successfully: {user.email}")
        return TokenResponse(access_token=access_token, token_type="bearer")
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: UUID) -> User:
        """
        Get user by ID.
        
        Args:
            db: Database session
            user_id: User UUID
            
        Returns:
            User instance
            
        Raises:
            HTTPException: 404 if user not found
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """
        Get user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User instance
            
        Raises:
            HTTPException: 404 if user not found
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
