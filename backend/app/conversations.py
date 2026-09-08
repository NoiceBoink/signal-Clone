"""
Conversation and group management routes.
Handles creation/listing of 1:1 and group conversations, member management.
"""

from fastapi import APIRouter, Depends, HTTPException
import uuid
from datetime import datetime

from .database import get_db
from .auth import get_current_user
from .models import ConversationCreate, GroupCreate, GroupUpdate, AddMember
from .websocket_manager import manager

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


async def _get_conversation_members(db, conversation_id: str) -> list[dict]:
    """Get all members of a conversation with user details."""
    cursor = await db.execute(
        """SELECT u.id, u.username, u.phone, u.display_name, u.avatar_color,
                  u.initials, u.is_online, u.last_seen, cm.is_admin
           FROM conversation_members cm
           JOIN users u ON u.id = cm.user_id
           WHERE cm.conversation_id = ?""",
        (conversation_id,),
    )
    rows = await cursor.fetchall()
    return [
        {
            "id": r["id"],
            "username": r["username"],
            "phone": r["phone"],
            "display_name": r["display_name"],
            "avatar_color": r["avatar_color"],
            "initials": r["initials"],
            "is_online": manager.is_online(r["id"]),
            "last_seen": r["last_seen"],
            "is_admin": bool(r["is_admin"]),
        }
        for r in rows
    ]


async def _get_member_ids(db, conversation_id: str) -> list[str]:
    cursor = await db.execute(
        "SELECT user_id FROM conversation_members WHERE conversation_id = ?",
        (conversation_id,),
    )
    return [r["user_id"] for r in await cursor.fetchall()]


async def _get_last_message(db, conversation_id: str) -> dict | None:
    cursor = await db.execute(
        """SELECT m.*, u.display_name as sender_name, u.initials as sender_initials,
                  u.avatar_color as sender_avatar_color
           FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.conversation_id = ?
           ORDER BY m.created_at DESC LIMIT 1""",
        (conversation_id,),
    )
    row = await cursor.fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "conversation_id": row["conversation_id"],
        "sender_id": row["sender_id"],
        "content": row["content"],
        "message_type": row["message_type"],
        "status": row["status"],
        "created_at": row["created_at"],
        "sender": {
            "id": row["sender_id"],
            "username": "",
            "display_name": row["sender_name"],
            "avatar_color": row["sender_avatar_color"],
            "initials": row["sender_initials"],
        },
    }


async def _get_unread_count(db, conversation_id: str, user_id: str) -> int:
    cursor = await db.execute(
        """SELECT COUNT(*) as cnt FROM messages
           WHERE conversation_id = ? AND sender_id != ? AND message_type != 'system'
           AND id NOT IN (
               SELECT message_id FROM read_receipts WHERE user_id = ?
           )""",
        (conversation_id, user_id, user_id),
    )
    row = await cursor.fetchone()
    return row["cnt"] if row else 0


async def _build_conversation_response(db, conv: dict, user_id: str) -> dict:
    members = await _get_conversation_members(db, conv["id"])
    last_msg = await _get_last_message(db, conv["id"])
    unread = await _get_unread_count(db, conv["id"], user_id)
    return {
        "id": conv["id"],
        "is_group": bool(conv["is_group"]),
        "group_name": conv.get("group_name"),
        "group_avatar_color": conv.get("group_avatar_color"),
        "created_by": conv.get("created_by"),
        "created_at": conv["created_at"],
        "updated_at": conv["updated_at"],
        "members": members,
        "last_message": last_msg,
        "unread_count": unread,
    }


# ── Routes ────────────────────────────────────────────────────────────────


@router.get("")
async def list_conversations(
    current_user: dict = Depends(get_current_user), db=Depends(get_db)
):
    """List all conversations for the current user, sorted by last activity."""
    cursor = await db.execute(
        """SELECT c.* FROM conversations c
           JOIN conversation_members cm ON cm.conversation_id = c.id
           WHERE cm.user_id = ?
           ORDER BY c.updated_at DESC""",
        (current_user["id"],),
    )
    rows = await cursor.fetchall()
    result = []
    for row in rows:
        conv = await _build_conversation_response(db, dict(row), current_user["id"])
        result.append(conv)
    return result


