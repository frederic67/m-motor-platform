import pytest
from fastapi import status


def test_register_customer(client):
    """Test customer registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "New Customer",
            "email": "newcustomer@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newcustomer@test.com"
    assert data["full_name"] == "New Customer"
    assert data["role"] == "CUSTOMER"
    assert "id" in data


def test_register_duplicate_email(client, test_customer):
    """Test registration with duplicate email fails."""
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Duplicate User",
            "email": "customer@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, test_customer):
    """Test successful login returns access token."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "customer@test.com",
            "password": "customer123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 0


def test_login_wrong_password(client, test_customer):
    """Test login with wrong password fails."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "customer@test.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test login with non-existent user fails."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@test.com",
            "password": "password"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_register_and_login_flow(client):
    """Test complete registration and login flow."""
    # Register
    register_response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Flow Test User",
            "email": "flowtest@test.com",
            "password": "flowpassword123"
        }
    )
    assert register_response.status_code == status.HTTP_201_CREATED
    
    # Login with registered credentials
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "flowtest@test.com",
            "password": "flowpassword123"
        }
    )
    assert login_response.status_code == status.HTTP_200_OK
    assert "access_token" in login_response.json()
