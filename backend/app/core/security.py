from datetime import datetime, timedelta
from typing import Optional
import types as _types
from uuid import UUID
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.logging import logger

# passlib 1.7.4 reads bcrypt.__about__.__version__ for version detection.
# bcrypt >= 4.0 removed __about__, causing passlib to fall back to a broken
# compatibility path that pre-encodes the secret and exceeds bcrypt's 72-byte
# limit. This shim restores the attribute before the CryptContext is created.
import bcrypt as _bcrypt_module
if not hasattr(_bcrypt_module, '__about__'):
    _bcrypt_module.__about__ = _types.SimpleNamespace(
        __version__=_bcrypt_module.__version__
    )

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ========================================
# Password Hashing Functions
# ========================================

def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password string
    """
    if not isinstance(password, str):
        logger.error(
            f"[hash_password] expected str, got {type(password).__name__}: "
            f"{repr(password)[:80]}"
        )
        raise ValueError(
            f"hash_password requires a plain str, got {type(password).__name__}"
        )
    logger.debug(
        f"[hash_password] hashing password — type={type(password).__name__}, "
        f"len={len(password)}, utf8_bytes={len(password.encode('utf-8'))}"
    )
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ========================================
# JWT Token Functions
# ========================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token (e.g., {"sub": user_email})
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRES_MIN)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt


def verify_access_token(token: str) -> Optional[dict]:
    """
    Verify and decode a JWT access token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification error: {e}")
        return None


# ========================================
# Authentication Dependencies
# ========================================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        token: JWT token from Authorization header
        db: Database session
        
    Returns:
        Current authenticated user
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token
    payload = verify_access_token(token)
    if payload is None:
        logger.warning("Invalid token provided")
        raise credentials_exception
    
    # Extract user email from token
    user_id: str = payload.get("sub")
    if user_id is None:
        logger.warning("Token missing subject (user_id)")
        raise credentials_exception
    
    # Get user from database
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        logger.warning(f"Invalid UUID in token: {user_id}")
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        logger.warning(f"User not found for id: {user_id}")
        raise credentials_exception
    
    logger.info(f"User authenticated: {user.email}")
    return user


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to require admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if they are an admin
        
    Raises:
        HTTPException: 403 if user is not an admin
    """
    if current_user.role != UserRole.ADMIN:
        logger.warning(f"Non-admin user {current_user.email} attempted admin action")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return current_user


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency to get current user if authenticated, None otherwise.
    Useful for endpoints that work both authenticated and unauthenticated.
    
    Args:
        token: Optional JWT token
        db: Database session
        
    Returns:
        Current user if authenticated, None otherwise
    """
    if token is None:
        return None
    
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None
