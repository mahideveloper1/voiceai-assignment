"""
Tests for the Project model.

These tests demonstrate testing models with foreign key relationships.
"""

import pytest
from datetime import date

from core.models import Organization, Project, Task


@pytest.mark.unit
@pytest.mark.django_db
class TestProjectModel:
    """Test suite for Project model"""

    def test_project_creation_with_organization(self, organization):
        """Test creating a project with an organization"""
        project = Project.objects.create(
            organization=organization,
            name="Test Project",
            description="A test project",
            status="active",
        )

        assert project.id is not None
        assert project.organization == organization
        assert project.name == "Test Project"
        assert project.description == "A test project"
        assert project.status == "active"
        assert project.created_at is not None

    def test_project_belongs_to_organization(self, organization, project):
        """Test that project is linked to its organization"""
        assert project.organization == organization
        assert project in organization.project_set.all()

    def test_project_task_stats_with_no_tasks(self, project):
        """Test task_stats property when project has no tasks"""
        stats = project.task_stats

        assert stats["total"] == 0
        assert stats["completed"] == 0
        assert stats["in_progress"] == 0
        assert stats["todo"] == 0
        assert stats["completionRate"] == 0.0

    def test_project_task_stats_with_tasks(self, project):
        """Test task_stats property with various task statuses"""
        # Create tasks with different statuses
        Task.objects.create(
            project=project, title="Task 1", status="completed", priority="high"
        )
        Task.objects.create(
            project=project, title="Task 2", status="completed", priority="medium"
        )
        Task.objects.create(
            project=project, title="Task 3", status="in_progress", priority="medium"
        )
        Task.objects.create(
            project=project, title="Task 4", status="todo", priority="low"
        )

        stats = project.task_stats

        assert stats["total"] == 4
        assert stats["completed"] == 2
        assert stats["in_progress"] == 1
        assert stats["todo"] == 1
        assert stats["completionRate"] == 50.0  # 2/4 = 50%

    def test_project_status_choices(self, organization):
        """Test that only valid status values are accepted"""
        valid_statuses = ["planning", "active", "on_hold", "completed", "cancelled"]

        for status in valid_statuses:
            project = Project.objects.create(
                organization=organization, name=f"Project {status}", status=status
            )
            assert project.status == status

    def test_project_with_dates(self, organization):
        """Test project creation with start and end dates"""
        start_date = date(2025, 1, 1)
        end_date = date(2025, 12, 31)

        project = Project.objects.create(
            organization=organization,
            name="Dated Project",
            status="active",
            start_date=start_date,
            end_date=end_date,
        )

        assert project.start_date == start_date
        assert project.end_date == end_date

    def test_project_cascade_delete_with_organization(self, organization, project):
        """Test that deleting organization cascades to projects"""
        project_id = project.id
        organization.delete()

        with pytest.raises(Project.DoesNotExist):
            Project.objects.get(id=project_id)

    def test_project_string_representation(self, project):
        """Test the __str__ method returns the project name"""
        assert str(project) == project.name

    def test_multiple_projects_per_organization(self, organization):
        """Test that an organization can have multiple projects"""
        project1 = Project.objects.create(
            organization=organization, name="Project 1", status="active"
        )
        project2 = Project.objects.create(
            organization=organization, name="Project 2", status="planning"
        )

        org_projects = organization.project_set.all()
        assert org_projects.count() == 2
        assert project1 in org_projects
        assert project2 in org_projects
