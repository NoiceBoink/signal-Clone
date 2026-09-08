"""
Message routes: send messages, get message history, mark as read.
Integrates with WebSocket manager for real-time delivery.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
import uuid
from datetime import datetime

from .database import get_db
from .auth import get_current_user
from .models import MessageCreate
from .websocket_manager import manager

router = APIRouter(prefix="/api/conversations", tags=["Messages"])
messages_api_router = APIRouter(prefix="/api/messages", tags=["Messages"])


@messages_api_router.get("/search")
async def search_messages(
    q: str = Query(..., min_length=1),
    conversation_id: str | None = Query(default=None),
    contact_id: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Search messages across conversations or scoped to a conversation/contact."""
    conditions = [
        "cm.user_id = ?",
        "m.message_type != 'system'",
        "LOWER(m.content) LIKE ?",
    ]
    params = [current_user["id"], f"%{q.lower()}%"]

    if conversation_id:
        conditions.append("m.conversation_id = ?")
        params.append(conversation_id)
    elif contact_id:
        conditions.append("""m.conversation_id IN (
            SELECT conversation_id FROM conversation_members WHERE user_id = ?
        )""")
        params.append(contact_id)

    query = f"""
        SELECT DISTINCT m.id, m.conversation_id, m.sender_id, m.content, m.message_type, m.status, m.created_at,
               u.display_name as sender_name, u.initials as sender_initials,
               u.avatar_color as sender_avatar_color, u.username as sender_username,
               c.is_group, c.group_name
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        JOIN conversations c ON c.id = m.conversation_id
        JOIN conversation_members cm ON cm.conversation_id = c.id
        WHERE {" AND ".join(conditions)}
        ORDER BY m.created_at DESC
        LIMIT 50
    """
    cursor = await db.execute(query, tuple(params))
    rows = await cursor.fetchall()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "conversation_id": r["conversation_id"],
            "sender_id": r["sender_id"],
            "content": r["content"],
            "message_type": r["message_type"],
            "status": r["status"],
            "created_at": r["created_at"],
            "is_group": bool(r["is_group"]),
            "group_name": r["group_name"],
            "sender": {
                "id": r["sender_id"],
                "username": r["sender_username"],
                "display_name": r["sender_name"],
                "avatar_color": r["sender_avatar_color"],
                "initials": r["sender_initials"],
            },
        })
    return results


