"""
Tests for GraphQL mutations.

These tests demonstrate testing GraphQL mutations with organization validation.
"""

import pytest

from core.middleware.tenant import set_current_organization
from core.models import Project


@pytest.mark.graphql
@pytest.mark.django_db
class TestProjectMutations:
    """Test suite for Project GraphQL mutations"""

    def test_create_project_for_current_org(self, graphql_query_with_org, organization):
        """Test creating a project for the current organization (happy path)"""
        mutation = f"""
            mutation {{
                createProject(
                    organizationId: "{organization.id}"
                    name: "New Project"
                    description: "A new test project"
                    status: "planning"
                ) {{
                    project {{
                        id
                        name
                        description
                        status
                        organization {{
                            id
                            name
                        }}
                    }}
                }}
            }}
        """

        result = graphql_query_with_org(mutation)

        assert "errors" not in result
        assert "data" in result
        assert result["data"]["createProject"]["project"]["name"] == "New Project"
        assert (
            result["data"]["createProject"]["project"]["description"]
            == "A new test project"
        )
        assert (
            result["data"]["createProject"]["project"]["organization"]["id"]
            == str(organization.id)
        )

        # Verify project was actually created
        assert Project.objects.filter(name="New Project").exists()

    def test_create_project_for_different_org(
        self, graphql_client, organization, second_organization
    ):
        """Test that you cannot create a project for a different organization"""
        # Set current organization to first org
        set_current_organization(organization)

        # Try to create project for second organization
        mutation = f"""
            mutation {{
                createProject(
                    organizationId: "{second_organization.id}"
                    name: "Unauthorized Project"
                    description: "Should fail"
                    status: "planning"
                ) {{
                    project {{
                        id
                        name
                    }}
                }}
            }}
        """

        result = graphql_client.execute(mutation)

        assert "errors" in result
        assert "current organization" in result["errors"][0]["message"].lower()

        # Verify project was NOT created
        assert not Project.objects.filter(name="Unauthorized Project").exists()

        # Clean up
        set_current_organization(None)

    def test_create_project_without_organization_header(self, graphql_client, organization):
        """Test that creating a project without organization context fails"""
        # Ensure no organization is set
        set_current_organization(None)

        mutation = f"""
            mutation {{
                createProject(
                    organizationId: "{organization.id}"
                    name: "No Context Project"
                    description: "Should fail"
                    status: "active"
                ) {{
                    project {{
                        id
                        name
                    }}
                }}
            }}
        """

        result = graphql_client.execute(mutation)

        assert "errors" in result
        assert "Organization not specified" in result["errors"][0]["message"]

    def test_update_project_in_current_org(self, graphql_query_with_org, project):
        """Test updating a project in the current organization"""
        mutation = f"""
            mutation {{
                updateProject(
                    id: "{project.id}"
                    name: "Updated Project Name"
                    status: "active"
                ) {{
                    project {{
                        id
                        name
                        status
                    }}
                }}
            }}
        """

        result = graphql_query_with_org(mutation)

        assert "errors" not in result
        assert result["data"]["updateProject"]["project"]["name"] == "Updated Project Name"
        assert result["data"]["updateProject"]["project"]["status"] == "active"

        # Verify update in database
        project.refresh_from_db()
        assert project.name == "Updated Project Name"
        assert project.status == "active"

    def test_update_project_from_different_org(
        self, graphql_client, organization, second_organization, project, second_project
    ):
        """Test that you cannot update a project from a different organization"""
        # Set current organization to first org
        set_current_organization(organization)

        # Try to update project from second organization
        mutation = f"""
            mutation {{
                updateProject(
                    id: "{second_project.id}"
                    name: "Hacked Name"
                ) {{
                    project {{
                        id
                        name
                    }}
                }}
            }}
        """

        result = graphql_client.execute(mutation)

        assert "errors" in result
        assert "not found in your organization" in result["errors"][0]["message"]

        # Verify project was NOT updated
        second_project.refresh_from_db()
        assert second_project.name != "Hacked Name"

        # Clean up
        set_current_organization(None)

    def test_delete_project_in_current_org(self, graphql_query_with_org, project):
        """Test deleting a project in the current organization"""
        project_id = project.id

        mutation = f"""
            mutation {{
                deleteProject(id: "{project.id}") {{
                    success
                }}
            }}
        """

        result = graphql_query_with_org(mutation)

        assert "errors" not in result
        assert result["data"]["deleteProject"]["success"] is True

        # Verify project was deleted
        assert not Project.objects.filter(id=project_id).exists()

    def test_delete_project_from_different_org(
        self, graphql_client, organization, second_project
    ):
        """Test that you cannot delete a project from a different organization"""
        # Set current organization to first org
        set_current_organization(organization)

        project_id = second_project.id

        # Try to delete project from second organization
        mutation = f"""
            mutation {{
                deleteProject(id: "{second_project.id}") {{
                    success
                }}
            }}
        """

        result = graphql_client.execute(mutation)

        assert "errors" in result
        assert "not found in your organization" in result["errors"][0]["message"]

        # Verify project was NOT deleted
        assert Project.objects.filter(id=project_id).exists()

        # Clean up
        set_current_organization(None)


@pytest.mark.graphql
@pytest.mark.django_db
class TestOrganizationMutations:
    """Test suite for Organization GraphQL mutations"""

    def test_create_organization(self, graphql_client):
        """Test creating a new organization"""
        mutation = """
            mutation {
                createOrganization(
                    name: "New Test Organization"
                    description: "A brand new organization"
                ) {
                    organization {
                        id
                        name
                        slug
                        description
                    }
                }
            }
        """

        result = graphql_client.execute(mutation)

        assert "errors" not in result
        assert result["data"]["createOrganization"]["organization"]["name"] == "New Test Organization"
        assert result["data"]["createOrganization"]["organization"]["slug"] == "new-test-organization"
        assert (
            result["data"]["createOrganization"]["organization"]["description"]
            == "A brand new organization"
        )
