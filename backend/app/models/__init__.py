"""Model ORM sesuai project-planning/technical/DATABASE_SCHEMA.md.

Hanya tipe kolom portabel (SQLite <-> PostgreSQL). Tidak ada kolom data pribadi.
"""

from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class Classroom(Base):
    __tablename__ = "classes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    label: Mapped[str] = mapped_column(String(100))
    # "Tanya Gari" (AI) untuk siswa kelas ini — dinyalakan peneliti setelah persetujuan orang tua (ADR-018).
    ai_student_enabled: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role in ('student','researcher')", name="ck_users_role"),
        Index("ix_users_class_id", "class_id"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True)
    pin_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20))
    class_id: Mapped[int | None] = mapped_column(ForeignKey("classes.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    classroom: Mapped[Classroom | None] = relationship()


class Module(Base):
    __tablename__ = "modules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True)
    title: Mapped[str] = mapped_column(String(150))
    grade: Mapped[int] = mapped_column(Integer)
    pisa_content_category: Mapped[str] = mapped_column(String(40))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_version: Mapped[str] = mapped_column(String(20))
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)

    units: Mapped[list["Unit"]] = relationship(
        back_populates="module", order_by="Unit.order_index", cascade="all, delete-orphan"
    )


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("module_id", "slug"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"))
    slug: Mapped[str] = mapped_column(String(50))
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(150))
    goal: Mapped[str] = mapped_column(String(255))
    is_optional: Mapped[bool] = mapped_column(Boolean, default=False)

    module: Mapped[Module] = relationship(back_populates="units")
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="unit", order_by="Activity.order_index", cascade="all, delete-orphan"
    )


class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = (UniqueConstraint("unit_id", "slug"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"))
    slug: Mapped[str] = mapped_column(String(60))
    order_index: Mapped[int] = mapped_column(Integer)
    phase: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(150))
    literacy_processes: Mapped[list] = mapped_column(JSON)
    indicators: Mapped[list] = mapped_column(JSON)
    context_category: Mapped[str | None] = mapped_column(String(40), nullable=True)
    content: Mapped[dict] = mapped_column(JSON)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)

    unit: Mapped[Unit] = relationship(back_populates="activities")


