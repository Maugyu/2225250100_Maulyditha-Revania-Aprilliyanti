"""Schema request/response API (kontrak: project-planning/technical/API_SPECIFICATION.md)."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

FEEDBACK_CODES = {
    "SIGN_FLIP", "ORDER_MISMATCH", "RECIPROCAL", "M_C_SWAP", "XY_SWAP", "ARITH",
    "IRRELEVANT_SELECTED", "MISSED_INFO", "EXTRA_POINT", "NOT_ON_LINE", "INCOMPLETE",
    "PLAN_ORDER",
}


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class LoginIn(Strict):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9-]+$")
    pin: str = Field(min_length=6, max_length=64)


class UserOut(BaseModel):
    username: str
    role: str
    class_code: str | None


class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class AttemptIn(Strict):
    client_id: str = Field(min_length=8, max_length=36)
    activity_id: int
    content_version: str = Field(max_length=20)
    started_at: datetime | None = None


class AttemptOut(BaseModel):
    id: int
    client_id: str
    activity_id: int
    status: str
    last_step_key: str | None


class AttemptPatch(Strict):
    last_step_key: str | None = Field(default=None, max_length=40)
    status: Literal["in_progress", "completed"] | None = None
    completed_at: datetime | None = None


class StepResponseIn(Strict):
    client_id: str = Field(min_length=8, max_length=36)
    step_key: str = Field(max_length=40)
    step_type: str = Field(max_length=30)
    try_number: int = Field(ge=1, le=100)
    response: dict[str, Any]
    is_correct: bool | None = None
    feedback_code: str | None = Field(default=None, max_length=30)
    hint_level_max: int = Field(default=0, ge=0, le=3)
    solution_revealed: bool = False
    answered_at: datetime | None = None


class ReflectionIn(Strict):
    client_id: str = Field(min_length=8, max_length=36)
    unit_slug: str = Field(max_length=50)
    prompt_key: str = Field(max_length=40)
    explanation: str | None = Field(default=None, max_length=500)
    transfer: str | None = Field(default=None, max_length=300)  # RMT: transendensi
    confidence: int | None = Field(default=None, ge=1, le=4)
    skipped: bool = False


class ItemResponseIn(Strict):
    response: dict[str, Any]


class OpenToggleIn(Strict):
    is_open: bool


class ScoreEntry(Strict):
    indicator: Literal["F1", "F2", "F3", "E1", "E2", "E3", "I1", "I2"]
    score: int = Field(ge=0, le=3)
    note: str | None = Field(default=None, max_length=500)


class ScoringIn(Strict):
    scores: list[ScoreEntry] = Field(min_length=1, max_length=8)
