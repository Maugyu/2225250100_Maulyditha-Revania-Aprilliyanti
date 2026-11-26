"""Endpoint "Tanya Gari" untuk siswa (ADR-018). Tidak tersedia di asesmen."""

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.errors import AppError
from app.deps import get_current_student
from app.models import Activity, AiChat, AssessmentSubmission, Module, Unit, User
from app.schemas.api import FEEDBACK_CODES
from app.services import ai, tutor

router = APIRouter(tags=["tutor"])


class Turn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Literal["siswa", "gari"]
    text: str = Field(max_length=1200)


class AskIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    activity_id: int
    step_key: str = Field(max_length=40)
    question: str = Field(min_length=2, max_length=tutor.MAX_QUESTION)
    history: list[Turn] = Field(default_factory=list, max_length=12)
    current_answer: dict | None = None
    supervised: bool  # siswa mengonfirmasi sedang didampingi orang tua/wali
    feedback_code: str | None = Field(default=None, max_length=30)  # kode umpan balik pemeriksa terakhir

    @field_validator("feedback_code")
    @classmethod
    def _known_code(cls, v: str | None) -> str | None:
        if v is not None and v not in FEEDBACK_CODES:
            raise ValueError("kode umpan balik tidak dikenal")
        return v


class ChatIn(BaseModel):
    """Obrolan umum dari bilah samping (ADR-021) — tidak terikat langkah."""

    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=2, max_length=tutor.MAX_QUESTION)
    history: list[Turn] = Field(default_factory=list, max_length=12)
    supervised: bool


def _available(user: User) -> bool:
    return get_settings().ai_enabled and bool(user.classroom and user.classroom.ai_student_enabled)


@router.get("/me/ai")
def my_ai(user: User = Depends(get_current_student)):
    return {"available": _available(user), "limit_per_hour": get_settings().ai_student_calls_per_hour}


def _guard(user: User, supervised: bool) -> None:
    if not get_settings().ai_enabled:
        raise AppError("AI_UNAVAILABLE", "Tanya Gari belum aktif.", 503)
    if not _available(user):
        raise AppError("AI_NOT_ALLOWED", "Tanya Gari belum diizinkan untuk kelasmu.", 403)
    if not supervised:
        raise AppError("AI_SUPERVISION_REQUIRED", "Tanya Gari dipakai bersama orang tua/wali, ya.", 403)


@router.post("/ai/ask")
def ask_gari(payload: AskIn, db: Session = Depends(get_db), user: User = Depends(get_current_student)):
    _guard(user, payload.supervised)
    act = db.get(Activity, payload.activity_id)
    steps = act.content.get("steps", []) if act else []
    step = next((s for s in steps if s["key"] == payload.step_key), None)
    if not act or not step:
        raise AppError("NOT_FOUND", "Langkah tidak ditemukan.", 404)
    if len(str(payload.current_answer or "")) > 2000:
        raise AppError("VALIDATION_ERROR", "Jawaban terlalu panjang.", 422)

    ai._check_rate(user.id, get_settings().ai_student_calls_per_hour, bucket="siswa")
    history = [t.model_dump() for t in payload.history]
    reply, choices, status = tutor.ask(act.content, step, payload.question, history, payload.current_answer,
                                       payload.feedback_code)
    db.add(AiChat(user_id=user.id, activity_id=act.id, step_key=step["key"],
                  question=tutor.redact(payload.question), reply=reply, status=status,
                  model=get_settings().gemini_model))
    db.commit()
    return {"reply": reply, "choices": choices, "status": status}


@router.post("/ai/chat")
def chat_gari(payload: ChatIn, db: Session = Depends(get_db), user: User = Depends(get_current_student)):
    _guard(user, payload.supervised)
    # PP-09: tidak ada bantuan AI selama asesmen yang sedang dikerjakan.
    open_sub = db.scalar(select(AssessmentSubmission.id).where(
        AssessmentSubmission.user_id == user.id, AssessmentSubmission.status == "in_progress"))
    if open_sub:
        raise AppError("AI_DURING_ASSESSMENT",
                       "Selesaikan asesmenmu dulu, ya. Setelah itu Gari siap ngobrol lagi.", 403)
    units = list(db.scalars(select(Unit.title).join(Module, Unit.module_id == Module.id)
                            .where(Module.slug == "pgl").order_by(Unit.order_index)))
    ai._check_rate(user.id, get_settings().ai_student_calls_per_hour, bucket="siswa")
    history = [t.model_dump() for t in payload.history]
    reply, choices, status = tutor.ask_general(payload.question, history, units)
    db.add(AiChat(user_id=user.id, activity_id=None, step_key=None, question=tutor.redact(payload.question),
                  reply=reply, status=status, model=get_settings().gemini_model))
    db.commit()
    return {"reply": reply, "choices": choices, "status": status}
