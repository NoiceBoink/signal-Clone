"""
Database seeder — creates demo users, conversations, and messages.
Run with: python -m app.seed
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext

from .database import init_db, get_db_context

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _id():
    return str(uuid.uuid4())


def _time(minutes_ago: int) -> str:
    return (datetime.utcnow() - timedelta(minutes=minutes_ago)).isoformat()


async def seed():
    await init_db()

    async with get_db_context() as db:
        # Check if already seeded
        cursor = await db.execute("SELECT COUNT(*) as cnt FROM users")
        row = await cursor.fetchone()
        if row and row[0] > 0:
            print("Database already seeded. Skipping initial seeding.")
            return

        print("Seeding database...")

        # ── Users ──────────────────────────────────────────────────────
        password = pwd_context.hash("demo123")

        users = [
            (_id(), "demo", "091000 00001", "Demo User", "#edd0c9", "DU", password),
            (_id(), "krishna", "092173 72551", "Krishna Gupta", "#c9d5ed", "KG", password),
            (_id(), "arjun", "098765 43210", "Arjun Mehta", "#c9edda", "AM", password),
            (_id(), "priya", "091234 56789", "Priya Sharma", "#edd9c9", "PS", password),
            (_id(), "riya", "091111 22222", "Riya Patel", "#d9c9ed", "RP", password),
            (_id(), "vikram", "093333 44444", "Vikram Singh", "#edc9c9", "VS", password),
            (_id(), "ananya", "094444 55555", "Ananya Iyer", "#c9ede8", "AI", password),
            (_id(), "rahul", "095555 66666", "Rahul Verma", "#e8edc9", "RV", password),
        ]

        await db.executemany(
            """INSERT INTO users (id, username, phone, display_name, avatar_color, initials, password_hash)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            users,
        )

        demo_id = users[0][0]
        krishna_id = users[1][0]
        arjun_id = users[2][0]
        priya_id = users[3][0]
        riya_id = users[4][0]
        vikram_id = users[5][0]
        ananya_id = users[6][0]
        rahul_id = users[7][0]

        # ── Contacts (demo user's contact list) ───────────────────────
        contacts = [
            (demo_id, krishna_id),
            (demo_id, arjun_id),
            (demo_id, priya_id),
            (demo_id, riya_id),
            (demo_id, vikram_id),
            (demo_id, ananya_id),
            # Bidirectional
            (krishna_id, demo_id),
            (arjun_id, demo_id),
            (priya_id, demo_id),
            (riya_id, demo_id),
            (vikram_id, demo_id),
            (ananya_id, demo_id),
            # Some cross-contacts
            (krishna_id, arjun_id),
            (arjun_id, krishna_id),
            (priya_id, riya_id),
            (riya_id, priya_id),
        ]

        await db.executemany(
            "INSERT INTO contacts (user_id, contact_user_id) VALUES (?, ?)",
            contacts,
        )

        # ── Conversations ─────────────────────────────────────────────

        # Conv 1: Demo <-> Krishna (1:1)
        conv1_id = _id()
        await db.execute(
            "INSERT INTO conversations (id, is_group, created_by, created_at, updated_at) VALUES (?, 0, ?, ?, ?)",
            (conv1_id, demo_id, _time(10), _time(7)),
        )
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)", (conv1_id, demo_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv1_id, krishna_id))

        # Conv 2: Demo <-> Arjun (1:1)
        conv2_id = _id()
        await db.execute(
            "INSERT INTO conversations (id, is_group, created_by, created_at, updated_at) VALUES (?, 0, ?, ?, ?)",
            (conv2_id, demo_id, _time(180), _time(45)),
        )
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)", (conv2_id, demo_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv2_id, arjun_id))

        # Conv 3: Demo <-> Priya (1:1)
        conv3_id = _id()
        await db.execute(
            "INSERT INTO conversations (id, is_group, created_by, created_at, updated_at) VALUES (?, 0, ?, ?, ?)",
            (conv3_id, priya_id, _time(1440), _time(1440)),
        )
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)", (conv3_id, priya_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv3_id, demo_id))

        # Conv 4: Demo <-> Riya (1:1)
        conv4_id = _id()
        await db.execute(
            "INSERT INTO conversations (id, is_group, created_by, created_at, updated_at) VALUES (?, 0, ?, ?, ?)",
            (conv4_id, demo_id, _time(60), _time(30)),
        )
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)", (conv4_id, demo_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv4_id, riya_id))

        # Conv 5: Group — "Project Team"
        conv5_id = _id()
        await db.execute(
            "INSERT INTO conversations (id, is_group, group_name, group_avatar_color, created_by, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?, ?)",
            (conv5_id, "Project Team", "#c9d5ed", demo_id, _time(2880), _time(15)),
        )
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)", (conv5_id, demo_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv5_id, krishna_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv5_id, arjun_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv5_id, priya_id))

        # Conv 6: Group — "College Friends"
        conv6_id = _id()
        await db.execute(
            "INSERT INTO conversations (id, is_group, group_name, group_avatar_color, created_by, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?, ?)",
            (conv6_id, "College Friends", "#c9edda", vikram_id, _time(4320), _time(120)),
        )
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv6_id, demo_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id, is_admin) VALUES (?, ?, 1)", (conv6_id, vikram_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv6_id, riya_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv6_id, ananya_id))
        await db.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)", (conv6_id, rahul_id))

        # ── Messages ──────────────────────────────────────────────────

        msgs = [
            # Conv 1: Demo <-> Krishna
            (_id(), conv1_id, demo_id, "Conversation started", "system", "sent", _time(10)),
            (_id(), conv1_id, demo_id, "hello", "text", "read", _time(9)),
            (_id(), conv1_id, krishna_id, "Hii", "text", "sent", _time(7)),

            # Conv 2: Demo <-> Arjun
            (_id(), conv2_id, demo_id, "Conversation started", "system", "sent", _time(180)),
            (_id(), conv2_id, demo_id, "Hey, are you coming to the meetup?", "text", "read", _time(150)),
            (_id(), conv2_id, arjun_id, "Yes, I'll be there by 6!", "text", "sent", _time(90)),
            (_id(), conv2_id, demo_id, "Great, see you then 👍", "text", "read", _time(45)),

            # Conv 3: Demo <-> Priya
            (_id(), conv3_id, priya_id, "Conversation started", "system", "sent", _time(1500)),
            (_id(), conv3_id, priya_id, "Can you send me the notes?", "text", "sent", _time(1450)),
            (_id(), conv3_id, demo_id, "Sure, sending now", "text", "read", _time(1440)),

            # Conv 4: Demo <-> Riya
            (_id(), conv4_id, demo_id, "Conversation started", "system", "sent", _time(60)),
            (_id(), conv4_id, demo_id, "Hi Riya! How's the project going?", "text", "delivered", _time(55)),
            (_id(), conv4_id, riya_id, "Going well! Almost done with the frontend", "text", "sent", _time(40)),
            (_id(), conv4_id, demo_id, "That's awesome, let me know if you need help", "text", "read", _time(30)),

            # Conv 5: Group - Project Team
            (_id(), conv5_id, demo_id, 'Demo User created the group "Project Team"', "system", "sent", _time(2880)),
            (_id(), conv5_id, krishna_id, "Hey team, let's discuss the sprint plan", "text", "sent", _time(120)),
            (_id(), conv5_id, arjun_id, "I'll prepare the design docs by tomorrow", "text", "sent", _time(60)),
            (_id(), conv5_id, demo_id, "Sounds good. Let's sync at 3pm", "text", "read", _time(30)),
            (_id(), conv5_id, priya_id, "Works for me! 👍", "text", "sent", _time(15)),

            # Conv 6: Group - College Friends
            (_id(), conv6_id, vikram_id, 'Vikram Singh created the group "College Friends"', "system", "sent", _time(4320)),
            (_id(), conv6_id, vikram_id, "Who's up for a reunion this weekend?", "text", "sent", _time(200)),
            (_id(), conv6_id, ananya_id, "Count me in! 🎉", "text", "sent", _time(180)),
            (_id(), conv6_id, riya_id, "Same here!", "text", "sent", _time(160)),
            (_id(), conv6_id, rahul_id, "Let's do brunch at the usual place", "text", "sent", _time(140)),
            (_id(), conv6_id, demo_id, "I'll try to make it!", "text", "read", _time(120)),
        ]

        await db.executemany(
            """INSERT INTO messages (id, conversation_id, sender_id, content, message_type, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            msgs,
        )

        # ── Read receipts for messages demo user has seen ─────────────
        # Mark all incoming messages as read by demo user
        cursor = await db.execute(
            "SELECT id FROM messages WHERE sender_id != ? AND message_type = 'text'",
            (demo_id,),
        )
        incoming = await cursor.fetchall()
        for m in incoming:
            await db.execute(
                "INSERT OR IGNORE INTO read_receipts (message_id, user_id) VALUES (?, ?)",
                (m[0], demo_id),
            )

        await db.commit()
        print(f"[OK] Seeded: {len(users)} users, 6 conversations, {len(msgs)} messages")
        print(f"   Demo login: username=demo, password=demo123")
        print(f"   Other users all have password: demo123")


if __name__ == "__main__":
    asyncio.run(seed())
