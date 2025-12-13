from django.urls import re_path
from core.consumers.task_consumer import TaskConsumer

websocket_urlpatterns = [
    re_path(r'ws/projects/(?P<project_id>[0-9a-f-]+)/$', TaskConsumer.as_asgi()),
]
