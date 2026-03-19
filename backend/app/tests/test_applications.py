import pytest
from fastapi import status
from app.models.application import ApplicationStatus


def test_create_purchase_application(client, customer_token, test_sale_vehicle):
    """Test customer can create purchase application for sale vehicle."""
    response = client.post(
        "/api/applications/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"vehicle_id": str(test_sale_vehicle.id)}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["vehicle_id"] == str(test_sale_vehicle.id)
    assert data["type"] == "PURCHASE"
    assert data["status"] == "PENDING"


def test_create_rental_application(client, customer_token, test_rent_vehicle):
    """Test customer can create rental application for rent vehicle."""
    response = client.post(
        "/api/applications/rental",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"vehicle_id": str(test_rent_vehicle.id)}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["vehicle_id"] == str(test_rent_vehicle.id)
    assert data["type"] == "RENTAL"
    assert data["status"] == "PENDING"


def test_create_purchase_application_for_rent_only_vehicle_fails(client, customer_token, test_rent_vehicle):
    """Test cannot create purchase application for rent-only vehicle."""
    response = client.post(
        "/api/applications/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"vehicle_id": str(test_rent_vehicle.id)}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "not available for sale" in response.json()["detail"].lower()


def test_create_rental_application_for_sale_only_vehicle_fails(client, customer_token, test_sale_vehicle):
    """Test cannot create rental application for sale-only vehicle."""
    response = client.post(
        "/api/applications/rental",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"vehicle_id": str(test_sale_vehicle.id)}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "not available for rent" in response.json()["detail"].lower()


def test_get_my_applications(client, customer_token, test_customer, test_sale_vehicle, db):
    """Test customer can view their own applications."""
    from app.models.application import Application, ApplicationType
    
    # Create application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    
    response = client.get(
        "/api/applications/me",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["user_id"] == str(test_customer.id)


def test_admin_list_all_applications(client, admin_token, test_customer, test_sale_vehicle, db):
    """Test admin can view all applications."""
    from app.models.application import Application, ApplicationType
    
    # Create application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    
    response = client.get(
        "/api/applications/admin/all",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "user_email" in data[0]
    assert "vehicle_brand" in data[0]


def test_admin_approve_application(client, admin_token, test_customer, test_sale_vehicle, db):
    """Test admin can approve application."""
    from app.models.application import Application, ApplicationType
    
    # Create application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    response = client.post(
        f"/api/applications/{application.id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "APPROVED"


def test_admin_reject_application(client, admin_token, test_customer, test_sale_vehicle, db):
    """Test admin can reject application."""
    from app.models.application import Application, ApplicationType
    
    # Create application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    response = client.post(
        f"/api/applications/{application.id}/reject",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "REJECTED"


def test_admin_update_application_status(client, admin_token, test_customer, test_sale_vehicle, db):
    """Test admin can update application status."""
    from app.models.application import Application, ApplicationType
    
    # Create application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    response = client.patch(
        f"/api/applications/{application.id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "APPROVED"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "APPROVED"
