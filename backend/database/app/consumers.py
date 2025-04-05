from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import WasteStatistics, User

class StatsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
        # Get supabase_uid from query string
        supabase_uid = self.scope['query_string'].decode().split('=')[1]
        if supabase_uid:
            self.supabase_uid = supabase_uid
            await self.channel_layer.group_add(
                f"user_{supabase_uid}",
                self.channel_name
            )
    
    async def disconnect(self, close_code):
        if hasattr(self, 'supabase_uid'):
            await self.channel_layer.group_discard(
                f"user_{self.supabase_uid}",
                self.channel_name
            )
    
    async def stats_update(self, event):
        # Send stats update to WebSocket
        await self.send_json(event['stats'])