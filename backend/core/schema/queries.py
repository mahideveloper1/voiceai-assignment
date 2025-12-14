import graphene
from graphql import GraphQLError
from django.db.models import Q
from core.schema.types import OrganizationType, ProjectType, TaskType, TaskCommentType
from core.models import Organization, Project, Task, TaskComment
from core.middleware.tenant import get_current_organization


class Query(graphene.ObjectType):
    # Organization queries
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))

    # Project queries
    projects = graphene.List(
        ProjectType,
        status=graphene.String(),
        search=graphene.String(),
        limit=graphene.Int(),
        offset=graphene.Int()
    )
    project = graphene.Field(ProjectType, id=graphene.UUID(required=True))

    # Task queries
    tasks = graphene.List(
        TaskType,
        project_id=graphene.UUID(),
        status=graphene.String(),
        priority=graphene.String(),
        search=graphene.String(),
        limit=graphene.Int(),
        offset=graphene.Int()
    )
    task = graphene.Field(TaskType, id=graphene.UUID(required=True))

    # Comment queries
    task_comments = graphene.List(
        TaskCommentType,
        task_id=graphene.UUID(required=True),
        limit=graphene.Int(),
        offset=graphene.Int()
    )

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_organization(self, info, slug):
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            raise GraphQLError(f"Organization with slug '{slug}' not found")

    def resolve_projects(self, info, status=None, search=None, limit=None, offset=None):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Filter by organization
        queryset = Project.objects.select_related('organization').filter(organization=organization)

        if status:
            queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        if offset:
            queryset = queryset[offset:]

        if limit:
            queryset = queryset[:limit]

        return queryset

    def resolve_project(self, info, id):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        try:
            return Project.objects.select_related('organization').get(id=id, organization=organization)
        except Project.DoesNotExist:
            raise GraphQLError(f"Project not found in your organization")

    def resolve_tasks(self, info, project_id=None, status=None, priority=None,
                      search=None, limit=None, offset=None):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Filter by organization through project relationship
        queryset = Task.objects.select_related('project', 'project__organization').filter(
            project__organization=organization
        )

        if project_id:
            queryset = queryset.filter(project_id=project_id)

        if status:
            queryset = queryset.filter(status=status)

        if priority:
            queryset = queryset.filter(priority=priority)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        if offset:
            queryset = queryset[offset:]

        if limit:
            queryset = queryset[:limit]

        return queryset

    def resolve_task(self, info, id):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        try:
            return Task.objects.select_related('project', 'project__organization').get(
                id=id,
                project__organization=organization
            )
        except Task.DoesNotExist:
            raise GraphQLError(f"Task not found in your organization")

    def resolve_task_comments(self, info, task_id, limit=None, offset=None):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Verify task belongs to current organization before returning comments
        try:
            Task.objects.select_related('project__organization').get(
                id=task_id,
                project__organization=organization
            )
        except Task.DoesNotExist:
            raise GraphQLError(f"Task not found in your organization")

        queryset = TaskComment.objects.filter(task_id=task_id)

        if offset:
            queryset = queryset[offset:]

        if limit:
            queryset = queryset[:limit]

        return queryset
