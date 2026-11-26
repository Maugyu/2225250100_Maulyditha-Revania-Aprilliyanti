"""Area peneliti: kelas, progres, buka/tutup asesmen, ekspor CSV, penilaian rubrik."""

import random

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.errors import AppError
from app.deps import get_current_researcher
from app.models import (
    AiLog,
    Assessment,
    AssessmentSubmission,
    Attempt,
    ClassAssessment,
    Classroom,
    ItemResponse,
    Reflection,
    RubricScore,
    StepResponse,
    Unit,
    User,
    utcnow,
)
from app.routers.learning import _default_module
from app.schemas.api import OpenToggleIn, ScoringIn
from app.services import ai
from app.services.diagnostics import PHASE_OF_CODE, class_diagnostics
from app.services.export import DATASETS, build_csv
from app.services.progress import unit_statuses

router = APIRouter(prefix="/researcher", tags=["researcher"])


def _class_or_404(db: Session, code: str) -> Classroom:
    c = db.scalar(select(Classroom).where(Classroom.code == code.upper()))
    if not c:
        raise AppError("NOT_FOUND", "Kelas tidak ditemukan.", 404)
    return c


@router.get("/classes")
def list_classes(db: Session = Depends(get_db), _r: User = Depends(get_current_researcher)):
    out = []
    for c in db.scalars(select(Classroom).order_by(Classroom.code)):
        n = db.scalar(select(func.count(User.id)).where(User.class_id == c.id))
        out.append({"code": c.code, "label": c.label, "student_count": n,
                    "ai_student_enabled": c.ai_student_enabled})
    return out


@router.get("/classes/{class_code}/progress")
def class_progress(
    class_code: str, db: Session = Depends(get_db), _r: User = Depends(get_current_researcher)
):
    c = _class_or_404(db, class_code)
    module = _default_module(db)
    students = []
    for u in db.scalars(select(User).where(User.class_id == c.id).order_by(User.username)):
        hints = db.scalar(
            select(func.coalesce(func.sum(StepResponse.hint_level_max), 0))
            .join(Attempt, StepResponse.attempt_id == Attempt.id)
            .where(Attempt.user_id == u.id)
        )
        last = db.scalar(select(func.max(Attempt.updated_at)).where(Attempt.user_id == u.id))
        students.append({
            "username": u.username,
            "units": {s["slug"]: s["status"] for s in unit_statuses(db, u, module)},
            "hints_used": int(hints or 0),
            "last_active_at": last,
        })
    assessments = []
    for a in db.scalars(select(Assessment).order_by(Assessment.id)):
        ca = db.scalar(
            select(ClassAssessment).where(
                ClassAssessment.class_id == c.id, ClassAssessment.assessment_id == a.id
            )
        )
        submitted = db.scalar(
            select(func.count(AssessmentSubmission.id))
            .join(User, AssessmentSubmission.user_id == User.id)
            .where(User.class_id == c.id, AssessmentSubmission.assessment_id == a.id,
                   AssessmentSubmission.status == "submitted")
        )
        assessments.append({"id": a.id, "slug": a.slug, "kind": a.kind, "title": a.title,
                            "is_open": bool(ca and ca.is_open), "submitted": submitted})
    return {
        "class_code": c.code, "label": c.label, "ai_student_enabled": c.ai_student_enabled,
        "units": [{"slug": u.slug, "title": u.title, "order_index": u.order_index} for u in module.units],
        "students": students, "assessments": assessments,
    }


