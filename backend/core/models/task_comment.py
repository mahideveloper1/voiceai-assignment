from django.db import models
import uuid


class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author_name = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'task_comments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', '-created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.author_name} on {self.task.title}"
