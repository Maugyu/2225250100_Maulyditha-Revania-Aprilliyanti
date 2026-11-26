from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError
from app.core.security import create_access_token, verify_pin
from app.deps import get_current_user
from app.models import User, utcnow
from app.schemas.api import LoginIn, LoginOut, UserOut
from app.services import rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])


def user_out(user: User) -> UserOut:
    return UserOut(
        username=user.username,
        role=user.role,
        class_code=user.classroom.code if user.classroom else None,
    )


@router.post("/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> LoginOut:
    username = payload.username.upper()
    if rate_limit.is_blocked(username):
        raise AppError(
            "TOO_MANY_ATTEMPTS", "Terlalu banyak percobaan. Coba lagi 15 menit lagi.", 429
        )
    user = db.scalar(select(User).where(User.username == username))
    if not user or not user.is_active or not verify_pin(payload.pin, user.pin_hash):
        rate_limit.record_failure(username)
        raise AppError("INVALID_CREDENTIALS", "Kode atau PIN belum tepat.", 401)
    rate_limit.reset(username)
    user.last_login_at = utcnow()
    db.commit()
    token, expires_in = create_access_token(user.id, user.role)
    return LoginOut(access_token=token, expires_in=expires_in, user=user_out(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return user_out(user)
