"""
Tests for the Organization model.

These tests demonstrate how to test Django models with pytest.
"""

import pytest
from django.db import IntegrityError
from django.utils.text import slugify

from core.models import Organization


@pytest.mark.unit
@pytest.mark.django_db
class TestOrganizationModel:
    """Test suite for Organization model"""

    def test_organization_creation(self):
        """Test creating an organization with basic fields"""
        org = Organization.objects.create(
            name="Acme Corporation", description="A test company"
        )

        assert org.id is not None
        assert org.name == "Acme Corporation"
        assert org.description == "A test company"
        assert org.is_active is True
        assert org.created_at is not None
        assert org.updated_at is not None

    def test_slug_auto_generation(self):
        """Test that slug is automatically generated from name"""
        org = Organization.objects.create(name="Test Organization")

        assert org.slug is not None
        assert org.slug == "test-organization"
        assert org.slug == slugify(org.name)

    def test_slug_generation_with_special_characters(self):
        """Test slug generation handles special characters correctly"""
        org = Organization.objects.create(name="Test & Company, Inc.")

        assert org.slug == "test-company-inc"
        # Ensure special characters are removed/converted

    def test_unique_name_constraint(self):
        """Test that organization names must be unique"""
        Organization.objects.create(name="Unique Org")

        with pytest.raises(IntegrityError):
            Organization.objects.create(name="Unique Org")

    def test_unique_slug_constraint(self):
        """Test that organization slugs must be unique"""
        org1 = Organization.objects.create(name="Test Org")

        # Attempting to create another org with same name should fail
        with pytest.raises(IntegrityError):
            Organization.objects.create(name="Test Org")

    def test_organization_string_representation(self):
        """Test the __str__ method returns the organization name"""
        org = Organization.objects.create(name="String Test Org")

        assert str(org) == "String Test Org"

    def test_organization_default_is_active(self):
        """Test that is_active defaults to True"""
        org = Organization.objects.create(name="Active Org")

        assert org.is_active is True

    def test_organization_can_be_deactivated(self):
        """Test that organizations can be deactivated"""
        org = Organization.objects.create(name="Deactivation Test")
        org.is_active = False
        org.save()

        org.refresh_from_db()
        assert org.is_active is False

    def test_organization_queryset_filtering(self):
        """Test filtering organizations by various fields"""
        Organization.objects.create(name="Active Org 1", is_active=True)
        Organization.objects.create(name="Active Org 2", is_active=True)
        Organization.objects.create(name="Inactive Org", is_active=False)

        active_orgs = Organization.objects.filter(is_active=True)
        assert active_orgs.count() == 2

        inactive_orgs = Organization.objects.filter(is_active=False)
        assert inactive_orgs.count() == 1
