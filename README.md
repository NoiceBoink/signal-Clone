# Signal Messenger Desktop Clone

A privacy-focused, real-time messaging application replicating Signal's desktop interface, design system, and core workflows. Built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript** on the frontend, **FastAPI (Python 3.11)** and **SQLite** on the backend, with **native WebSockets** for real-time bi-directional messaging.

---

## Key Features

### 1. Authentication & Onboarding
- **Onboarding Flow**: Register with username, display name, and optional phone number.
- **Verification Code**: Mock 6-digit OTP verification (`123456`) with 1-click auto-fill for frictionless testing.
- **1-Click Demo Accounts**: Instant evaluator login cards on `/login` for pre-seeded users (`demo`, `krishna`, `arjun`, `priya`, `vikram`).
- **Session Persistence**: JWT token authentication with auto-login on app load.

### 2. Contacts & Conversation List
- **Main Signal Layout**: Left-hand navigation rail (54px) + chat sidebar (320px) + timeline pane.
- **Recent Sorting**: Conversations dynamically reorder to top upon receiving or sending messages.
- **Search**: Real-time filtering across conversation titles, contacts, usernames, and phone numbers.
- **Unread Badges**: Signal-blue pill count indicators and bold preview titles for unread messages.
- **Online / Last-Seen Indicators**: Real-time presence indicators updated via WebSocket peer events.

### 3. One-on-One Real-Time Messaging
- **Instant Messaging**: Real-time text message exchange with millisecond delivery over WebSockets.
- **Delivery & Read Receipts**: Single check (✓ Sent), double check (✓✓ Delivered), and blue/white double check (✓✓ Read).
- **Live Typing Indicators**: Authentic Signal 3-dot bouncing animation bubble and sidebar preview text.
- **Sound Effects**: Bundled Signal audio notification chime (`notification.ogg`) and message sent pop (`pop.ogg`).
- **Message Timestamps & Grouping**: Date separators ("Today", "Yesterday") and message timestamps.

### 4. Group Messaging
- **2-Step Group Creation**: Select members with avatar chips and checkboxes, customize group name and avatar color.
- **Group Info & Member Management**: View all members with Admin tags.
- **Admin Controls**: Add members from contacts, remove members, or leave the group.
- **Sender Attribution**: Incoming group bubbles display member display names in their custom avatar color.

### 5. Signal UI/UX & Bonus Features
- **Design Tokens**: Pixel-accurate color palette from `Signal-Desktop` (`#2c6bed` Ultramarine, dark `#121212`, light `#f6f6f6`).
- **Dark Mode & Light Mode**: Live switching in Settings with persistent theme preference.
- **Emoji Reactions**: Reaction popup (❤️, 👍, 😂, 😮, 😢, 🙏) and interactive reaction pills below bubbles.
- **Quoted Replies**: In-line quoted reply preview with jump-to context.
- **Attachments**: Image and document file sharing with thumbnail previews.
- **Disappearing Messages**: Header toggle indicator for disappearing message mode.
- **Keyboard Shortcuts**: `Ctrl+N` (New Chat), `Ctrl+F` (Search), `Esc` (Close modals), `Enter` (Send), `Shift+Enter` (New line).
- **Placeholder Sections**: Voice & Video call modal with animated waveform, Stories pane, and Linked Devices QR code.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Uvicorn, aiosqlite (async SQLite), python-jose (JWT), passlib & bcrypt |
| **Database** | SQLite with WAL mode & foreign key cascades |
| **Real-Time** | Native WebSockets (`/ws/{user_id}`) with reconnection handling and event bus |
| **Audio** | HTML5 Audio & Web Audio API fallback with bundled Signal `.ogg` assets |

---

## Project Structure

