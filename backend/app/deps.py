"""Dependency FastAPI: sesi DB, pengguna saat ini, pembatasan peran."""

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError
from app.core.security import decode_access_token
from app.models import User


def get_current_user(
    authorization: str | None = Header(default=None), db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401)
    payload = decode_access_token(authorization[7:].strip())
    if not payload:
        raise AppError("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.", 401)
    user = db.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise AppError("UNAUTHORIZED", "Sesi tidak valid.", 401)
    return user


def get_current_student(user: User = Depends(get_current_user)) -> User:
    if user.role != "student":
        raise AppError("FORBIDDEN", "Fitur ini khusus siswa.", 403)
    return user


def get_current_researcher(user: User = Depends(get_current_user)) -> User:
    if user.role != "researcher":
        raise AppError("FORBIDDEN", "Fitur ini khusus peneliti.", 403)
    return user
