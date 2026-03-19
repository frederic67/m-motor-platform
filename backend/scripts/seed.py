"""
CLI script for database operations
"""
import sys
import os
import argparse
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.core.security import hash_password
from app.core.config import settings


def seed_admin(db):
    """Seed admin user."""
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
        print(f"✓ Admin created: {admin_email}")
    else:
        print(f"✓ Admin already exists: {admin_email}")


def seed_vehicles(db):
    """Seed demo vehicles."""
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
    
    created = 0
    for data in demo_vehicles:
        existing = db.query(Vehicle).filter(
            Vehicle.brand == data["brand"],
            Vehicle.model == data["model"],
            Vehicle.year == data["year"]
        ).first()
        
        if not existing:
            vehicle = Vehicle(**data)
            db.add(vehicle)
            created += 1
            print(f"  ✓ {data['brand']} {data['model']} {data['year']}")
    
    if created > 0:
        db.commit()
        print(f"✓ {created} vehicles created")
    else:
        print("✓ All vehicles already exist")


def seed_all(db, force_env=None):
    """Seed all data."""
    env = force_env or settings.ENV
    
    print(f"\nSeeding database (environment: {env})...")
    print("-" * 60)
    
    # Always seed admin
    print("\n1. Seeding admin user...")
    seed_admin(db)
    
    # Seed vehicles in dev or if forced
    if env == "development" or force_env:
        print("\n2. Seeding demo vehicles...")
        seed_vehicles(db)
    else:
        print(f"\n2. Skipping demo vehicles (not in development)")
    
    print("\n" + "="*60)
    print("✓ Seeding complete")
    print("="*60)


def main():
    parser = argparse.ArgumentParser(description="Database seeding CLI")
    parser.add_argument(
        "action",
        choices=["seed", "seed-admin", "seed-vehicles"],
        help="Action to perform"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force seeding regardless of environment"
    )
    
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        if args.action == "seed":
            seed_all(db, force_env="development" if args.force else None)
        elif args.action == "seed-admin":
            seed_admin(db)
        elif args.action == "seed-vehicles":
            seed_vehicles(db)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
