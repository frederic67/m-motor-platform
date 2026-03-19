from sqlalchemy import String, Integer, Float, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID, uuid4
from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    brand: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    mileage: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    available_for_sale: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    available_for_rent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="vehicle", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_vehicle_availability', 'available_for_sale', 'available_for_rent'),
    )
