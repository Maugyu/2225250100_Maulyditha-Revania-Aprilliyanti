"""Endpoint belajar siswa: modul, aktivitas, attempt, respons langkah, refleksi, progres."""

import json
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError
from app.deps import get_current_student, get_current_user
from app.models import (
    Activity,
    Attempt,
    GlossaryTerm,
    Module,
    Reflection,
    StepResponse,
    Unit,
    User,
    utcnow,
)
from app.schemas.api import (
    FEEDBACK_CODES,
    AttemptIn,
    AttemptOut,
    AttemptPatch,
    ReflectionIn,
    StepResponseIn,
)
from app.services.progress import (
    active_days,
    activity_statuses,
    reflection_count,
    resume_point,
    unit_statuses,
)

router = APIRouter(tags=["learning"])
MAX_RESPONSE_BYTES = 4096
MAX_TEXT = 500


def _module_or_404(db: Session, slug: str) -> Module:
    module = db.scalar(select(Module).where(Module.slug == slug, Module.is_published.is_(True)))
    if not module:
        raise AppError("NOT_FOUND", "Modul tidak ditemukan.", 404)
    return module


def _default_module(db: Session) -> Module:
    module = db.scalar(select(Module).where(Module.is_published.is_(True)).order_by(Module.id))
    if not module:
        raise AppError("NOT_FOUND", "Belum ada modul.", 404)
    return module


def _attempt_out(a: Attempt) -> AttemptOut:
    return AttemptOut(
        id=a.id, client_id=a.client_id, activity_id=a.activity_id,
        status=a.status, last_step_key=a.last_step_key,
    )


def _own_attempt(db: Session, user: User, client_id: str) -> Attempt:
    a = db.scalar(select(Attempt).where(Attempt.client_id == client_id))
    if not a or a.user_id != user.id:
        raise AppError("NOT_FOUND", "Percobaan tidak ditemukan.", 404)
    return a


def _sane_time(t: datetime | None) -> datetime:
    """Waktu dari klien dipakai bila wajar (≤ 7 hari ke belakang, tidak di masa depan)."""
    now = utcnow()
    if t is None:
        return now
    t = t if t.tzinfo else t.replace(tzinfo=UTC)
    return t if now - timedelta(days=7) <= t <= now + timedelta(minutes=5) else now


@router.get("/modules")
def list_modules(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    mods = db.scalars(select(Module).where(Module.is_published.is_(True))).all()
    return [
        {"slug": m.slug, "title": m.title, "grade": m.grade, "unit_count": len(m.units),
         "content_version": m.content_version}
        for m in mods
    ]


@router.get("/modules/{slug}")
def get_module(slug: str, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    m = _module_or_404(db, slug)
    glossary = db.scalars(select(GlossaryTerm).where(GlossaryTerm.module_id == m.id)).all()
    return {
        "slug": m.slug, "title": m.title, "description": m.description,
        "content_version": m.content_version,
        "units": [
            {
                "slug": u.slug, "order_index": u.order_index, "title": u.title, "goal": u.goal,
                "is_optional": u.is_optional,
                "activities": [
                    {"id": a.id, "slug": a.slug, "phase": a.phase, "title": a.title,
                     "is_required": a.is_required}
                    for a in u.activities
                ],
            }
            for u in m.units
        ],
        "glossary": [
            {"key": g.key, "term": g.term, "definition": g.definition, "example": g.example}
            for g in glossary
        ],
    }


@router.get("/activities/{activity_id}")
def get_activity(
    activity_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    a = db.get(Activity, activity_id)
    if not a:
        raise AppError("NOT_FOUND", "Aktivitas tidak ditemukan.", 404)
    unit: Unit = a.unit
    siblings = unit.activities
    idx = siblings.index(a)
    current = db.scalar(
        select(Attempt)
        .where(Attempt.user_id == user.id, Attempt.activity_id == a.id, Attempt.status == "in_progress")
        .order_by(Attempt.updated_at.desc())
    )
    return {
        "id": a.id, "slug": a.slug, "phase": a.phase, "title": a.title,
        "literacy_processes": a.literacy_processes, "indicators": a.indicators,
        "content": a.content, "content_version": unit.module.content_version,
        "unit": {"slug": unit.slug, "title": unit.title, "order_index": unit.order_index},
        "module_slug": unit.module.slug,
        "position": {"index": idx + 1, "total": len(siblings)},
        "next_activity_id": siblings[idx + 1].id if idx + 1 < len(siblings) else None,
        "current_attempt": _attempt_out(current).model_dump() if current else None,
    }


@router.get("/me/progress")
def my_progress(
    tz: int = Query(default=-420, ge=-840, le=840),
    db: Session = Depends(get_db), user: User = Depends(get_current_student),
):
    """tz = Date.getTimezoneOffset() perangkat (WIB = -420)."""
    m = _default_module(db)
    units = unit_statuses(db, user, m)
    required = [u for u in units if not u["is_optional"]]
    return {
        "module_slug": m.slug,
        "units": units,
        "completed_units": sum(u["status"] == "completed" for u in required),
        "total_required_units": len(required),
        "activities": activity_statuses(db, user, m),
        "reflections": reflection_count(db, user),
        "active_days": active_days(db, user, tz),
    }


@router.get("/me/resume")
def my_resume(db: Session = Depends(get_db), user: User = Depends(get_current_student)):
    return resume_point(db, user, _default_module(db))


@router.post("/attempts", status_code=201)
def create_attempt(
    payload: AttemptIn, db: Session = Depends(get_db), user: User = Depends(get_current_student)
):
    existing = db.scalar(select(Attempt).where(Attempt.client_id == payload.client_id))
    if existing:
        if existing.user_id != user.id or existing.activity_id != payload.activity_id:
            raise AppError("CLIENT_ID_CONFLICT", "client_id sudah dipakai.", 409)
        return _attempt_out(existing)
    if not db.get(Activity, payload.activity_id):
        raise AppError("NOT_FOUND", "Aktivitas tidak ditemukan.", 404)
    started = _sane_time(payload.started_at)
    a = Attempt(
        client_id=payload.client_id, user_id=user.id, activity_id=payload.activity_id,
        content_version=payload.content_version, started_at=started, updated_at=utcnow(),
    )
    db.add(a)
    db.commit()
    return _attempt_out(a)


@router.patch("/attempts/{client_id}")
def update_attempt(
    client_id: str, payload: AttemptPatch, db: Session = Depends(get_db),
    user: User = Depends(get_current_student),
):
    a = _own_attempt(db, user, client_id)
    if payload.last_step_key is not None:
        a.last_step_key = payload.last_step_key
    if payload.status == "completed" and a.status != "completed":
        a.status = "completed"
        a.completed_at = _sane_time(payload.completed_at)
    a.updated_at = utcnow()
    db.commit()
    return _attempt_out(a)


@router.post("/attempts/{client_id}/responses", status_code=201)
def create_step_response(
    client_id: str, payload: StepResponseIn, db: Session = Depends(get_db),
    user: User = Depends(get_current_student),
):
    a = _own_attempt(db, user, client_id)
    dup = db.scalar(select(StepResponse).where(StepResponse.client_id == payload.client_id))
    if dup:
        if dup.attempt_id != a.id:
            raise AppError("CLIENT_ID_CONFLICT", "client_id sudah dipakai.", 409)
        return {"id": dup.id}
    step_keys = {s["key"] for s in a.activity.content.get("steps", [])}
    details = []
    if payload.step_key not in step_keys:
        details.append({"field": "step_key", "issue": "tidak ada di konten aktivitas"})
    if payload.feedback_code and payload.feedback_code not in FEEDBACK_CODES:
        details.append({"field": "feedback_code", "issue": "kode tidak dikenal"})
    if len(json.dumps(payload.response)) > MAX_RESPONSE_BYTES:
        details.append({"field": "response", "issue": "terlalu besar"})
    if details:
        raise AppError("VALIDATION_ERROR", "Data yang dikirim tidak valid.", 422, details)

    r = StepResponse(
        client_id=payload.client_id, attempt_id=a.id, step_key=payload.step_key,
        step_type=payload.step_type, try_number=payload.try_number, response=payload.response,
        is_correct=payload.is_correct, feedback_code=payload.feedback_code,
        hint_level_max=payload.hint_level_max, solution_revealed=payload.solution_revealed,
        answered_at=_sane_time(payload.answered_at),
    )
    a.last_step_key = payload.step_key
    a.updated_at = utcnow()
    db.add(r)
    db.commit()
    return {"id": r.id}


@router.post("/reflections", status_code=201)
def create_reflection(
    payload: ReflectionIn, db: Session = Depends(get_db), user: User = Depends(get_current_student)
):
    dup = db.scalar(select(Reflection).where(Reflection.client_id == payload.client_id))
    if dup:
        if dup.user_id != user.id:
            raise AppError("CLIENT_ID_CONFLICT", "client_id sudah dipakai.", 409)
        return {"id": dup.id}
    unit = db.scalar(select(Unit).where(Unit.slug == payload.unit_slug))
    if not unit:
        raise AppError("NOT_FOUND", "Unit tidak ditemukan.", 404)
    if not payload.skipped and not (payload.explanation or "").strip():
        raise AppError(
            "VALIDATION_ERROR", "Penjelasan kosong.", 422,
            [{"field": "explanation", "issue": "wajib diisi bila tidak dilewati"}],
        )
    r = Reflection(
        client_id=payload.client_id, user_id=user.id, unit_id=unit.id,
        prompt_key=payload.prompt_key,
        explanation=None if payload.skipped else payload.explanation.strip()[:MAX_TEXT],
        transfer=None if payload.skipped or not payload.transfer else payload.transfer.strip()[:300],
        confidence=None if payload.skipped else payload.confidence, skipped=payload.skipped,
    )
    db.add(r)
    db.commit()
    return {"id": r.id}
