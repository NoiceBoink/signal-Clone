"""
Pydantic models for request validation and response serialization.
"""

from pydantic import BaseModel
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    phone: str
    display_name: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


class UserResponse(BaseModel):
    id: str
    username: str
    phone: Optional[str] = None
    display_name: str
    avatar_color: str = "#edd0c9"
    initials: str = ""
    is_online: bool = False
    last_seen: Optional[str] = None


class TokenResponse(BaseModel):
    token: str
    user: UserResponse


# ── Contacts ──────────────────────────────────────────────────────────────

class ContactAdd(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None


# ── Conversations ─────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    """Create a 1:1 conversation with another user."""
    user_id: str


class GroupCreate(BaseModel):
    """Create a group conversation."""
    name: str
    member_ids: List[str]


class GroupUpdate(BaseModel):
    name: Optional[str] = None


class AddMember(BaseModel):
    user_id: str


# ── Messages ──────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    message_type: str = "text"
    status: str = "sent"
    created_at: str = ""
    sender: Optional[UserResponse] = None


class ConversationResponse(BaseModel):
    id: str
    is_group: bool = False
    group_name: Optional[str] = None
    group_avatar_color: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = ""
    updated_at: str = ""
    members: List[UserResponse] = []
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
