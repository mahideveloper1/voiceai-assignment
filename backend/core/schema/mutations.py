import graphene
from graphql import GraphQLError
from core.models import Organization, Project, Task, TaskComment
from core.schema.types import OrganizationType, ProjectType, TaskType, TaskCommentType


# Organization Mutations
class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, description=''):
        organization = Organization.objects.create(
            name=name,
            description=description
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
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            raise GraphQLError(f"Organization with id '{organization_id}' not found")

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
        try:
            project = Project.objects.get(id=id)
        except Project.DoesNotExist:
            raise GraphQLError(f"Project with id '{id}' not found")

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
        try:
            project = Project.objects.get(id=id)
            project.delete()
            return DeleteProject(success=True)
        except Project.DoesNotExist:
            raise GraphQLError(f"Project with id '{id}' not found")


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
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise GraphQLError(f"Project with id '{project_id}' not found")

        task = Task.objects.create(
            project=project,
            title=title,
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            order=order
        )
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
        try:
            task = Task.objects.get(id=id)
        except Task.DoesNotExist:
            raise GraphQLError(f"Task with id '{id}' not found")

        for key, value in kwargs.items():
            if value is not None:
                setattr(task, key, value)

        task.save()
        return UpdateTask(task=task)


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            task = Task.objects.get(id=id)
            task.delete()
            return DeleteTask(success=True)
        except Task.DoesNotExist:
            raise GraphQLError(f"Task with id '{id}' not found")


# Comment Mutations
class CreateComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.UUID(required=True)
        author_name = graphene.String(required=True)
        content = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, author_name, content):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise GraphQLError(f"Task with id '{task_id}' not found")

        comment = TaskComment.objects.create(
            task=task,
            author_name=author_name,
            content=content
        )
        return CreateComment(comment=comment)


class UpdateComment(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        content = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, id, content):
        try:
            comment = TaskComment.objects.get(id=id)
            comment.content = content
            comment.save()
            return UpdateComment(comment=comment)
        except TaskComment.DoesNotExist:
            raise GraphQLError(f"Comment with id '{id}' not found")


class DeleteComment(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            comment = TaskComment.objects.get(id=id)
            comment.delete()
            return DeleteComment(success=True)
        except TaskComment.DoesNotExist:
            raise GraphQLError(f"Comment with id '{id}' not found")


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
