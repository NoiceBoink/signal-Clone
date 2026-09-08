"""
SQLite database setup using aiosqlite for async access.
Creates all tables on startup and provides a dependency for route handlers.
"""

import aiosqlite
import os

DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "signal_clone.db"
    ),
)


async def get_db():
    """FastAPI dependency that yields an async SQLite connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    """Create all tables if they don't exist."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("PRAGMA foreign_keys=ON")

        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                phone TEXT,
                display_name TEXT NOT NULL,
                avatar_color TEXT DEFAULT '#edd0c9',
                initials TEXT,
                password_hash TEXT NOT NULL,
                is_online INTEGER DEFAULT 0,
                last_seen TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL REFERENCES users(id),
                contact_user_id TEXT NOT NULL REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                UNIQUE(user_id, contact_user_id)
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                is_group INTEGER DEFAULT 0,
                group_name TEXT,
                group_avatar_color TEXT,
                created_by TEXT REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS conversation_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id),
                is_admin INTEGER DEFAULT 0,
                joined_at TEXT DEFAULT (datetime('now')),
                UNIQUE(conversation_id, user_id)
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                sender_id TEXT NOT NULL REFERENCES users(id),
                content TEXT NOT NULL,
                message_type TEXT DEFAULT 'text',
                status TEXT DEFAULT 'sent',
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS read_receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id),
                read_at TEXT DEFAULT (datetime('now')),
                UNIQUE(message_id, user_id)
            )
        """)

        # Performance indexes
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_conversation "
            "ON messages(conversation_id, created_at)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_conv_members_user "
            "ON conversation_members(user_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_conv_members_conv "
            "ON conversation_members(conversation_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_contacts_user "
            "ON contacts(user_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_read_receipts_msg "
            "ON read_receipts(message_id)"
        )

        await db.commit()
