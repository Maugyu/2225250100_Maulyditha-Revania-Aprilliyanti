"""Ekspor CSV untuk peneliti (F-15). Hanya pseudonim; aman dari formula injection."""

import csv
import io
import json

from sqlalchemy import select
from sqlalchemy.orm import Session, aliased

from app.models import (
    Activity,
    AiChat,
    AssessmentItem,
    AssessmentSubmission,
    Attempt,
    Classroom,
    ItemResponse,
    Reflection,
    RubricScore,
    StepResponse,
    Unit,
    User,
)

DATASETS = ("attempts", "step_responses", "reflections", "assessment_responses", "rubric_scores", "ai_chats",
            "diagnostics")
_RISKY_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def safe_cell(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        value = json.dumps(value, ensure_ascii=False)
    s = str(value)
    return "'" + s if s.startswith(_RISKY_PREFIXES) else s


def _rows(db: Session, dataset: str, classroom: Classroom):
    users = select(User.id).where(User.class_id == classroom.id)
    if dataset == "attempts":
        yield ["username", "unit", "activity", "status", "content_version", "started_at",
               "completed_at", "last_step_key"]
        q = (
            select(Attempt, User, Activity, Unit)
            .join(User, Attempt.user_id == User.id)
            .join(Activity, Attempt.activity_id == Activity.id)
            .join(Unit, Activity.unit_id == Unit.id)
            .where(Attempt.user_id.in_(users))
            .order_by(User.username, Attempt.started_at)
        )
        for a, u, act, unit in db.execute(q):
            yield [u.username, unit.slug, act.slug, a.status, a.content_version, a.started_at,
                   a.completed_at, a.last_step_key]
    elif dataset == "step_responses":
        yield ["username", "unit", "activity", "step_key", "step_type", "try_number", "response",
               "is_correct", "feedback_code", "hint_level_max", "solution_revealed", "answered_at"]
        q = (
            select(StepResponse, User, Activity, Unit)
            .join(Attempt, StepResponse.attempt_id == Attempt.id)
            .join(User, Attempt.user_id == User.id)
            .join(Activity, Attempt.activity_id == Activity.id)
            .join(Unit, Activity.unit_id == Unit.id)
            .where(Attempt.user_id.in_(users))
            .order_by(User.username, StepResponse.answered_at)
        )
        for r, u, act, unit in db.execute(q):
            yield [u.username, unit.slug, act.slug, r.step_key, r.step_type, r.try_number,
                   r.response, r.is_correct, r.feedback_code, r.hint_level_max,
                   r.solution_revealed, r.answered_at]
    elif dataset == "reflections":
        yield ["username", "unit", "prompt_key", "explanation", "transfer", "confidence", "skipped",
               "created_at"]
        q = (
            select(Reflection, User, Unit)
            .join(User, Reflection.user_id == User.id)
            .join(Unit, Reflection.unit_id == Unit.id)
            .where(Reflection.user_id.in_(users))
        )
        for r, u, unit in db.execute(q):
            yield [u.username, unit.slug, r.prompt_key, r.explanation, r.transfer, r.confidence,
                   r.skipped, r.created_at]
    elif dataset == "assessment_responses":
        yield ["item_response_id", "username", "assessment", "item_key", "status", "response",
               "auto_scores", "updated_at"]
        q = (
            select(ItemResponse, AssessmentSubmission, User, AssessmentItem)
            .join(AssessmentSubmission, ItemResponse.submission_id == AssessmentSubmission.id)
            .join(User, AssessmentSubmission.user_id == User.id)
            .join(AssessmentItem, ItemResponse.item_id == AssessmentItem.id)
            .where(AssessmentSubmission.user_id.in_(users))
        )
        for ir, sub, u, item in db.execute(q):
            yield [ir.id, u.username, sub.assessment.slug, item.item_key, sub.status, ir.response,
                   ir.auto_scores, ir.updated_at]
    elif dataset == "rubric_scores":
        yield ["item_response_id", "username", "item_key", "indicator", "score", "rater", "note",
               "scored_at"]
        rater = aliased(User)
        q = (
            select(RubricScore, ItemResponse, User, AssessmentItem, rater)
            .join(ItemResponse, RubricScore.item_response_id == ItemResponse.id)
            .join(AssessmentSubmission, ItemResponse.submission_id == AssessmentSubmission.id)
            .join(User, AssessmentSubmission.user_id == User.id)
            .join(AssessmentItem, ItemResponse.item_id == AssessmentItem.id)
            .join(rater, RubricScore.rater_id == rater.id)
            .where(AssessmentSubmission.user_id.in_(users))
        )
        for rs, ir, u, item, rt in db.execute(q):
            yield [ir.id, u.username, item.item_key, rs.indicator, rs.score, rt.username, rs.note,
                   rs.scored_at]


def _ai_chat_rows(db: Session, users):
    yield ["username", "unit", "activity", "step_key", "question", "reply", "status", "model", "created_at"]
    q = (
        select(AiChat, User, Activity, Unit)
        .join(User, AiChat.user_id == User.id)
        .outerjoin(Activity, AiChat.activity_id == Activity.id)
        .outerjoin(Unit, Activity.unit_id == Unit.id)
        .where(AiChat.user_id.in_(users))
        .order_by(User.username, AiChat.created_at)
    )
    for ch, u, act, unit in db.execute(q):
        # Obrolan umum (bilah samping) tidak terikat aktivitas.
        yield [u.username, unit.slug if unit else "", act.slug if act else "(obrolan umum)",
               ch.step_key or "", ch.question, ch.reply, ch.status, ch.model, ch.created_at]


def _diagnostic_rows(db: Session, classroom: Classroom):
    from app.services.diagnostics import class_diagnostics

    yield ["username", "err_input", "err_elaborasi", "err_output", "dominant_phase", "top_codes",
           "mandiri", "dimediasi", "dibuka_pembahasan"]
    for s in class_diagnostics(db, classroom):
        e, d = s["errors"], s["dynamic"]
        yield [s["username"], e["input"], e["elaborasi"], e["output"], s["dominant_phase"],
               " ".join(s["top_codes"]), d["mandiri"], d["dimediasi"], d["dibuka"]]


def build_csv(db: Session, dataset: str, classroom: Classroom) -> str:
    buf = io.StringIO()
    buf.write("﻿")  # BOM agar Excel membaca UTF-8
    writer = csv.writer(buf)
    if dataset == "ai_chats":
        rows = _ai_chat_rows(db, select(User.id).where(User.class_id == classroom.id))
    elif dataset == "diagnostics":
        rows = _diagnostic_rows(db, classroom)
    else:
        rows = _rows(db, dataset, classroom)
    for i, row in enumerate(rows):
        writer.writerow(row if i == 0 else [safe_cell(v) for v in row])
    return buf.getvalue()
