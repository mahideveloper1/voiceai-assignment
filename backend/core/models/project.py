from django.db import models
import uuid


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', '-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

    @property
    def task_stats(self):
        """Calculate task statistics for this project"""
        tasks = self.tasks.all()
        total = tasks.count()
        if total == 0:
            return {
                'total': 0,
                'todo': 0,
                'in_progress': 0,
                'completed': 0,
                'completion_rate': 0
            }

        completed = tasks.filter(status='completed').count()
        return {
            'total': total,
            'todo': tasks.filter(status='todo').count(),
            'in_progress': tasks.filter(status='in_progress').count(),
            'completed': completed,
            'completion_rate': round((completed / total) * 100, 2)
        }