@router.patch("/classes/{class_code}/assessments/{assessment_id}")
def toggle_assessment(
    class_code: str, assessment_id: int, payload: OpenToggleIn,
    db: Session = Depends(get_db), _r: User = Depends(get_current_researcher),
):
    c = _class_or_404(db, class_code)
    if not db.get(Assessment, assessment_id):
        raise AppError("NOT_FOUND", "Asesmen tidak ditemukan.", 404)
    ca = db.scalar(
        select(ClassAssessment).where(
            ClassAssessment.class_id == c.id, ClassAssessment.assessment_id == assessment_id
        )
    ) or ClassAssessment(class_id=c.id, assessment_id=assessment_id)
    ca.is_open = payload.is_open
    if payload.is_open:
        ca.opened_at = utcnow()
    else:
        ca.closed_at = utcnow()
    db.add(ca)
    db.commit()
    return {"is_open": ca.is_open}


@router.get("/classes/{class_code}/diagnostics")
def diagnostics(class_code: str, db: Session = Depends(get_db), _r: User = Depends(get_current_researcher)):
    """Diagnostik RMT: profil fungsi kognitif (Input/Elaborasi/Output) + asesmen dinamis."""
    c = _class_or_404(db, class_code)
    return {"class_code": c.code, "mapping": PHASE_OF_CODE, "students": class_diagnostics(db, c)}


@router.patch("/classes/{class_code}/ai")
def toggle_student_ai(
    class_code: str, payload: OpenToggleIn,
    db: Session = Depends(get_db), _r: User = Depends(get_current_researcher),
):
    """Izinkan "Tanya Gari" untuk siswa kelas ini (setelah persetujuan & pendampingan orang tua — ADR-018)."""
    c = _class_or_404(db, class_code)
    c.ai_student_enabled = payload.is_open
    db.commit()
    return {"ai_student_enabled": c.ai_student_enabled}


