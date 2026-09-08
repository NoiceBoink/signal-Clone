"""
FastAPI application entry point.
Sets up CORS, includes all routers, and handles WebSocket connections.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import logging

from .database import init_db, get_db
from .auth import router as auth_router, get_current_user
from .contacts import router as contacts_router
from .conversations import router as conversations_router
from .messages import router as messages_router, messages_api_router
from .websocket_manager import manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup and seed if empty."""
    logger.info("Initializing database...")
    await init_db()
    try:
        from .seed import seed
        await seed()
        logger.info("Database verification and seeding complete.")
    except Exception as e:
        logger.warning(f"Database seed check skipped or encountered error: {e}")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Signal Clone API",
    description="Backend API for the Signal messaging clone",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for local and cloud environments (Vercel, Render, Netlify)
import os
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
]
if allowed_origins_env and allowed_origins_env != "*":
    for o in allowed_origins_env.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allowed_origins_env == "*" else origins,
    allow_origin_regex=None if allowed_origins_env == "*" else r"https://.*\.vercel\.app|https://.*\.netlify\.app|https://.*\.onrender\.com",
    allow_credentials=True if allowed_origins_env != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(auth_router)
app.include_router(contacts_router)
app.include_router(conversations_router)
app.include_router(messages_router)
app.include_router(messages_api_router)


