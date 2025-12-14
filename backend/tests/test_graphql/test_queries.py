"""
Tests for GraphQL queries.

These tests demonstrate testing GraphQL API with organization context.
"""

import pytest

from core.middleware.tenant import get_current_organization, set_current_organization


@pytest.mark.graphql
@pytest.mark.django_db
class TestProjectQueries:
    """Test suite for Project GraphQL queries"""

    def test_get_projects_with_organization_header(
        self, graphql_query_with_org, project
    ):
        """Test querying projects with organization context set"""
        query = """
            query {
                projects {
                    id
                    name
                    status
                    organization {
                        id
                        name
                    }
                }
            }
        """

        result = graphql_query_with_org(query)

        assert "errors" not in result
        assert "data" in result
        assert "projects" in result["data"]
        assert len(result["data"]["projects"]) == 1
        assert result["data"]["projects"][0]["name"] == project.name

    def test_get_projects_filters_by_organization(
        self, graphql_client, organization, second_organization, project, second_project
    ):
        """Test that projects are filtered by organization (isolation)"""
        # Query as first organization
        set_current_organization(organization)
        query = """
            query {
                projects {
                    id
                    name
                }
            }
        """

        result = graphql_client.execute(query)

        assert "errors" not in result
        assert len(result["data"]["projects"]) == 1
        assert result["data"]["projects"][0]["name"] == project.name

        # Clean up
        set_current_organization(None)

        # Query as second organization
        set_current_organization(second_organization)
        result = graphql_client.execute(query)

        assert "errors" not in result
        assert len(result["data"]["projects"]) == 1
        assert result["data"]["projects"][0]["name"] == second_project.name

        # Clean up
        set_current_organization(None)

    def test_get_projects_without_organization_header(self, graphql_client):
        """Test that querying without organization context returns error"""
        query = """
            query {
                projects {
                    id
                    name
                }
            }
        """

        # Ensure no organization is set
        set_current_organization(None)

        result = graphql_client.execute(query)

        assert "errors" in result
        assert "Organization not specified" in result["errors"][0]["message"]

    def test_get_project_by_id_with_organization(
        self, graphql_query_with_org, project
    ):
        """Test querying a single project by ID with organization context"""
        query = f"""
            query {{
                project(id: "{project.id}") {{
                    id
                    name
                    status
                    description
                }}
            }}
        """

        result = graphql_query_with_org(query)

        assert "errors" not in result
        assert "data" in result
        assert result["data"]["project"]["name"] == project.name
        assert result["data"]["project"]["status"] == project.status

    def test_get_project_from_different_organization(
        self, graphql_client, organization, second_organization, project, second_project
    ):
        """Test that you cannot access a project from a different organization"""
        # Set organization to first org
        set_current_organization(organization)

        # Try to query a project from second organization
        query = f"""
            query {{
                project(id: "{second_project.id}") {{
                    id
                    name
                }}
            }}
        """

        result = graphql_client.execute(query)

        assert "errors" in result
        assert "not found in your organization" in result["errors"][0]["message"]

        # Clean up
        set_current_organization(None)

    def test_get_projects_with_status_filter(self, graphql_query_with_org):
        """Test filtering projects by status"""
        from core.models import Project

        # Create projects with different statuses
        org = get_current_organization()
        Project.objects.create(organization=org, name="Active Project", status="active")
        Project.objects.create(
            organization=org, name="Planning Project", status="planning"
        )

        query = """
            query {
                projects(status: "active") {
                    id
                    name
                    status
                }
            }
        """

        result = graphql_query_with_org(query)

        assert "errors" not in result
        assert len(result["data"]["projects"]) == 1
        assert result["data"]["projects"][0]["status"] == "active"


@pytest.mark.graphql
@pytest.mark.django_db
class TestOrganizationQueries:
    """Test suite for Organization GraphQL queries"""

    def test_get_organizations(self, graphql_client, organization, second_organization):
        """Test querying all organizations (no auth required)"""
        query = """
            query {
                organizations {
                    id
                    name
                    slug
                }
            }
        """

        result = graphql_client.execute(query)

        assert "errors" not in result
        assert "data" in result
        assert len(result["data"]["organizations"]) == 2

    def test_get_organization_by_slug(self, graphql_client, organization):
        """Test querying a single organization by slug"""
        query = f"""
            query {{
                organization(slug: "{organization.slug}") {{
                    id
                    name
                    slug
                    description
                }}
            }}
        """

        result = graphql_client.execute(query)

        assert "errors" not in result
        assert result["data"]["organization"]["name"] == organization.name
        assert result["data"]["organization"]["slug"] == organization.slug
