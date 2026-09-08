"""
WebSocket connection manager for real-time messaging.
Maintains a map of user_id -> list of active WebSocket connections.
Supports broadcasting to conversation members and personal messages.
"""

from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections per user."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.active_conversations: Dict[str, str] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        """Accept a WebSocket and register it for the given user."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected (total: {len(self.active_connections[user_id])})")

    def disconnect(self, user_id: str, websocket: WebSocket):
        """Remove a WebSocket connection for a user."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                if user_id in self.active_conversations:
                    del self.active_conversations[user_id]
        logger.info(f"User {user_id} disconnected")

    def set_active_conversation(self, user_id: str, conversation_id: str | None):
        """Track which conversation a user is currently looking at."""
        if conversation_id:
            self.active_conversations[user_id] = conversation_id
        elif user_id in self.active_conversations:
            del self.active_conversations[user_id]

    def get_active_conversation(self, user_id: str) -> str | None:
        """Get the conversation ID currently open on user's screen."""
        return self.active_conversations.get(user_id)

    async def send_personal(self, user_id: str, message: dict):
        """Send a message to all connections of a specific user."""
        if user_id not in self.active_connections:
            return
        data = json.dumps(message, default=str)
        dead: List[WebSocket] = []
        for ws in self.active_connections[user_id]:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        # Clean up broken connections
        for ws in dead:
            if ws in self.active_connections.get(user_id, []):
                self.active_connections[user_id].remove(ws)
        if user_id in self.active_connections and not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def broadcast_to_conversation(
        self, member_ids: List[str], message: dict, exclude_id: str | None = None
    ):
        """Send a message to all members of a conversation, optionally excluding one."""
        for uid in member_ids:
            if uid != exclude_id:
                await self.send_personal(uid, message)

    def is_online(self, user_id: str) -> bool:
        return (
            user_id in self.active_connections
            and len(self.active_connections[user_id]) > 0
        )

    def get_online_user_ids(self) -> List[str]:
        return list(self.active_connections.keys())


# Singleton instance used across the app
manager = ConnectionManager()
