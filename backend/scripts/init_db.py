"""
Script to initialize database with admin user and demo data
"""
import sys
import os
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.core.security import hash_password
from app.core.config import settings


def create_admin_user(db) -> bool:
    """
    Create default admin user if it doesn't exist.
    
    Returns:
        True if admin was created, False if already exists
    """
    admin_email = "admin@mmotors.com"
    
    # Check if admin exists
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
        print(f"✓ Admin user created: {admin_email} / Admin123!")
        return True
    else:
        print(f"✓ Admin user already exists: {admin_email}")
        return False


def create_demo_vehicles(db) -> int:
    """
    Create demo vehicles if they don't exist.
    
    Returns:
        Number of vehicles created
    """
    demo_vehicles = [
        {
            "brand": "Toyota",
            "model": "Camry",
            "year": 2023,
            "mileage": 15000,
            "price": 28000.0,
            "available_for_sale": True,
            "available_for_rent": False
        },
        {
            "brand": "Honda",
            "model": "Civic",
            "year": 2024,
            "mileage": 5000,
            "price": 25000.0,
            "available_for_sale": True,
            "available_for_rent": False
        },
        {
            "brand": "Tesla",
            "model": "Model 3",
            "year": 2024,
            "mileage": 1000,
            "price": 800.0,
            "available_for_sale": False,
            "available_for_rent": True
        },
        {
            "brand": "BMW",
            "model": "X5",
            "year": 2023,
            "mileage": 20000,
            "price": 1200.0,
            "available_for_sale": False,
            "available_for_rent": True
        },
        {
            "brand": "Mercedes-Benz",
            "model": "C-Class",
            "year": 2023,
            "mileage": 12000,
            "price": 42000.0,
            "available_for_sale": True,
            "available_for_rent": True
        }
    ]
    
    created_count = 0
    
    for vehicle_data in demo_vehicles:
        # Check if vehicle already exists (by brand, model, and year)
        existing = db.query(Vehicle).filter(
            Vehicle.brand == vehicle_data["brand"],
            Vehicle.model == vehicle_data["model"],
            Vehicle.year == vehicle_data["year"]
        ).first()
        
        if not existing:
            vehicle = Vehicle(**vehicle_data)
            db.add(vehicle)
            created_count += 1
            print(f"  ✓ Created: {vehicle_data['brand']} {vehicle_data['model']} {vehicle_data['year']}")
        else:
            print(f"  - Already exists: {vehicle_data['brand']} {vehicle_data['model']} {vehicle_data['year']}")
    
    if created_count > 0:
        db.commit()
        print(f"✓ {created_count} demo vehicles created")
    else:
        print("✓ All demo vehicles already exist")
    
    return created_count


def init_db():
    """Initialize database with admin user and optionally demo data."""
    db = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("Database Initialization")
        print("="*60 + "\n")
        
        # Always create admin user
        print("1. Creating admin user...")
        create_admin_user(db)
        
        # Create demo vehicles only in development environment
        if settings.is_development:
            print("\n2. Creating demo vehicles (development environment)...")
            create_demo_vehicles(db)
        else:
            print(f"\n2. Skipping demo vehicles (environment: {settings.APP_ENV})")
        
        print("\n" + "="*60)
        print("✓ Database initialization complete")
        print("="*60 + "\n")
        
        if settings.is_development:
            print("Default admin credentials:")
            print("  Email: admin@mmotors.com")
            print("  Password: Admin123!")
            print("\n⚠️  Change these credentials in production!\n")
        
    except Exception as e:
        print(f"\n✗ Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
