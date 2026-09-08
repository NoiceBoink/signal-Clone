"""
Contact management routes.
Users can add/remove contacts and search for other users.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from .database import get_db
from .auth import get_current_user
from .models import ContactAdd

router = APIRouter(prefix="/api", tags=["Contacts"])


@router.get("/contacts")
async def list_contacts(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """List all contacts for the current user."""
    cursor = await db.execute(
        """SELECT u.id, u.username, u.phone, u.display_name, u.avatar_color,
                  u.initials, u.is_online, u.last_seen
           FROM contacts c
           JOIN users u ON u.id = c.contact_user_id
           WHERE c.user_id = ?
           ORDER BY u.display_name""",
        (current_user["id"],),
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
            "is_online": bool(r["is_online"]),
            "last_seen": r["last_seen"],
        }
        for r in rows
    ]


@router.post("/contacts")
async def add_contact(data: ContactAdd, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Add a contact by username or phone number."""
    if not data.username and not data.phone:
        raise HTTPException(status_code=400, detail="Provide username or phone")

    if data.username:
        cursor = await db.execute("SELECT * FROM users WHERE username = ?", (data.username,))
    else:
        cursor = await db.execute("SELECT * FROM users WHERE phone = ?", (data.phone,))

    target = await cursor.fetchone()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target = dict(target)
    if target["id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself")

    # Check if already a contact
    cursor = await db.execute(
        "SELECT id FROM contacts WHERE user_id = ? AND contact_user_id = ?",
        (current_user["id"], target["id"]),
    )
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Already in contacts")

    # Add bidirectional contact
    await db.execute(
        "INSERT INTO contacts (user_id, contact_user_id) VALUES (?, ?)",
        (current_user["id"], target["id"]),
    )
    await db.execute(
        "INSERT OR IGNORE INTO contacts (user_id, contact_user_id) VALUES (?, ?)",
        (target["id"], current_user["id"]),
    )
    await db.commit()

    return {
        "id": target["id"],
        "username": target["username"],
        "phone": target.get("phone"),
        "display_name": target["display_name"],
        "avatar_color": target.get("avatar_color", "#edd0c9"),
        "initials": target.get("initials", "?"),
        "is_online": bool(target.get("is_online", 0)),
        "last_seen": target.get("last_seen"),
    }


@router.delete("/contacts/{contact_user_id}")
async def remove_contact(
    contact_user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Remove a user from contacts."""
    await db.execute(
        "DELETE FROM contacts WHERE user_id = ? AND contact_user_id = ?",
        (current_user["id"], contact_user_id),
    )
    await db.commit()
    return {"ok": True}


@router.get("/users/search")
async def search_users(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Search for users by username or display name."""
    pattern = f"%{q}%"
    cursor = await db.execute(
        """SELECT id, username, phone, display_name, avatar_color, initials,
                  is_online, last_seen
           FROM users
           WHERE id != ? AND (username LIKE ? OR display_name LIKE ? OR phone LIKE ?)
           LIMIT 20""",
        (current_user["id"], pattern, pattern, pattern),
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
            "is_online": bool(r["is_online"]),
            "last_seen": r["last_seen"],
        }
        for r in rows
    ]
