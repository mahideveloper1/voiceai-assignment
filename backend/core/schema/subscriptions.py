import graphene
from core.schema.types import TaskType, TaskCommentType


class TaskSubscription(graphene.ObjectType):
    task_updated = graphene.Field(TaskType, project_id=graphene.UUID())
    task_created = graphene.Field(TaskType, project_id=graphene.UUID())
    task_deleted = graphene.Field(graphene.UUID, project_id=graphene.UUID())

    def resolve_task_updated(root, info, project_id=None):
        # This will be triggered when a task is updated via WebSocket
        return root

    def resolve_task_created(root, info, project_id=None):
        # This will be triggered when a task is created via WebSocket
        return root

    def resolve_task_deleted(root, info, project_id=None):
        # This will be triggered when a task is deleted via WebSocket
        return root


class CommentSubscription(graphene.ObjectType):
    comment_created = graphene.Field(TaskCommentType, task_id=graphene.UUID())

    def resolve_comment_created(root, info, task_id=None):
        # This will be triggered when a comment is created via WebSocket
        return root


class Subscription(TaskSubscription, CommentSubscription, graphene.ObjectType):
    pass