```
signal-clone/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI entry point, CORS, WebSocket endpoint (/ws/{user_id})
│   │   ├── database.py           # SQLite connection & schema initialization
│   │   ├── models.py             # Pydantic request/response validation schemas
│   │   ├── auth.py               # JWT tokens, bcrypt password hashing, mock OTP
│   │   ├── contacts.py           # Contact list CRUD & user search
│   │   ├── conversations.py      # 1:1 and group conversations, member management
│   │   ├── messages.py           # Message persistence, pagination, read receipts
│   │   ├── websocket_manager.py  # WebSocket connection registry & broadcast logic
│   │   └── seed.py               # Database seeder (8 users, 6 conversations, 35 messages)
│   ├── signal_clone.db           # Pre-seeded SQLite database
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── signal-logo.svg            # Authentic Signal logo
│   │   ├── signal-logo-with-text.svg  # Signal wordmark
│   │   ├── icons/                     # Delivery & read receipt SVGs
│   │   └── sounds/                    # notification.ogg & pop.ogg
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css            # Signal design tokens, CSS variables, typing keyframes
│   │   │   ├── layout.tsx             # Root layout with AuthProvider & AppStoreProvider
│   │   │   ├── page.tsx               # Main desktop messaging interface
│   │   │   ├── login/page.tsx         # Login page
│   │   │   └── register/page.tsx      # Onboarding & mock OTP verification flow
│   │   ├── components/
│   │   │   ├── TitleBar.tsx           # Window header with Signal logo & window controls
│   │   │   ├── NavSidebar.tsx         # 54px vertical icon rail (Chats, Calls, Stories, Settings)
│   │   │   ├── ChatListSidebar.tsx    # Conversation list with search, filter tabs, compose buttons
│   │   │   ├── ChatListItem.tsx       # Conversation row with preview, receipts, unread badge
│   │   │   ├── ChatHeader.tsx         # Chat top bar with avatar, online/member count, call buttons
│   │   │   ├── ChatArea.tsx           # Empty state or active message timeline & input
│   │   │   ├── MessageBubble.tsx      # Message bubble with receipts, reply quotes, reactions
│   │   │   ├── MessageInput.tsx       # Composition area: attachments, emoji, send/mic
│   │   │   ├── TypingIndicator.tsx    # 3-dot bouncing animation bubble
│   │   │   ├── Avatar.tsx             # Signal pastel avatars with initials & online dot
│   │   │   ├── modals/
│   │   │   │   ├── NewChatModal.tsx   # Search users and start direct chats
│   │   │   │   ├── NewGroupModal.tsx  # 2-step group creator with member selection
│   │   │   │   ├── AddContactModal.tsx# Add contact by username or phone
│   │   │   │   ├── GroupDetailsModal.tsx # Group info, member list with admin badges, add/remove
│   │   │   │   ├── SettingsModal.tsx  # Profile, dark/light theme, privacy, notifications
│   │   │   │   └── CallModal.tsx      # Audio & video call placeholder with waveform animation
│   │   │   └── stories/
│   │   │       └── StoriesPane.tsx    # Signal Stories placeholder pane
│   │   └── lib/
│   │       ├── api.ts                 # Typed API client for FastAPI
│   │       ├── auth.tsx               # Authentication context & JWT session storage
│   │       ├── store.tsx              # App state: active conversation, message caches, online status
│   │       ├── websocket.ts           # WebSocket client with auto-reconnection
│   │       ├── sound.ts               # Sound effect player with Web Audio fallback
│   │       └── utils.ts               # Date/time formatters, avatar colors, helpers
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
├── start.bat                          # 1-Click Windows launcher for both servers
└── README.md
```

---

## Database Schema (SQLite)

The backend utilizes SQLite with foreign key enforcement and indexed lookups:

- **`users`**:
  - `id`: UUID (Primary Key)
  - `username`: TEXT (Unique)
  - `phone`: TEXT (Unique, Optional)
  - `display_name`: TEXT
  - `password_hash`: TEXT (Bcrypt hashed)
  - `avatar_color`: TEXT (Hex color from Signal palette)
  - `initials`: TEXT
  - `is_online`: INTEGER (0 or 1, synced via WebSockets)
  - `last_seen`: TIMESTAMP (ISO 8601)
  - `created_at`: TIMESTAMP
- **`contacts`**:
  - `id`: INTEGER (Auto-increment Primary Key)
  - `user_id`: UUID (Foreign Key -> `users.id`)
  - `contact_user_id`: UUID (Foreign Key -> `users.id`)
  - `created_at`: TIMESTAMP
  - *Unique constraint on `(user_id, contact_user_id)`*
