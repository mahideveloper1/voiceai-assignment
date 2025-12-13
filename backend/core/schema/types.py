import graphene
from graphene_django import DjangoObjectType
from core.models import Organization, Project, Task, TaskComment


class TaskStatsType(graphene.ObjectType):
    total = graphene.Int()
    todo = graphene.Int()
    in_progress = graphene.Int()
    completed = graphene.Int()
    completion_rate = graphene.Float()


class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = '__all__'


class ProjectType(DjangoObjectType):
    task_stats = graphene.Field(TaskStatsType)

    class Meta:
        model = Project
        fields = '__all__'

    def resolve_task_stats(self, info):
        stats = self.task_stats
        return TaskStatsType(**stats)


class TaskType(DjangoObjectType):
    comment_count = graphene.Int()

    class Meta:
        model = Task
        fields = '__all__'

    def resolve_comment_count(self, info):
        return self.comments.count()


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = '__all__'
