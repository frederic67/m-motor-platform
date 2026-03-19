from sqlalchemy import String, ForeignKey, DateTime, Enum as SQLEnum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID, uuid4
import enum
from app.db.base import Base


class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ApplicationType(str, enum.Enum):
    PURCHASE = "PURCHASE"
    RENTAL = "RENTAL"


class Application(Base):
    __tablename__ = "applications"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id: Mapped[UUID] = mapped_column(ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[ApplicationType] = mapped_column(SQLEnum(ApplicationType), nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(SQLEnum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applications")
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="applications")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_application_user_status', 'user_id', 'status'),
        Index('ix_application_vehicle_status', 'vehicle_id', 'status'),
    )
