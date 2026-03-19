import pytest
from fastapi import status


def test_admin_create_vehicle(client, admin_token):
    """Test admin can create a vehicle."""
    response = client.post(
        "/api/vehicles/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "brand": "Tesla",
            "model": "Model 3",
            "year": 2024,
            "mileage": 100,
            "price": 45000.0,
            "available_for_sale": True,
            "available_for_rent": False
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["brand"] == "Tesla"
    assert data["model"] == "Model 3"
    assert data["year"] == 2024
    assert data["available_for_sale"] is True
    assert data["available_for_rent"] is False


def test_list_vehicles_no_filter(client, test_sale_vehicle, test_rent_vehicle):
    """Test listing all vehicles without filter."""
    response = client.get("/api/vehicles/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 2
    assert len(data["vehicles"]) >= 2


def test_list_vehicles_filter_for_sale(client, test_sale_vehicle, test_rent_vehicle):
    """Test filtering vehicles available for sale."""
    response = client.get("/api/vehicles/?for_sale=true")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    for vehicle in data["vehicles"]:
        assert vehicle["available_for_sale"] is True


def test_list_vehicles_filter_for_rent(client, test_sale_vehicle, test_rent_vehicle):
    """Test filtering vehicles available for rent."""
    response = client.get("/api/vehicles/?for_rent=true")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    for vehicle in data["vehicles"]:
        assert vehicle["available_for_rent"] is True


def test_list_vehicles_filter_by_brand(client, test_sale_vehicle):
    """Test filtering vehicles by brand."""
    response = client.get(f"/api/vehicles/?brand={test_sale_vehicle.brand}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    for vehicle in data["vehicles"]:
        assert test_sale_vehicle.brand.lower() in vehicle["brand"].lower()


def test_list_vehicles_pagination(client, test_sale_vehicle, test_rent_vehicle):
    """Test vehicle listing pagination."""
    response = client.get("/api/vehicles/?page=1&page_size=1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert len(data["vehicles"]) <= 1


def test_get_vehicle_by_id(client, test_sale_vehicle):
    """Test getting vehicle details by ID."""
    response = client.get(f"/api/vehicles/{test_sale_vehicle.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == str(test_sale_vehicle.id)
    assert data["brand"] == test_sale_vehicle.brand


def test_admin_update_vehicle(client, admin_token, test_sale_vehicle):
    """Test admin can update vehicle."""
    response = client.put(
        f"/api/vehicles/{test_sale_vehicle.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"price": 22000.0, "mileage": 16000}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["price"] == 22000.0
    assert data["mileage"] == 16000


def test_admin_switch_vehicle_availability(client, admin_token, test_sale_vehicle):
    """Test admin can switch vehicle between sale and rent."""
    response = client.patch(
        f"/api/vehicles/{test_sale_vehicle.id}/availability?for_rent=true&for_sale=false",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["available_for_rent"] is True
    assert data["available_for_sale"] is False


def test_admin_delete_vehicle(client, admin_token, test_sale_vehicle):
    """Test admin can delete vehicle."""
    response = client.delete(
        f"/api/vehicles/{test_sale_vehicle.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify vehicle is deleted
    get_response = client.get(f"/api/vehicles/{test_sale_vehicle.id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