@app.get("/")
@app.head("/")
@app.get("/health")
@app.head("/health")
@app.get("/api/health")
@app.head("/api/health")
async def health_check():
    return {"status": "ok", "service": "Signal Clone API"}


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time messaging.
    
    Client sends JSON messages with a 'type' field:
    - { "type": "typing", "conversation_id": "...", "is_typing": true/false }
    - { "type": "read", "conversation_id": "...", "message_id": "..." }
    
    Server pushes:
    - { "type": "new_message", "message": {...} }
    - { "type": "message_sent", "message": {...} }
    - { "type": "message_status", "message_id": "...", "status": "..." }
    - { "type": "typing", "conversation_id": "...", "user_id": "...", "is_typing": true/false }
    - { "type": "user_status", "user_id": "...", "is_online": true/false }
    - { "type": "new_conversation", "conversation": {...} }
    - { "type": "conversation_updated", "conversation": {...} }
    - { "type": "messages_read", "conversation_id": "...", "read_by": "..." }
    """
    await manager.connect(user_id, websocket)

    # Notify contacts that this user is online
    import aiosqlite
    from .database import DATABASE_PATH

    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("UPDATE users SET is_online = 1 WHERE id = ?", (user_id,))
        await db.commit()

        # Find all messages sent to conversations this user belongs to that are currently only 'sent'
        cursor = await db.execute(
            """SELECT m.id, m.conversation_id, m.sender_id
               FROM messages m
               JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
               WHERE cm.user_id = ? AND m.sender_id != ? AND m.status = 'sent'""",
            (user_id, user_id),
        )
        undelivered_rows = await cursor.fetchall()
        if undelivered_rows:
            msg_ids = [r["id"] for r in undelivered_rows]
            placeholders = ",".join("?" * len(msg_ids))
            await db.execute(
                f"UPDATE messages SET status = 'delivered' WHERE id IN ({placeholders})",
                msg_ids,
            )
            await db.commit()

        # Get all conversation member IDs to notify
        cursor = await db.execute(
            """SELECT DISTINCT cm2.user_id FROM conversation_members cm1
               JOIN conversation_members cm2 ON cm2.conversation_id = cm1.conversation_id
               WHERE cm1.user_id = ? AND cm2.user_id != ?""",
            (user_id, user_id),
        )
        peer_ids = [r["user_id"] for r in await cursor.fetchall()]

    # Notify senders that their messages have now been delivered
    if undelivered_rows:
        for r in undelivered_rows:
            await manager.send_personal(
                r["sender_id"],
                {
                    "type": "message_status",
                    "message_id": r["id"],
                    "conversation_id": r["conversation_id"],
                    "status": "delivered",
                },
            )

    for pid in peer_ids:
        await manager.send_personal(pid, {
            "type": "user_status",
            "user_id": user_id,
            "is_online": True,
        })

    # Send all currently online peers to the newly connected user
    for online_id in manager.get_online_user_ids():
        if online_id != user_id and online_id in peer_ids:
            await manager.send_personal(user_id, {
                "type": "user_status",
                "user_id": online_id,
                "is_online": True,
            })

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type")

            if msg_type == "active_conversation":
                conv_id = msg.get("conversation_id")
                manager.set_active_conversation(user_id, conv_id)
                if conv_id:
                    async with aiosqlite.connect(DATABASE_PATH) as db:
                        db.row_factory = aiosqlite.Row
                        cursor = await db.execute(
                            """SELECT id, sender_id FROM messages
                               WHERE conversation_id = ? AND sender_id != ? AND message_type != 'system'
                               AND id NOT IN (SELECT message_id FROM read_receipts WHERE user_id = ?)""",
                            (conv_id, user_id, user_id),
                        )
                        unread_rows = await cursor.fetchall()
                        if unread_rows:
                            sender_ids = set()
                            for r in unread_rows:
                                await db.execute(
                                    "INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)",
                                    (r["id"], user_id),
                                )
                                await db.execute(
                                    "UPDATE messages SET status = 'read' WHERE id = ?", (r["id"],)
                                )
                                sender_ids.add(r["sender_id"])
                            await db.commit()

                            for sid in sender_ids:
                                await manager.send_personal(
                                    sid,
                                    {
                                        "type": "messages_read",
                                        "conversation_id": conv_id,
                                        "read_by": user_id,
                                    },
                                )

            elif msg_type == "typing":
                # Broadcast typing indicator to conversation members
                conv_id = msg.get("conversation_id")
                if conv_id:
                    async with aiosqlite.connect(DATABASE_PATH) as db:
                        db.row_factory = aiosqlite.Row
                        cursor = await db.execute(
                            "SELECT user_id FROM conversation_members WHERE conversation_id = ?",
                            (conv_id,),
                        )
                        member_ids = [r["user_id"] for r in await cursor.fetchall()]

                    await manager.broadcast_to_conversation(
                        member_ids,
                        {
                            "type": "typing",
                            "conversation_id": conv_id,
                            "user_id": user_id,
                            "is_typing": msg.get("is_typing", False),
                        },
                        exclude_id=user_id,
                    )

            elif msg_type == "read":
                # Mark message as read and notify sender
                conv_id = msg.get("conversation_id")
                message_id = msg.get("message_id")
                if conv_id and message_id:
                    async with aiosqlite.connect(DATABASE_PATH) as db:
                        db.row_factory = aiosqlite.Row
                        await db.execute(
                            "INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)",
                            (message_id, user_id),
                        )
                        await db.execute(
                            "UPDATE messages SET status = 'read' WHERE id = ? AND sender_id != ?",
                            (message_id, user_id),
                        )
                        await db.commit()

                        cursor = await db.execute(
                            "SELECT sender_id FROM messages WHERE id = ?", (message_id,)
                        )
                        row = await cursor.fetchone()
                        if row and row["sender_id"] != user_id:
                            await manager.send_personal(
                                row["sender_id"],
                                {
                                    "type": "message_status",
                                    "message_id": message_id,
                                    "conversation_id": conv_id,
                                    "status": "read",
                                    "read_by": user_id,
                                },
                            )

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        manager.disconnect(user_id, websocket)

        # Broadcast typing stopped to peers immediately on disconnect
        for pid in peer_ids:
            await manager.send_personal(pid, {
                "type": "typing",
                "conversation_id": None,
                "user_id": user_id,
                "is_typing": False,
            })

        # Only mark offline if all active connections for this user are closed
        if not manager.is_online(user_id):
            async with aiosqlite.connect(DATABASE_PATH) as db:
                from datetime import datetime
                now = datetime.utcnow().isoformat()
                await db.execute(
                    "UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?",
                    (now, user_id),
                )
                await db.commit()

            # Notify peers
            for pid in peer_ids:
                await manager.send_personal(pid, {
                    "type": "user_status",
                    "user_id": user_id,
                    "is_online": False,
                })