async def _get_member_ids(db, conversation_id: str) -> list[str]:
    cursor = await db.execute(
        "SELECT user_id FROM conversation_members WHERE conversation_id = ?",
        (conversation_id,),
    )
    return [r["user_id"] for r in await cursor.fetchall()]


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    limit: int = Query(default=50, le=200),
    before: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get messages for a conversation, paginated (newest first in response, but reversed for display)."""
    # Verify membership
    cursor = await db.execute(
        "SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
        (conversation_id, current_user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member")

    if before:
        cursor = await db.execute(
            """SELECT m.*, u.display_name as sender_name, u.initials as sender_initials,
                      u.avatar_color as sender_avatar_color, u.username as sender_username
               FROM messages m
               JOIN users u ON u.id = m.sender_id
               WHERE m.conversation_id = ? AND m.created_at < ?
               ORDER BY m.created_at DESC LIMIT ?""",
            (conversation_id, before, limit),
        )
    else:
        cursor = await db.execute(
            """SELECT m.*, u.display_name as sender_name, u.initials as sender_initials,
                      u.avatar_color as sender_avatar_color, u.username as sender_username
               FROM messages m
               JOIN users u ON u.id = m.sender_id
               WHERE m.conversation_id = ?
               ORDER BY m.created_at DESC LIMIT ?""",
            (conversation_id, limit),
        )

    rows = await cursor.fetchall()

    messages = []
    for r in reversed(rows):  # Reverse to get chronological order
        # Check read status for sent messages
        status = r["status"]
        if r["sender_id"] == current_user["id"] and r["message_type"] != "system":
            # Check if any other member has read it
            rcursor = await db.execute(
                "SELECT COUNT(*) as cnt FROM read_receipts WHERE message_id = ? AND user_id != ?",
                (r["id"], current_user["id"]),
            )
            rrow = await rcursor.fetchone()
            if rrow and rrow["cnt"] > 0:
                status = "read"
            else:
                # Check if delivered (other user is/was online)
                member_ids = await _get_member_ids(db, conversation_id)
                other_ids = [uid for uid in member_ids if uid != current_user["id"]]
                if any(manager.is_online(uid) for uid in other_ids):
                    status = "delivered"

        messages.append({
            "id": r["id"],
            "conversation_id": r["conversation_id"],
            "sender_id": r["sender_id"],
            "content": r["content"],
            "message_type": r["message_type"],
            "status": status,
            "created_at": r["created_at"],
            "sender": {
                "id": r["sender_id"],
                "username": r["sender_username"],
                "display_name": r["sender_name"],
                "avatar_color": r["sender_avatar_color"],
                "initials": r["sender_initials"],
            },
        })

    return messages


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Send a message to a conversation. Broadcasts via WebSocket."""
    # Verify membership
    cursor = await db.execute(
        "SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
        (conversation_id, current_user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member")

    member_ids = await _get_member_ids(db, conversation_id)
    other_ids = [uid for uid in member_ids if uid != current_user["id"]]

    # Check if any other member has this conversation open right now
    is_viewing = any(
        manager.is_online(uid) and manager.get_active_conversation(uid) == conversation_id
        for uid in other_ids
    )
    is_delivered = any(manager.is_online(uid) for uid in other_ids)
    initial_status = "read" if is_viewing else ("delivered" if is_delivered else "sent")

    msg_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    await db.execute(
        """INSERT INTO messages (id, conversation_id, sender_id, content, message_type, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (msg_id, conversation_id, current_user["id"], data.content, data.message_type, initial_status, now),
    )

    if is_viewing:
        for uid in other_ids:
            if manager.is_online(uid) and manager.get_active_conversation(uid) == conversation_id:
                await db.execute(
                    "INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)",
                    (msg_id, uid),
                )

    await db.execute(
        "UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id)
    )
    await db.commit()

    message_response = {
        "id": msg_id,
        "conversation_id": conversation_id,
        "sender_id": current_user["id"],
        "content": data.content,
        "message_type": data.message_type,
        "status": initial_status,
        "created_at": now,
        "sender": {
            "id": current_user["id"],
            "username": current_user["username"],
            "display_name": current_user["display_name"],
            "avatar_color": current_user.get("avatar_color", "#edd0c9"),
            "initials": current_user.get("initials", "?"),
        },
    }

    # Broadcast to all conversation members
    await manager.broadcast_to_conversation(
        member_ids,
        {"type": "new_message", "message": message_response},
        exclude_id=current_user["id"],
    )

    # Also send back to the sender with confirmed status
    await manager.send_personal(
        current_user["id"],
        {"type": "message_sent", "message": message_response},
    )

    # If delivered or read, send message_status update with conversation_id
    if initial_status in ("delivered", "read"):
        await manager.send_personal(
            current_user["id"],
            {
                "type": "message_status",
                "message_id": msg_id,
                "conversation_id": conversation_id,
                "status": initial_status,
            },
        )

    return message_response


@router.put("/{conversation_id}/messages/{message_id}/read")
async def mark_as_read(
    conversation_id: str,
    message_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Mark a message as read. Notifies the sender via WebSocket."""
    await db.execute(
        "INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)",
        (message_id, current_user["id"]),
    )
    await db.execute(
        "UPDATE messages SET status = 'read' WHERE id = ? AND sender_id != ?",
        (message_id, current_user["id"]),
    )
    await db.commit()

    # Notify the sender
    cursor = await db.execute(
        "SELECT sender_id FROM messages WHERE id = ?", (message_id,)
    )
    msg = await cursor.fetchone()
    if msg and msg["sender_id"] != current_user["id"]:
        await manager.send_personal(
            msg["sender_id"],
            {
                "type": "message_status",
                "message_id": message_id,
                "conversation_id": conversation_id,
                "status": "read",
                "read_by": current_user["id"],
            },
        )

    return {"ok": True}


@router.put("/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Mark all messages in a conversation as read."""
    cursor = await db.execute(
        """SELECT id, sender_id FROM messages
           WHERE conversation_id = ? AND sender_id != ? AND message_type != 'system'
           AND id NOT IN (SELECT message_id FROM read_receipts WHERE user_id = ?)""",
        (conversation_id, current_user["id"], current_user["id"]),
    )
    unread_messages = await cursor.fetchall()

    sender_ids = set()
    for msg in unread_messages:
        await db.execute(
            "INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)",
            (msg["id"], current_user["id"]),
        )
        await db.execute(
            "UPDATE messages SET status = 'read' WHERE id = ?", (msg["id"],)
        )
        sender_ids.add(msg["sender_id"])

    await db.commit()

    # Notify senders that their messages were read
    for sender_id in sender_ids:
        await manager.send_personal(
            sender_id,
            {
                "type": "messages_read",
                "conversation_id": conversation_id,
                "read_by": current_user["id"],
            },
        )

    return {"ok": True}
