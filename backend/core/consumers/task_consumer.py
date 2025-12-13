from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import json


class TaskConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs'].get('project_id')
        self.room_group_name = f'project_{self.project_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        message_type = content.get('type')

        if message_type == 'subscribe':
            await self.send_json({
                'type': 'subscription_success',
                'message': 'Subscribed to project updates'
            })

    async def task_update(self, event):
        await self.send_json({
            'type': 'task_updated',
            'task': event['task']
        })

    async def task_create(self, event):
        await self.send_json({
            'type': 'task_created',
            'task': event['task']
        })

    async def task_delete(self, event):
        await self.send_json({
            'type': 'task_deleted',
            'task_id': event['task_id']
        })

    async def comment_create(self, event):
        await self.send_json({
            'type': 'comment_created',
            'comment': event['comment']
        })
