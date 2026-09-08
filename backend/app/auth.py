"""
Authentication routes: register, login, verify OTP (mocked), get current user.
Uses JWT tokens for session management and bcrypt for password hashing.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid
import random

from .database import get_db
from .models import UserCreate, UserLogin, UserResponse, OTPVerify

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = "signal-clone-secret-key-2024-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

MOCK_OTP = "123456"

AVATAR_COLORS = [
    "#edd0c9", "#c9d5ed", "#c9edda", "#edd9c9",
    "#d9c9ed", "#edc9c9", "#c9ede8", "#e8edc9",
]


def _get_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    elif parts:
        return parts[0][:2].upper()
    return "?"


def _create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db=Depends(get_db),
) -> dict:
    """FastAPI dependency to extract the current user from the JWT token."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)


def _user_dict_to_response(u: dict) -> dict:
    return {
        "id": u["id"],
        "username": u["username"],
        "phone": u.get("phone"),
        "display_name": u["display_name"],
        "avatar_color": u.get("avatar_color", "#edd0c9"),
        "initials": u.get("initials", "?"),
        "is_online": bool(u.get("is_online", 0)),
        "last_seen": u.get("last_seen"),
    }


# ── Routes ────────────────────────────────────────────────────────────────


@router.post("/register")
async def register(data: UserCreate, db=Depends(get_db)):
    """Register a new user. Returns a JWT token."""
    # Check if username taken
    cursor = await db.execute("SELECT id FROM users WHERE username = ?", (data.username,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Check phone (compulsory)
    clean_phone = data.phone.strip() if data.phone else ""
    if not clean_phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    cursor = await db.execute("SELECT id FROM users WHERE phone = ?", (clean_phone,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user_id = str(uuid.uuid4())
    hashed = pwd_context.hash(data.password)
    initials = _get_initials(data.display_name)
    color = random.choice(AVATAR_COLORS)

    await db.execute(
        """INSERT INTO users (id, username, phone, display_name, password_hash, initials, avatar_color)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (user_id, data.username, clean_phone, data.display_name, hashed, initials, color),
    )
    await db.commit()

    token = _create_token(user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": data.username,
            "phone": data.phone,
            "display_name": data.display_name,
            "initials": initials,
            "avatar_color": color,
            "is_online": False,
            "last_seen": None,
        },
    }


@router.post("/login")
async def login(data: UserLogin, db=Depends(get_db)):
    """Login with username + password. Returns a JWT token."""
    cursor = await db.execute("SELECT * FROM users WHERE username = ?", (data.username,))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = dict(user)

    if not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = _create_token(user["id"])
    return {"token": token, "user": _user_dict_to_response(user)}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return _user_dict_to_response(current_user)


@router.post("/verify-otp")
async def verify_otp(data: OTPVerify):
    """Mock OTP verification — always accepts '123456'."""
    if data.otp == MOCK_OTP:
        return {"verified": True, "message": "OTP verified successfully"}
    raise HTTPException(status_code=400, detail="Invalid OTP")
