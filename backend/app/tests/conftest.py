import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.core.security import hash_password

# Use SQLite in-memory database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_customer(db):
    """Create a test customer user."""
    customer = User(
        full_name="Test Customer",
        email="customer@test.com",
        hashed_password=hash_password("customer123"),
        role=UserRole.CUSTOMER
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def test_admin(db):
    """Create a test admin user."""
    admin = User(
        full_name="Test Admin",
        email="admin@test.com",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def customer_token(client, test_customer):
    """Get authentication token for test customer."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "customer@test.com",
            "password": "customer123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
def admin_token(client, test_admin):
    """Get authentication token for test admin."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@test.com",
            "password": "admin123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
def test_sale_vehicle(db):
    """Create a test vehicle available for sale."""
    vehicle = Vehicle(
        brand="Toyota",
        model="Camry",
        year=2022,
        mileage=15000,
        price=25000.0,
        available_for_sale=True,
        available_for_rent=False
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@pytest.fixture
def test_rent_vehicle(db):
    """Create a test vehicle available for rent."""
    vehicle = Vehicle(
        brand="Honda",
        model="Civic",
        year=2023,
        mileage=5000,
        price=500.0,
        available_for_sale=False,
        available_for_rent=True
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle
