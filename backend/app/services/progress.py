"""Perhitungan status unit & titik lanjut belajar (F-02, F-13)."""

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Attempt, Module, Reflection, StepResponse, User


def unit_statuses(db: Session, user: User, module: Module) -> list[dict]:
    attempts = db.scalars(select(Attempt).where(Attempt.user_id == user.id)).all()
    done = {a.activity_id for a in attempts if a.status == "completed"}
    touched = {a.activity_id for a in attempts}
    result = []
    for unit in module.units:
        required = [a.id for a in unit.activities if a.is_required]
        if required and all(a in done for a in required):
            status = "completed"
        elif any(a.id in touched for a in unit.activities):
            status = "in_progress"
        else:
            status = "not_started"
        result.append({
            "slug": unit.slug, "status": status, "is_optional": unit.is_optional,
            "activities_done": sum(a.id in done for a in unit.activities),
            "activities_total": len(unit.activities),
        })
    return result


def activity_statuses(db: Session, user: User, module: Module) -> dict[str, str]:
    attempts = db.scalars(select(Attempt).where(Attempt.user_id == user.id)).all()
    done = {a.activity_id for a in attempts if a.status == "completed"}
    touched = {a.activity_id for a in attempts}
    out = {}
    for unit in module.units:
        for a in unit.activities:
            out[a.slug] = "completed" if a.id in done else "in_progress" if a.id in touched else "not_started"
    return out


def active_days(db: Session, user: User, tz_offset_minutes: int, days: int = 14) -> list[str]:
    """Tanggal (zona waktu perangkat) saat siswa menjawab langkah atau menulis refleksi."""
    since = datetime.now(UTC) - timedelta(days=days)
    stamps = list(db.scalars(
        select(StepResponse.answered_at).join(Attempt, StepResponse.attempt_id == Attempt.id)
        .where(Attempt.user_id == user.id, StepResponse.answered_at >= since)
    ))
    stamps += list(db.scalars(
        select(Reflection.created_at).where(Reflection.user_id == user.id, Reflection.created_at >= since)
    ))
    shift = timedelta(minutes=-tz_offset_minutes)  # getTimezoneOffset(): WIB = -420
    out = set()
    for t in stamps:
        t = t if t.tzinfo else t.replace(tzinfo=UTC)
        out.add((t + shift).date().isoformat())
    return sorted(out)


def reflection_count(db: Session, user: User) -> int:
    return db.scalar(
        select(func.count(Reflection.id)).where(Reflection.user_id == user.id, Reflection.skipped.is_(False))
    ) or 0


def resume_point(db: Session, user: User, module: Module) -> dict:
    latest = db.scalars(
        select(Attempt)
        .where(Attempt.user_id == user.id, Attempt.status == "in_progress")
        .order_by(Attempt.updated_at.desc())
    ).first()
    if latest:
        act = latest.activity
        return {"activity_id": act.id, "step_key": latest.last_step_key,
                "unit_title": act.unit.title, "activity_title": act.title, "is_new": False}

    done = {
        a.activity_id
        for a in db.scalars(select(Attempt).where(Attempt.user_id == user.id, Attempt.status == "completed"))
    }
    for unit in module.units:
        if unit.is_optional:
            continue
        for act in unit.activities:
            if act.id not in done:
                return {"activity_id": act.id, "step_key": None, "unit_title": unit.title,
                        "activity_title": act.title, "is_new": not done}
    return {"activity_id": None, "step_key": None, "unit_title": None, "activity_title": None,
            "is_new": False}
