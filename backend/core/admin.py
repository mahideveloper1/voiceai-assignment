from django.contrib import admin
from core.models import Organization, Project, Task, TaskComment


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'created_at']
    search_fields = ['name', 'slug']
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'status', 'start_date', 'end_date', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['status', 'organization', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['organization']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'due_date', 'created_at']
    search_fields = ['title', 'description']
    list_filter = ['status', 'priority', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['project']


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author_name', 'created_at']
    search_fields = ['content', 'author_name']
    list_filter = ['created_at']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['task']