- **`conversations`**:
  - `id`: UUID (Primary Key)
  - `is_group`: INTEGER (0 for direct, 1 for group)
  - `group_name`: TEXT (Null for direct chats)
  - `group_avatar_color`: TEXT
  - `created_by`: UUID (Foreign Key -> `users.id`)
  - `created_at`: TIMESTAMP
  - `updated_at`: TIMESTAMP (Indexed for descending activity sort)
- **`conversation_members`**:
  - `id`: INTEGER (Auto-increment Primary Key)
  - `conversation_id`: UUID (Foreign Key -> `conversations.id`)
  - `user_id`: UUID (Foreign Key -> `users.id`)
  - `is_admin`: INTEGER (0 or 1)
  - `joined_at`: TIMESTAMP
  - *Unique constraint on `(conversation_id, user_id)`*
- **`messages`**:
  - `id`: UUID (Primary Key)
  - `conversation_id`: UUID (Foreign Key -> `conversations.id`)
  - `sender_id`: UUID (Foreign Key -> `users.id`)
  - `content`: TEXT
  - `message_type`: TEXT (`text`, `image`, `file`, `system`)
  - `status`: TEXT (`sending`, `sent`, `delivered`, `read`)
  - `created_at`: TIMESTAMP (Indexed)
- **`read_receipts`**:
  - `id`: INTEGER (Auto-increment Primary Key)
  - `message_id`: UUID (Foreign Key -> `messages.id`)
  - `user_id`: UUID (Foreign Key -> `users.id`)
  - `read_at`: TIMESTAMP
  - *Unique constraint on `(message_id, user_id)`*

---

## Quick Start (1-Click Launcher)

On Windows, simply double-click:
```cmd
start.bat
```
This automatically launches:
- **FastAPI Backend** on `http://localhost:8000` (API docs at `http://localhost:8000/docs`)
- **Next.js Frontend** on `http://localhost:3000`

---

## Manual Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

### 1. Run the Backend
```bash
cd backend

# Install dependencies (first time)
pip install -r requirements.txt

# (Optional) Seed the database with demo users & conversations:
python -m app.seed

# Start the server:
python -m uvicorn app.main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000`
- Swagger Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Run the Frontend
In a second terminal:
```bash
# In the project root (signal-clone/)
npm install

# Start development server:
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Pre-seeded Demo Accounts

All pre-seeded demo accounts share the password **`demo123`**:

| Username | Password | Display Name | Role / Notes |
| :--- | :--- | :--- | :--- |
| **`demo`** | `demo123` | Demo User | Main account (multiple 1:1 and group chats) |
| **`krishna`** | `demo123` | Krishna Gupta | Direct contact |
| **`arjun`** | `demo123` | Arjun Mehta | Direct contact |
| **`priya`** | `demo123` | Priya Sharma | Direct contact |
| **`vikram`** | `demo123` | Vikram Singh | Group Admin ("College Friends") |
| **`ananya`** | `demo123` | Ananya Iyer | Direct contact |
| **`rahul`** | `demo123` | Rahul Verma | Searchable user |

> **Mock OTP for Registration**: If registering a brand new user via `/register`, the verification code is **`123456`**.

---

## How to Test Real-Time Features

1. Open `http://localhost:3000` in your regular browser tab and click **Demo User** on the login page.
2. Open an **Incognito / Private Browsing window** at `http://localhost:3000` and click **Krishna Gupta**.
3. In both windows, click the mutual chat between **Demo User** and **Krishna Gupta**.
4. **Live Typing**: Start typing in one window — observe the animated 3-dot typing bubble and sidebar text in the other window.
5. **Real-Time Delivery & Sound**: Send a message. Notice the instant delivery and sound effects (`pop.ogg` on send, `notification.ogg` on receive).
6. **Receipt Progression**: Watch the checkmark transition from `sent` (✓) to `delivered` (✓✓) to `read` (✓✓ blue) in real time.
7. **Reactions**: Hover over a message and click an emoji reaction to watch it update on both screens.
8. **Group Collaboration**: Switch to the **Project Team** group in multiple windows to verify multi-user broadcast messaging.
