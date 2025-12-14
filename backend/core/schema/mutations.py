import graphene
from graphql import GraphQLError
from core.models import Organization, Project, Task, TaskComment
from core.schema.types import OrganizationType, ProjectType, TaskType, TaskCommentType
from core.middleware.tenant import get_current_organization
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# Helper functions for WebSocket broadcasting
def broadcast_task_event(event_type, task, project_id=None):
    """Broadcast task events via WebSocket"""
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    if project_id is None:
        project_id = str(task.project.id)

    room_group_name = f'project_{project_id}'

    task_data = {
        'id': str(task.id),
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'order': task.order,
        'dueDate': task.due_date.isoformat() if task.due_date else None,
        'createdAt': task.created_at.isoformat(),
        'updatedAt': task.updated_at.isoformat(),
    }

    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': event_type,
            'task': task_data
        }
    )


def broadcast_task_delete(task_id, project_id):
    """Broadcast task deletion via WebSocket"""
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    room_group_name = f'project_{project_id}'

    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'task_delete',
            'task_id': str(task_id)
        }
    )


def broadcast_comment_event(comment, task):
    """Broadcast comment events via WebSocket"""
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    project_id = str(task.project.id)
    room_group_name = f'project_{project_id}'

    comment_data = {
        'id': str(comment.id),
        'taskId': str(comment.task.id),
        'authorName': comment.author_name,
        'authorEmail': comment.author_email,
        'content': comment.content,
        'createdAt': comment.created_at.isoformat(),
        'updatedAt': comment.updated_at.isoformat(),
    }

    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'comment_create',
            'comment': comment_data
        }
    )


# Organization Mutations
class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        contact_email = graphene.String()

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, description='', contact_email=''):
        organization = Organization.objects.create(
            name=name,
            description=description,
            contact_email=contact_email
        )
        return CreateOrganization(organization=organization)


# Project Mutations
class CreateProject(graphene.Mutation):
    class Arguments:
        organization_id = graphene.UUID(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        start_date = graphene.Date()
        end_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, organization_id, name, description='',
               status='planning', start_date=None, end_date=None):
        # Get current organization from middleware
        current_org = get_current_organization()
        if not current_org:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Verify user is creating project for their current organization
        if str(organization_id) != str(current_org.id):
            raise GraphQLError("You can only create projects for your current organization")

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            raise GraphQLError(f"Organization not found")

        project = Project.objects.create(
            organization=organization,
            name=name,
            description=description,
            status=status,
            start_date=start_date,
            end_date=end_date
        )
        return CreateProject(project=project)


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        start_date = graphene.Date()
        end_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, id, **kwargs):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate project belongs to current organization
        try:
            project = Project.objects.get(id=id, organization=organization)
        except Project.DoesNotExist:
            raise GraphQLError(f"Project not found in your organization")

        for key, value in kwargs.items():
            if value is not None:
                setattr(project, key, value)

        project.save()
        return UpdateProject(project=project)


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate project belongs to current organization
        try:
            project = Project.objects.get(id=id, organization=organization)
            project.delete()
            return DeleteProject(success=True)
        except Project.DoesNotExist:
            raise GraphQLError(f"Project not found in your organization")


# Task Mutations
class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.UUID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        due_date = graphene.DateTime()
        order = graphene.Int()

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, title, description='',
               status='todo', priority='medium', due_date=None, order=0):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate project belongs to current organization
        try:
            project = Project.objects.select_related('organization').get(
                id=project_id,
                organization=organization
            )
        except Project.DoesNotExist:
            raise GraphQLError(f"Project not found in your organization")

        task = Task.objects.create(
            project=project,
            title=title,
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            order=order
        )

        # Broadcast task creation via WebSocket
        broadcast_task_event('task_create', task, str(project_id))

        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        due_date = graphene.DateTime()
        order = graphene.Int()

    task = graphene.Field(TaskType)

    def mutate(self, info, id, **kwargs):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate task belongs to current organization
        try:
            task = Task.objects.select_related('project__organization').get(
                id=id,
                project__organization=organization
            )
        except Task.DoesNotExist:
            raise GraphQLError(f"Task not found in your organization")

        for key, value in kwargs.items():
            if value is not None:
                setattr(task, key, value)

        task.save()

        # Broadcast task update via WebSocket
        broadcast_task_event('task_update', task)

        return UpdateTask(task=task)


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate task belongs to current organization
        try:
            task = Task.objects.select_related('project__organization').get(
                id=id,
                project__organization=organization
            )
            project_id = str(task.project.id)
            task_id = str(task.id)

            # Broadcast task deletion via WebSocket BEFORE deleting
            broadcast_task_delete(task_id, project_id)

            task.delete()
            return DeleteTask(success=True)
        except Task.DoesNotExist:
            raise GraphQLError(f"Task not found in your organization")


# Comment Mutations
class CreateComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.UUID(required=True)
        author_name = graphene.String(required=True)
        author_email = graphene.String()
        content = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, author_name, content, author_email=''):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate task belongs to current organization
        try:
            task = Task.objects.select_related('project__organization').get(
                id=task_id,
                project__organization=organization
            )
        except Task.DoesNotExist:
            raise GraphQLError(f"Task not found in your organization")

        comment = TaskComment.objects.create(
            task=task,
            author_name=author_name,
            author_email=author_email,
            content=content
        )

        # Broadcast comment creation via WebSocket
        broadcast_comment_event(comment, task)

        return CreateComment(comment=comment)


class UpdateComment(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        content = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, id, content):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate comment's task belongs to current organization
        try:
            comment = TaskComment.objects.select_related('task__project__organization').get(
                id=id,
                task__project__organization=organization
            )
            comment.content = content
            comment.save()
            return UpdateComment(comment=comment)
        except TaskComment.DoesNotExist:
            raise GraphQLError(f"Comment not found in your organization")


class DeleteComment(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        # Get current organization from middleware
        organization = get_current_organization()
        if not organization:
            raise GraphQLError("Organization not specified. Please select an organization.")

        # Validate comment's task belongs to current organization
        try:
            comment = TaskComment.objects.select_related('task__project__organization').get(
                id=id,
                task__project__organization=organization
            )
            comment.delete()
            return DeleteComment(success=True)
        except TaskComment.DoesNotExist:
            raise GraphQLError(f"Comment not found in your organization")


# Root Mutation
class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()

    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()

    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()

    create_comment = CreateComment.Field()
    update_comment = UpdateComment.Field()
    delete_comment = DeleteComment.Field()
