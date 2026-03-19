from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.application import ApplicationStatus, ApplicationType
from app.schemas.application import (
    ApplicationCreatePurchase,
    ApplicationCreateRental,
    ApplicationStatusUpdate,
)
from app.schemas.user import LoginRequest, RegisterRequest
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
from app.services.application_service import ApplicationService
from app.services.auth_service import AuthService
from app.services.vehicle_service import VehicleService


def test_auth_service_create_user_success(db):
    user_data = RegisterRequest(
        full_name="Service User",
        email="service.user@example.com",
        password="password123",
    )

    user = AuthService.create_user(db, user_data)

    assert user.email == "service.user@example.com"
    assert user.full_name == "Service User"
    assert user.hashed_password != "password123"


def test_auth_service_create_user_duplicate_email(db):
    user_data = RegisterRequest(
        full_name="Service User",
        email="duplicate@example.com",
        password="password123",
    )
    AuthService.create_user(db, user_data)

    with pytest.raises(HTTPException) as exc:
        AuthService.create_user(db, user_data)
    assert exc.value.status_code == 400
    assert "already registered" in str(exc.value.detail)


def test_auth_service_authenticate_user_success(db):
    AuthService.create_user(
        db,
        RegisterRequest(
            full_name="Auth User",
            email="auth.user@example.com",
            password="password123",
        ),
    )

    token = AuthService.authenticate_user(
        db, LoginRequest(email="auth.user@example.com", password="password123")
    )

    assert token.access_token
    assert token.token_type == "bearer"


def test_auth_service_get_user_by_email_not_found(db):
    with pytest.raises(HTTPException) as exc:
        AuthService.get_user_by_email(db, "missing@example.com")
    assert exc.value.status_code == 404


def test_vehicle_service_create_and_get(db):
    vehicle = VehicleService.create_vehicle(
        db,
        VehicleCreate(
            brand="BMW",
            model="X5",
            year=2022,
            price=55000.0,
            mileage=10000,
            available_for_sale=True,
            available_for_rent=False,
        ),
    )

    fetched = VehicleService.get_vehicle_by_id(db, vehicle.id)
    assert fetched.id == vehicle.id
    assert fetched.brand == "BMW"


def test_vehicle_service_list_with_filters(db):
    VehicleService.create_vehicle(
        db,
        VehicleCreate(
            brand="Toyota",
            model="Corolla",
            year=2021,
            price=22000.0,
            mileage=25000,
            available_for_sale=True,
            available_for_rent=False,
        ),
    )
    VehicleService.create_vehicle(
        db,
        VehicleCreate(
            brand="Toyota",
            model="Yaris",
            year=2023,
            price=600.0,
            mileage=5000,
            available_for_sale=False,
            available_for_rent=True,
        ),
    )

    vehicles, total = VehicleService.list_vehicles(db, for_sale=True, brand="Toy")
    assert total == 1
    assert len(vehicles) == 1
    assert vehicles[0].model == "Corolla"


def test_vehicle_service_update_and_switch_availability(db):
    vehicle = VehicleService.create_vehicle(
        db,
        VehicleCreate(
            brand="Audi",
            model="A4",
            year=2021,
            price=38000.0,
            mileage=18000,
            available_for_sale=True,
            available_for_rent=False,
        ),
    )

    updated = VehicleService.update_vehicle(
        db, vehicle.id, VehicleUpdate(price=36000.0, available_for_sale=False)
    )
    switched = VehicleService.switch_availability(db, vehicle.id, for_rent=True)

    assert updated.price == 36000.0
    assert switched.available_for_sale is False
    assert switched.available_for_rent is True


def test_vehicle_service_delete_removes_vehicle(db):
    vehicle = VehicleService.create_vehicle(
        db,
        VehicleCreate(
            brand="Mercedes",
            model="C-Class",
            year=2020,
            price=45000.0,
            mileage=20000,
            available_for_sale=True,
            available_for_rent=False,
        ),
    )
    VehicleService.delete_vehicle(db, vehicle.id)

    with pytest.raises(HTTPException) as exc:
        VehicleService.get_vehicle_by_id(db, vehicle.id)
    assert exc.value.status_code == 404


def test_application_service_create_purchase_success(db, test_customer, test_sale_vehicle):
    application = ApplicationService.create_purchase_application(
        db, test_customer.id, ApplicationCreatePurchase(vehicle_id=test_sale_vehicle.id)
    )
    assert application.user_id == test_customer.id
    assert application.vehicle_id == test_sale_vehicle.id
    assert application.type == ApplicationType.PURCHASE


def test_application_service_create_rental_success(db, test_customer, test_rent_vehicle):
    application = ApplicationService.create_rental_application(
        db, test_customer.id, ApplicationCreateRental(vehicle_id=test_rent_vehicle.id)
    )
    assert application.type == ApplicationType.RENTAL


def test_application_service_wrong_availability_raises_400(db, test_customer, test_sale_vehicle):
    with pytest.raises(HTTPException) as exc:
        ApplicationService.create_rental_application(
            db, test_customer.id, ApplicationCreateRental(vehicle_id=test_sale_vehicle.id)
        )
    assert exc.value.status_code == 400


def test_application_service_get_by_id_not_found(db):
    with pytest.raises(HTTPException) as exc:
        ApplicationService.get_application_by_id(db, uuid4())
    assert exc.value.status_code == 404


def test_application_service_list_and_status_update(db, test_customer, test_sale_vehicle):
    app = ApplicationService.create_purchase_application(
        db, test_customer.id, ApplicationCreatePurchase(vehicle_id=test_sale_vehicle.id)
    )

    mine = ApplicationService.list_user_applications(db, test_customer.id)
    assert len(mine) == 1

    updated = ApplicationService.update_application_status(
        db, app.id, ApplicationStatusUpdate(status=ApplicationStatus.APPROVED)
    )
    assert updated.status == ApplicationStatus.APPROVED


def test_application_service_approve_reject_and_delete(db, test_customer, test_sale_vehicle):
    app = ApplicationService.create_purchase_application(
        db, test_customer.id, ApplicationCreatePurchase(vehicle_id=test_sale_vehicle.id)
    )
    approved = ApplicationService.approve_application(db, app.id)
    assert approved.status == ApplicationStatus.APPROVED

    rejected = ApplicationService.reject_application(db, app.id)
    assert rejected.status == ApplicationStatus.REJECTED

    ApplicationService.delete_application(db, app.id)
    with pytest.raises(HTTPException):
        ApplicationService.get_application_by_id(db, app.id)
