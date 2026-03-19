import pytest
from fastapi import status
from io import BytesIO


def test_upload_document_to_application(client, customer_token, test_customer, test_sale_vehicle, db):
    """Test customer can upload document to their application."""
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
    
    # Create fake PDF file
    pdf_content = b"%PDF-1.4 fake pdf content"
    pdf_file = ("test_document.pdf", BytesIO(pdf_content), "application/pdf")
    
    response = client.post(
        f"/api/documents/applications/{application.id}/documents",
        headers={"Authorization": f"Bearer {customer_token}"},
        files={"file": pdf_file}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "document_id" in data
    assert data["filename"] == "test_document.pdf"


def test_upload_document_invalid_file_type(client, customer_token, test_customer, test_sale_vehicle, db):
    """Test upload with invalid file type fails."""
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
    
    # Create fake invalid file
    invalid_file = ("test.txt", BytesIO(b"text content"), "text/plain")
    
    response = client.post(
        f"/api/documents/applications/{application.id}/documents",
        headers={"Authorization": f"Bearer {customer_token}"},
        files={"file": invalid_file}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "not allowed" in response.json()["detail"].lower()


def test_upload_document_to_other_user_application_fails(client, customer_token, test_admin, test_sale_vehicle, db):
    """Test customer cannot upload document to another user's application."""
    from app.models.application import Application, ApplicationType
    
    # Create application for admin user
    application = Application(
        user_id=test_admin.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Try to upload as customer
    pdf_file = ("test.pdf", BytesIO(b"%PDF-1.4 test"), "application/pdf")
    
    response = client.post(
        f"/api/documents/applications/{application.id}/documents",
        headers={"Authorization": f"Bearer {customer_token}"},
        files={"file": pdf_file}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_application_documents(client, customer_token, test_customer, test_sale_vehicle, db):
    """Test customer can list documents for their application."""
    from app.models.application import Application, ApplicationType
    from app.models.document import Document
    
    # Create application
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Create document
    document = Document(
        application_id=application.id,
        filename="test.pdf",
        content_type="application/pdf",
        file_path="/fake/path/test.pdf"
    )
    db.add(document)
    db.commit()
    
    response = client.get(
        f"/api/documents/applications/{application.id}/documents",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["filename"] == "test.pdf"


def test_admin_delete_document(client, admin_token, test_customer, test_sale_vehicle, db):
    """Test admin can delete document."""
    from app.models.application import Application, ApplicationType
    from app.models.document import Document
    
    # Create application and document
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    document = Document(
        application_id=application.id,
        filename="test.pdf",
        content_type="application/pdf",
        file_path="/fake/path/test.pdf"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    response = client.delete(
        f"/api/documents/{document.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_customer_cannot_delete_document(client, customer_token, test_customer, test_sale_vehicle, db):
    """Test customer cannot delete documents (admin only)."""
    from app.models.application import Application, ApplicationType
    from app.models.document import Document
    
    # Create application and document
    application = Application(
        user_id=test_customer.id,
        vehicle_id=test_sale_vehicle.id,
        type=ApplicationType.PURCHASE
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    document = Document(
        application_id=application.id,
        filename="test.pdf",
        content_type="application/pdf",
        file_path="/fake/path/test.pdf"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    response = client.delete(
        f"/api/documents/{document.id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
