import pytest
from fastapi import status


def test_customer_cannot_create_vehicle(client, customer_token):
    """Test that customer cannot create vehicles (admin only)."""
    response = client.post(
        "/api/vehicles/",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "brand": "BMW",
            "model": "X5",
            "year": 2023,
            "mileage": 10000,
            "price": 55000.0,
            "available_for_sale": True,
            "available_for_rent": False
        }
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "admin" in response.json()["detail"].lower()


def test_customer_cannot_update_vehicle(client, customer_token, test_sale_vehicle):
    """Test that customer cannot update vehicles (admin only)."""
    response = client.put(
        f"/api/vehicles/{test_sale_vehicle.id}",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"price": 20000.0}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_customer_cannot_delete_vehicle(client, customer_token, test_sale_vehicle):
    """Test that customer cannot delete vehicles (admin only)."""
    response = client.delete(
        f"/api/vehicles/{test_sale_vehicle.id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_customer_cannot_switch_vehicle_availability(client, customer_token, test_sale_vehicle):
    """Test that customer cannot switch vehicle availability (admin only)."""
    response = client.patch(
        f"/api/vehicles/{test_sale_vehicle.id}/availability?for_rent=true",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_customer_cannot_view_all_applications(client, customer_token):
    """Test that customer cannot view all applications (admin only)."""
    response = client.get(
        "/api/applications/admin/all",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_customer_cannot_update_application_status(client, customer_token, test_customer, test_sale_vehicle, db):
    """Test that customer cannot update application status (admin only)."""
    from app.models.application import Application, ApplicationType
    
    # Create an application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Try to update status as customer
    response = client.patch(
        f"/api/applications/{application.id}/status",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"status": "APPROVED"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_unauthenticated_cannot_create_application(client, test_sale_vehicle):
    """Test that unauthenticated user cannot create application."""
    response = client.post(
        "/api/applications/purchase",
        json={"vehicle_id": str(test_sale_vehicle.id)}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_admin_can_access_admin_endpoints(client, admin_token):
    """Test that admin can access admin-only endpoints."""
    # Admin can view all applications
    response = client.get(
        "/api/applications/admin/all",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