@router.post("")
async def create_conversation(
    data: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    if data.user_id == current_user["id"]:
        # Handle Note to Self (single member 1:1 conversation)
        cursor = await db.execute(
            """SELECT c.id FROM conversations c
               JOIN conversation_members cm ON cm.conversation_id = c.id
               WHERE c.is_group = 0 AND cm.user_id = ?
               GROUP BY c.id
               HAVING COUNT(cm.user_id) = 1""",
            (current_user["id"],),
        )
        existing = await cursor.fetchone()
        if existing:
            cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (existing["id"],))
            conv = dict(await cursor.fetchone())
            return await _build_conversation_response(db, conv, current_user["id"])

        conv_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat() + "Z"
        await db.execute(
            "INSERT INTO conversations (id, is_group, created_by, created_at, updated_at) VALUES (?, 0, ?, ?, ?)",
            (conv_id, current_user["id"], now, now),
        )
        await db.execute(
            "INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)",
            (conv_id, current_user["id"]),
        )
        msg_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES (?, ?, ?, ?, 'system', ?)",
            (msg_id, conv_id, current_user["id"], "Note to Self", now),
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
        conv = dict(await cursor.fetchone())
        return await _build_conversation_response(db, conv, current_user["id"])

    # Check if 1:1 conversation already exists between these two users
    cursor = await db.execute(
        """SELECT c.id FROM conversations c
           JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ?
           JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ?
           WHERE c.is_group = 0""",
        (current_user["id"], data.user_id),
    )
    existing = await cursor.fetchone()
    if existing:
        cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (existing["id"],))
        conv = dict(await cursor.fetchone())
        return await _build_conversation_response(db, conv, current_user["id"])

    # Verify target user exists
    cursor = await db.execute("SELECT id FROM users WHERE id = ?", (data.user_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    conv_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    await db.execute(
        "INSERT INTO conversations (id, is_group, created_by, created_at, updated_at) VALUES (?, 0, ?, ?, ?)",
        (conv_id, current_user["id"], now, now),
    )
    await db.execute(
        "INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)",
        (conv_id, current_user["id"]),
    )
    await db.execute(
        "INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)",
        (conv_id, data.user_id),
    )

    # Add system message
    msg_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES (?, ?, ?, ?, 'system', ?)",
        (msg_id, conv_id, current_user["id"], "Conversation started", now),
    )

    await db.commit()

    cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
    conv = dict(await cursor.fetchone())
    response = await _build_conversation_response(db, conv, current_user["id"])

    # Notify the other user via WebSocket
    await manager.send_personal(data.user_id, {
        "type": "new_conversation",
        "conversation": response,
    })

    return response


@router.post("/group")
async def create_group(
    data: GroupCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Create a group conversation."""
    if len(data.member_ids) < 1:
        raise HTTPException(status_code=400, detail="Group must have at least 1 other member")

    conv_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"
    import random
    colors = ["#edd0c9", "#c9d5ed", "#c9edda", "#edd9c9", "#d9c9ed"]
    color = random.choice(colors)

    await db.execute(
        """INSERT INTO conversations (id, is_group, group_name, group_avatar_color, created_by, created_at, updated_at)
           VALUES (?, 1, ?, ?, ?, ?, ?)""",
        (conv_id, data.name, color, current_user["id"], now, now),
    )

    # Add creator as admin
    await db.execute(
        "INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)",
        (conv_id, current_user["id"]),
    )

    # Add other members
    for uid in data.member_ids:
        if uid != current_user["id"]:
            cursor = await db.execute("SELECT id FROM users WHERE id = ?", (uid,))
            if await cursor.fetchone():
                await db.execute(
                    "INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?)",
                    (conv_id, uid),
                )

    # System message
    msg_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES (?, ?, ?, ?, 'system', ?)",
        (msg_id, conv_id, current_user["id"], f'{current_user["display_name"]} created the group "{data.name}"', now),
    )

    await db.commit()

    cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
    conv = dict(await cursor.fetchone())
    response = await _build_conversation_response(db, conv, current_user["id"])

    # Notify all members
    for uid in data.member_ids:
        if uid != current_user["id"]:
            await manager.send_personal(uid, {
                "type": "new_conversation",
                "conversation": response,
            })

    return response


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get a single conversation with its members and last message."""
    # Verify membership
    cursor = await db.execute(
        "SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
        (conversation_id, current_user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member of this conversation")

    cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    conv = await cursor.fetchone()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return await _build_conversation_response(db, dict(conv), current_user["id"])


@router.put("/{conversation_id}")
async def update_group(
    conversation_id: str,
    data: GroupUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update a group conversation (admin only)."""
    cursor = await db.execute(
        "SELECT is_admin FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
        (conversation_id, current_user["id"]),
    )
    member = await cursor.fetchone()
    if not member or not member["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    if data.name:
        await db.execute(
            "UPDATE conversations SET group_name = ?, updated_at = ? WHERE id = ?",
            (data.name, datetime.utcnow().isoformat(), conversation_id),
        )
    await db.commit()

    cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    conv = dict(await cursor.fetchone())
    response = await _build_conversation_response(db, conv, current_user["id"])

    # Notify members
    member_ids = await _get_member_ids(db, conversation_id)
    await manager.broadcast_to_conversation(
        member_ids, {"type": "conversation_updated", "conversation": response}
    )

    return response


@router.post("/{conversation_id}/members")
async def add_member(
    conversation_id: str,
    data: AddMember,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Add a member to a group (admin only)."""
    # Check admin
    cursor = await db.execute(
        "SELECT is_admin FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
        (conversation_id, current_user["id"]),
    )
    member = await cursor.fetchone()
    if not member or not member["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check group
    cursor = await db.execute(
        "SELECT is_group FROM conversations WHERE id = ?", (conversation_id,)
    )
    conv = await cursor.fetchone()
    if not conv or not conv["is_group"]:
        raise HTTPException(status_code=400, detail="Can only add members to groups")

    # Check user exists
    cursor = await db.execute("SELECT display_name FROM users WHERE id = ?", (data.user_id,))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.execute(
        "INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?)",
        (conversation_id, data.user_id),
    )

    # System message
    now = datetime.utcnow().isoformat()
    msg_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES (?, ?, ?, ?, 'system', ?)",
        (msg_id, conversation_id, current_user["id"], f'{user["display_name"]} was added to the group', now),
    )
    await db.execute(
        "UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id)
    )
    await db.commit()

    cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    conv_data = dict(await cursor.fetchone())
    response = await _build_conversation_response(db, conv_data, current_user["id"])

    member_ids = await _get_member_ids(db, conversation_id)
    await manager.broadcast_to_conversation(
        member_ids, {"type": "conversation_updated", "conversation": response}
    )

    return response


@router.delete("/{conversation_id}/members/{user_id}")
async def remove_member(
    conversation_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Remove a member from a group (admin only, or self-leave)."""
    is_self = user_id == current_user["id"]
    if not is_self:
        cursor = await db.execute(
            "SELECT is_admin FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
            (conversation_id, current_user["id"]),
        )
        member = await cursor.fetchone()
        if not member or not member["is_admin"]:
            raise HTTPException(status_code=403, detail="Admin access required")

    # Get user name for system message
    cursor = await db.execute("SELECT display_name FROM users WHERE id = ?", (user_id,))
    user = await cursor.fetchone()
    name = user["display_name"] if user else "Unknown"

    await db.execute(
        "DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
        (conversation_id, user_id),
    )

    now = datetime.utcnow().isoformat()
    msg_id = str(uuid.uuid4())
    action = "left the group" if is_self else "was removed from the group"
    await db.execute(
        "INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES (?, ?, ?, ?, 'system', ?)",
        (msg_id, conversation_id, current_user["id"], f"{name} {action}", now),
    )
    await db.execute(
        "UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id)
    )
    await db.commit()

    member_ids = await _get_member_ids(db, conversation_id)
    cursor = await db.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
    conv_data = dict(await cursor.fetchone())
    response = await _build_conversation_response(db, conv_data, current_user["id"])
    await manager.broadcast_to_conversation(
        member_ids + [user_id], {"type": "conversation_updated", "conversation": response}
    )

    return {"ok": True}
