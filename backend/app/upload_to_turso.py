"""
Migration script to upload all data from local SQLite (signal_clone.db) directly to Turso Cloud.
Run with:
    python -m app.upload_to_turso
"""

import asyncio
import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

from .turso_client import is_turso_configured, get_turso_connection, get_turso_url
from .database import init_db, DATABASE_PATH


TABLES_TO_MIGRATE = [
    "users",
    "contacts",
    "conversations",
    "conversation_members",
    "messages",
    "read_receipts",
]


async def upload():
    print("=" * 60)
    print("  Signal Messenger Clone -> Turso Database Migration")
    print("=" * 60)

    if not is_turso_configured():
        print("\n[ERROR] Turso credentials are not configured!")
        print("Please open backend/.env and set:")
        print("    TURSO_DATABASE_URL=libsql://your-database-name.turso.io")
        print("    TURSO_AUTH_TOKEN=your_token_here")
        return

    if not os.path.exists(DATABASE_PATH):
        print(f"\n[ERROR] Local database file not found at: {DATABASE_PATH}")
        return

    print(f"[*] Source database: {DATABASE_PATH}")
    print(f"[*] Destination:     {get_turso_url()}")
    print("\n[1/3] Ensuring tables exist on Turso Cloud...")
    await init_db()
    print("[✓] Turso schema verified.")

    print("\n[2/3] Reading source records and copying to Turso Cloud...")
    local_conn = sqlite3.connect(DATABASE_PATH)
    local_conn.row_factory = sqlite3.Row
    turso_conn = await get_turso_connection()

    try:
        total_migrated = 0
        for table in TABLES_TO_MIGRATE:
            cur = local_conn.execute(f"SELECT * FROM {table}")
            rows = cur.fetchall()
            if not rows:
                print(f"  - {table}: 0 records (empty)")
                continue

            columns = [col[0] for col in cur.description]
            placeholders = ", ".join(["?"] * len(columns))
            cols_str = ", ".join(columns)
            insert_sql = f"INSERT OR REPLACE INTO {table} ({cols_str}) VALUES ({placeholders})"

            batch_data = [[row[c] for c in columns] for row in rows]
            await turso_conn.executemany(insert_sql, batch_data)
            print(f"  - {table}: {len(rows)} records migrated successfully [✓]")
            total_migrated += len(rows)

        print(f"\n[3/3] Migration Complete! Total records migrated: {total_migrated}")
        print("=" * 60)
        print("  Your Turso Cloud Database is now active and up to date!")
        print("  Start your backend and it will automatically use Turso.")
        print("=" * 60)
    finally:
        local_conn.close()
        await turso_conn.close()


if __name__ == "__main__":
    asyncio.run(upload())
