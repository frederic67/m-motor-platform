from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from typing import Generator

# Configure engine based on database type
if settings.is_sqlite:
    # SQLite configuration for local development
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL configuration for production
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=settings.DEBUG
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI routes to get database session
    
    Usage:
        @router.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database - create all tables
    Safe to call multiple times (idempotent)
    """
    from app.db.base import Base
    # Import all models to register them with Base
    from app.models.user import User
    from app.models.vehicle import Vehicle
    from app.models.application import Application
    from app.models.document import Document
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