@router.get("/export/{dataset}.csv")
def export_csv(
    dataset: str, class_code: str, db: Session = Depends(get_db),
    _r: User = Depends(get_current_researcher),
):
    if dataset not in DATASETS:
        raise AppError("NOT_FOUND", "Dataset tidak dikenal.", 404)
    c = _class_or_404(db, class_code)
    body = build_csv(db, dataset, c)
    filename = f"{c.code}_{dataset}.csv"
    return Response(
        content=body, media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/scoring/queue")
def scoring_queue(
    assessment_id: int | None = None, blind: bool = True,
    db: Session = Depends(get_db), rater: User = Depends(get_current_researcher),
):
    """Jawaban terkirim yang belum dinilai penilai ini, diacak (penilaian buta)."""
    q = (
        select(ItemResponse, AssessmentSubmission, User)
        .join(AssessmentSubmission, ItemResponse.submission_id == AssessmentSubmission.id)
        .join(User, AssessmentSubmission.user_id == User.id)
        .where(AssessmentSubmission.status == "submitted")
    )
    if assessment_id:
        q = q.where(AssessmentSubmission.assessment_id == assessment_id)
    rows = []
    for ir, sub, u in db.execute(q):
        mine = {
            s.indicator: {"score": s.score, "note": s.note}
            for s in db.scalars(
                select(RubricScore).where(
                    RubricScore.item_response_id == ir.id, RubricScore.rater_id == rater.id
                )
            )
        }
        rows.append({
            "item_response_id": ir.id,
            "username": None if blind else u.username,
            "assessment_kind": None if blind else sub.assessment.kind,
            "item_key": ir.item.item_key,
            "prompt": ir.item.prompt,
            "indicators": ir.item.indicators,
            "response": ir.response,
            "auto_scores": ir.auto_scores,
            "my_scores": mine,
        })
    random.Random(rater.id).shuffle(rows)
    return rows


@router.put("/scoring/{item_response_id}")
def save_scores(
    item_response_id: int, payload: ScoringIn,
    db: Session = Depends(get_db), rater: User = Depends(get_current_researcher),
):
    ir = db.get(ItemResponse, item_response_id)
    if not ir:
        raise AppError("NOT_FOUND", "Jawaban tidak ditemukan.", 404)
    allowed = set(ir.item.indicators)
    for entry in payload.scores:
        if entry.indicator not in allowed:
            raise AppError("VALIDATION_ERROR", "Indikator tidak sesuai butir.", 422,
                           [{"field": "indicator", "issue": entry.indicator}])
        rs = db.scalar(
            select(RubricScore).where(
                RubricScore.item_response_id == ir.id,
                RubricScore.indicator == entry.indicator,
                RubricScore.rater_id == rater.id,
            )
        ) or RubricScore(item_response_id=ir.id, indicator=entry.indicator, rater_id=rater.id)
        rs.score, rs.note, rs.scored_at = entry.score, entry.note, utcnow()
        db.add(rs)
    db.commit()
    return {"saved": len(payload.scores)}


# ---------------------------------------------------------------- AI peneliti (ADR-016)

@router.get("/ai/status")
def ai_status(_r: User = Depends(get_current_researcher)):
    s = get_settings()
    return {"enabled": s.ai_enabled, "model": s.gemini_model if s.ai_enabled else None}


@router.post("/ai/score-suggestion/{item_response_id}")
def ai_score_suggestion(
    item_response_id: int, db: Session = Depends(get_db), rater: User = Depends(get_current_researcher)
):
    """Saran skor rubrik dari AI. TIDAK disimpan sebagai skor — peneliti yang memutuskan."""
    ir = db.get(ItemResponse, item_response_id)
    if not ir or ir.submission.status != "submitted":
        raise AppError("NOT_FOUND", "Jawaban terkirim tidak ditemukan.", 404)
    ai._check_rate(rater.id)
    item = ir.item
    prompt = ai.build_score_prompt(item.prompt, ir.response, item.indicators, item.answer_key)
    raw = ai.call_gemini(ai.SCORE_SYSTEM, prompt, ai.SCORE_SCHEMA)
    result = ai.clean_suggestions(raw, item.indicators)
    db.add(AiLog(researcher_id=rater.id, kind="score_suggestion", item_response_id=ir.id,
                 model=get_settings().gemini_model, output=result))
    db.commit()
    return {**result, "model": get_settings().gemini_model}


@router.post("/ai/reflection-summary")
def ai_reflection_summary(
    class_code: str, unit_slug: str,
    db: Session = Depends(get_db), rater: User = Depends(get_current_researcher),
):
    """Ringkasan tema refleksi satu kelas untuk satu unit. Teks dikirim tanpa kode siswa, diacak."""
    c = _class_or_404(db, class_code)
    unit = db.scalar(select(Unit).where(Unit.slug == unit_slug))
    if not unit:
        raise AppError("NOT_FOUND", "Unit tidak ditemukan.", 404)
    rows = [
        (r.explanation, r.confidence)
        for r in db.scalars(
            select(Reflection)
            .join(User, Reflection.user_id == User.id)
            .where(User.class_id == c.id, Reflection.unit_id == unit.id, Reflection.skipped.is_(False))
        )
        if r.explanation
    ]
    if len(rows) < 3:
        raise AppError("NOT_ENOUGH_DATA", "Minimal 3 refleksi diperlukan agar ringkasan bermakna.", 400)
    random.Random(len(rows)).shuffle(rows)
    rows = rows[:80]
    last_step = unit.activities[-1].content["steps"][-1]
    ai._check_rate(rater.id)
    prompt = ai.build_summary_prompt(unit.title, last_step.get("prompt", ""), rows)
    raw = ai.call_gemini(ai.SUMMARY_SYSTEM, prompt, ai.SUMMARY_SCHEMA)
    result = {k: raw.get(k) for k in ("understood", "misconceptions", "confidence_pattern",
                                      "teaching_suggestions")}
    result["reflection_count"] = len(rows)
    db.add(AiLog(researcher_id=rater.id, kind="reflection_summary", scope=f"{c.code}/{unit.slug}",
                 model=get_settings().gemini_model, output=result))
    db.commit()
    return {**result, "model": get_settings().gemini_model}
