"""
Pytest configuration and fixtures for the VoiceAI backend tests.

This file contains shared fixtures that can be used across all tests.
"""

import pytest
from django.test import Client
from graphene.test import Client as GrapheneClient

from core.models import Organization, Project, Task
from core.schema.schema import schema


@pytest.fixture(scope="function")
def api_client():
    """
    Django test client for making HTTP requests.
    Scope: function (new instance for each test)
    """
    return Client()


@pytest.fixture(scope="function")
def graphql_client():
    """
    GraphQL test client for executing GraphQL queries and mutations.
    Scope: function (new instance for each test)
    """
    return GrapheneClient(schema)


@pytest.fixture(scope="function")
@pytest.mark.django_db
def organization():
    """
    Create a test organization.
    Usage: def test_something(organization):
        # organization is now available
    """
    org = Organization.objects.create(
        name="Test Organization", description="A test organization"
    )
    return org


@pytest.fixture(scope="function")
@pytest.mark.django_db
def second_organization():
    """
    Create a second test organization for testing multi-tenancy.
    """
    org = Organization.objects.create(
        name="Second Test Organization", description="Another test organization"
    )
    return org


@pytest.fixture(scope="function")
@pytest.mark.django_db
def project(organization):
    """
    Create a test project associated with an organization.
    Depends on: organization fixture
    """
    proj = Project.objects.create(
        organization=organization,
        name="Test Project",
        description="A test project",
        status="active",
    )
    return proj


@pytest.fixture(scope="function")
@pytest.mark.django_db
def second_project(second_organization):
    """
    Create a project for the second organization (for testing isolation).
    """
    proj = Project.objects.create(
        organization=second_organization,
        name="Second Org Project",
        description="A project in second organization",
        status="planning",
    )
    return proj


@pytest.fixture(scope="function")
@pytest.mark.django_db
def task(project):
    """
    Create a test task associated with a project.
    Depends on: project fixture
    """
    task = Task.objects.create(
        project=project,
        title="Test Task",
        description="A test task",
        status="todo",
        priority="medium",
        order=0,
    )
    return task


@pytest.fixture(scope="function")
def org_context(organization):
    """
    Simulates organization context (for middleware testing).
    Returns a context dict with organization header.
    """
    return {"HTTP_X_ORGANIZATION_SLUG": organization.slug}


@pytest.fixture(scope="function")
def graphql_query_with_org(graphql_client, organization):
    """
    Helper fixture that provides a function to execute GraphQL queries
    with organization context automatically set.

    Usage:
        def test_something(graphql_query_with_org):
            result = graphql_query_with_org('''
                query {
                    projects {
                        id
                        name
                    }
                }
            ''')
    """

    def execute(query, variables=None):
        # Set organization in thread-local for testing
        from core.middleware.tenant import set_current_organization

        set_current_organization(organization)

        try:
            result = graphql_client.execute(query, variables=variables)
            return result
        finally:
            # Clean up
            set_current_organization(None)

    return execute


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """
    Automatically enable database access for all tests.
    This fixture runs automatically for every test.
    """
    pass


@pytest.fixture(autouse=True)
def reset_organization_context():
    """
    Automatically reset organization context after each test.
    Prevents test pollution from organization middleware.
    """
    yield
    from core.middleware.tenant import set_current_organization

    set_current_organization(None)
