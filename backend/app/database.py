"""
Database management supporting both local SQLite (via aiosqlite) and Turso Cloud (via libsql-client).
Automatically selects Turso Cloud when TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env.
"""

import os
import logging
from contextlib import asynccontextmanager
import aiosqlite
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from .turso_client import (
    is_turso_configured,
    get_turso_connection,
    get_turso_url,
)

logger = logging.getLogger(__name__)

DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "signal_clone.db"
    ),
)

SCHEMA_STATEMENTS = [
    """
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
    """,
    """
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES users(id),
        contact_user_id TEXT NOT NULL REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, contact_user_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        is_group INTEGER DEFAULT 0,
        group_name TEXT,
        group_avatar_color TEXT,
        created_by TEXT REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS conversation_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        is_admin INTEGER DEFAULT 0,
        joined_at TEXT DEFAULT (datetime('now')),
        UNIQUE(conversation_id, user_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        status TEXT DEFAULT 'sent',
        created_at TEXT DEFAULT (datetime('now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS read_receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        read_at TEXT DEFAULT (datetime('now')),
        UNIQUE(message_id, user_id)
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id)",
    "CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_read_receipts_msg ON read_receipts(message_id)",
]


async def get_db():
    """
    FastAPI dependency yielding an async connection.
    Connects to Turso Cloud if configured, else falls back to local SQLite.
    """
    if is_turso_configured():
        conn = await get_turso_connection()
        try:
            yield conn
        finally:
            await conn.close()
    else:
        db = await aiosqlite.connect(DATABASE_PATH)
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA foreign_keys=ON")
        try:
            yield db
        finally:
            await db.close()


@asynccontextmanager
async def get_db_context():
    """
    Async context manager for standalone scripts (seeding, migration, background jobs).
    Usage: async with get_db_context() as db: ...
    """
    if is_turso_configured():
        conn = await get_turso_connection()
        try:
            yield conn
        finally:
            await conn.close()
    else:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            db.row_factory = aiosqlite.Row
            await db.execute("PRAGMA journal_mode=WAL")
            await db.execute("PRAGMA foreign_keys=ON")
            yield db


async def init_db():
    """Create all tables and indexes if they do not exist."""
    if is_turso_configured():
        logger.info("=" * 60)
        logger.info("[TURSO CLOUD] Mode: ONLINE TURSO DATABASE ACTIVE")
        logger.info(f"[TURSO CLOUD] Target URL: {get_turso_url()}")
        conn = await get_turso_connection()
        try:
            for stmt in SCHEMA_STATEMENTS:
                await conn.execute(stmt)
            cur = await conn.execute("SELECT COUNT(*) FROM users")
            row = await cur.fetchone()
            count = row[0] if row else 0
            logger.info(f"[TURSO CLOUD] Verified! Found {count} users in online Turso database.")
            logger.info("=" * 60)
        finally:
            await conn.close()
    else:
        logger.info(f"[LOCAL SQLITE] Initializing local SQLite schema ({DATABASE_PATH})...")
        async with aiosqlite.connect(DATABASE_PATH) as db:
            await db.execute("PRAGMA foreign_keys=ON")
            for stmt in SCHEMA_STATEMENTS:
                await db.execute(stmt)
            await db.commit()
        logger.info("[LOCAL SQLITE] Local SQLite schema verified/initialized successfully.")

