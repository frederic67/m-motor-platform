from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.middleware import RequestLoggingMiddleware
from app.core.alerting import alert_manager
from app.routers import auth, vehicles, applications, documents

setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    description="API pour plateforme de concessionnaire automobile",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "vehicles").mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to catch unhandled exceptions.
    
    Args:
        request: HTTP request
        exc: Unhandled exception
        
    Returns:
        JSON error response
    """
    logger.error(
        f"Unhandled exception: {type(exc).__name__}",
        extra={
            "extra_data": {
                "method": request.method,
                "path": request.url.path,
                "exception_type": type(exc).__name__,
                "exception_message": str(exc)
            }
        },
        exc_info=True
    )
    
    # Trigger alert for unhandled exception
    alert_manager.alert_unhandled_exception(
        exception=exc,
        method=request.method,
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


@app.on_event("startup")
async def startup_event():
    """Application startup - initialize database and seed data"""
    
    db_type = "SQLite" if settings.is_sqlite else "PostgreSQL"
    logger.info(
        f"Starting {settings.APP_NAME} v{settings.APP_VERSION}",
        extra={
            "extra_data": {
                "environment": settings.ENV,
                "debug": settings.DEBUG,
                "version": settings.APP_VERSION,
                "database_type": db_type,
                "cors_origins": settings.cors_origins_list
            }
        }
    )
    
    # Step 1: Initialize database tables - MUST BE FIRST
    try:
        from app.db.session import init_db
        logger.info(f"Initializing {db_type} database tables...")
        init_db()
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"FATAL: Failed to initialize database: {e}", exc_info=True)
        raise
    
    # Step 2: Auto-seed admin user in development mode
    if settings.is_development:
        try:
            from app.db.session import SessionLocal
            from app.models.user import User, UserRole
            from app.core.security import hash_password
            
            logger.info("Auto-seeding admin user in development mode...")
            
            db = SessionLocal()
            try:
                # Check and create admin user
                admin_email = "admin@mmotors.com"
                admin = db.query(User).filter(User.email == admin_email).first()
                
                if not admin:
                    admin = User(
                        full_name="Admin M-Motors",
                        email=admin_email,
                        hashed_password=hash_password("Admin123!"),
                        role=UserRole.ADMIN
                    )
                    db.add(admin)
                    db.commit()
                    db.refresh(admin)
                    logger.info(f"✓ Admin user created: {admin_email} / Admin123!")
                else:
                    logger.info(f"✓ Admin user already exists: {admin_email}")
            except Exception as e:
                logger.error(f"Error during admin user seeding: {e}", exc_info=True)
                db.rollback()
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error during auto-seeding setup: {e}", exc_info=True)
    
    logger.info(f"✓ {settings.APP_NAME} started successfully on {db_type}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.APP_NAME}")


@app.get("/")
async def root():
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENV,
        "database": "SQLite" if settings.is_sqlite else "PostgreSQL"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    logger.debug("Health check requested")
    
    health_status = {
        "status": "healthy",
        "environment": settings.ENV,
        "version": settings.APP_VERSION,
        "service": settings.APP_NAME,
        "database_type": "SQLite" if settings.is_sqlite else "PostgreSQL",
        "timestamp": None
    }
    
    try:
        from app.db.session import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            health_status["database"] = "connected"
        except Exception as e:
            health_status["database"] = "disconnected"
            health_status["database_error"] = str(e)
            health_status["status"] = "degraded"
            logger.warning(f"Database health check failed: {e}")
        finally:
            db.close()
    except Exception as e:
        health_status["database"] = "unavailable"
        health_status["status"] = "degraded"
        logger.error(f"Database health check error: {e}")
    
    from datetime import datetime
    health_status["timestamp"] = datetime.utcnow().isoformat() + "Z"
    
    return health_status