class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"
    __table_args__ = (UniqueConstraint("module_id", "key"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"))
    key: Mapped[str] = mapped_column(String(50))
    term: Mapped[str] = mapped_column(String(80))
    definition: Mapped[str] = mapped_column(String(300))
    example: Mapped[str | None] = mapped_column(String(200), nullable=True)


class Attempt(Base):
    __tablename__ = "attempts"
    __table_args__ = (Index("ix_attempts_user_activity", "user_id", "activity_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[str] = mapped_column(String(36), unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    content_version: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="in_progress")
    last_step_key: Mapped[str | None] = mapped_column(String(40), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    activity: Mapped[Activity] = relationship()


class StepResponse(Base):
    __tablename__ = "step_responses"
    __table_args__ = (Index("ix_step_responses_attempt_step", "attempt_id", "step_key"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[str] = mapped_column(String(36), unique=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("attempts.id"))
    step_key: Mapped[str] = mapped_column(String(40))
    step_type: Mapped[str] = mapped_column(String(30))
    try_number: Mapped[int] = mapped_column(Integer)
    response: Mapped[dict] = mapped_column(JSON)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    feedback_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    hint_level_max: Mapped[int] = mapped_column(Integer, default=0)
    solution_revealed: Mapped[bool] = mapped_column(Boolean, default=False)
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    attempt: Mapped[Attempt] = relationship()


class Reflection(Base):
    __tablename__ = "reflections"
    __table_args__ = (
        CheckConstraint("confidence is null or (confidence between 1 and 4)", name="ck_ref_conf"),
        Index("ix_reflections_user_unit", "user_id", "unit_id"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[str] = mapped_column(String(36), unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"))
    prompt_key: Mapped[str] = mapped_column(String(40))
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Transendensi (RMT/MLE): "Di mana lagi pola ini bisa dipakai?"
    transfer: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[int | None] = mapped_column(Integer, nullable=True)
    skipped: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    unit: Mapped[Unit] = relationship()


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = (CheckConstraint("kind in ('pre','post')", name="ck_assessment_kind"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"))
    slug: Mapped[str] = mapped_column(String(50), unique=True)
    kind: Mapped[str] = mapped_column(String(10))
    title: Mapped[str] = mapped_column(String(150))
    instructions: Mapped[str] = mapped_column(Text)

    items: Mapped[list["AssessmentItem"]] = relationship(
        order_by="AssessmentItem.order_index", cascade="all, delete-orphan"
    )


class AssessmentItem(Base):
    __tablename__ = "assessment_items"
    __table_args__ = (UniqueConstraint("assessment_id", "item_key"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    item_key: Mapped[str] = mapped_column(String(40))
    prompt: Mapped[dict] = mapped_column(JSON)
    answer_key: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    indicators: Mapped[list] = mapped_column(JSON)


class ClassAssessment(Base):
    __tablename__ = "class_assessments"
    __table_args__ = (UniqueConstraint("class_id", "assessment_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"))
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"))
    is_open: Mapped[bool] = mapped_column(Boolean, default=False)
    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"
    __table_args__ = (UniqueConstraint("user_id", "assessment_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"))
    status: Mapped[str] = mapped_column(String(20), default="in_progress")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    assessment: Mapped[Assessment] = relationship()


class ItemResponse(Base):
    __tablename__ = "item_responses"
    __table_args__ = (UniqueConstraint("submission_id", "item_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("assessment_submissions.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("assessment_items.id"))
    response: Mapped[dict] = mapped_column(JSON)
    auto_scores: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    item: Mapped[AssessmentItem] = relationship()
    submission: Mapped[AssessmentSubmission] = relationship()


INDICATORS = ("F1", "F2", "F3", "E1", "E2", "E3", "I1", "I2")


class RubricScore(Base):
    __tablename__ = "rubric_scores"
    __table_args__ = (
        UniqueConstraint("item_response_id", "indicator", "rater_id"),
        CheckConstraint("score between 0 and 3", name="ck_rubric_score"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    item_response_id: Mapped[int] = mapped_column(ForeignKey("item_responses.id"))
    indicator: Mapped[str] = mapped_column(String(5))
    score: Mapped[int] = mapped_column(Integer)
    rater_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    scored_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AiLog(Base):
    """Jejak setiap panggilan AI peneliti (ADR-016) untuk transparansi metodologi."""

    __tablename__ = "ai_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    researcher_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    kind: Mapped[str] = mapped_column(String(30))  # score_suggestion | reflection_summary
    item_response_id: Mapped[int | None] = mapped_column(
        ForeignKey("item_responses.id"), nullable=True
    )
    scope: Mapped[str | None] = mapped_column(String(100), nullable=True)  # mis. "DEMO/u2-gradien"
    model: Mapped[str] = mapped_column(String(60))
    output: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AiChat(Base):
    """Riwayat "Tanya Gari" siswa (ADR-018) — dapat dibaca peneliti & ditunjukkan ke orang tua."""

    __tablename__ = "ai_chats"
    __table_args__ = (Index("ix_ai_chats_user", "user_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # Kosong untuk obrolan umum dari bilah samping (ADR-021).
    activity_id: Mapped[int | None] = mapped_column(ForeignKey("activities.id"), nullable=True)
    step_key: Mapped[str | None] = mapped_column(String(40), nullable=True)
    question: Mapped[str] = mapped_column(Text)
    reply: Mapped[str] = mapped_column(Text)
    # ok | blocked (filter keamanan) | leak_replaced (jawaban akhir terdeteksi & diganti petunjuk)
    status: Mapped[str] = mapped_column(String(20), default="ok")
    model: Mapped[str] = mapped_column(String(60))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
