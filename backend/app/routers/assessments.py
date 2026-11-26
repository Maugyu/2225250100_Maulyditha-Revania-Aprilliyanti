"""Asesmen literasi pretes/postes (F-14). Kunci jawaban tidak pernah dikirim ke siswa (PP-09)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError
from app.deps import get_current_student
from app.models import (
    Assessment,
    AssessmentItem,
    AssessmentSubmission,
    ClassAssessment,
    ItemResponse,
    User,
    utcnow,
)
from app.schemas.api import ItemResponseIn
from app.services.scoring import auto_score_item

router = APIRouter(tags=["assessments"])


def _is_open(db: Session, user: User, assessment_id: int) -> bool:
    ca = db.scalar(
        select(ClassAssessment).where(
            ClassAssessment.class_id == user.class_id,
            ClassAssessment.assessment_id == assessment_id,
        )
    )
    return bool(ca and ca.is_open)


def _public_item(item: AssessmentItem) -> dict:
    return {"id": item.id, "item_key": item.item_key, "prompt": item.prompt}


def _submission_out(db: Session, sub: AssessmentSubmission) -> dict:
    responses = {
        r.item_id: r.response
        for r in db.scalars(select(ItemResponse).where(ItemResponse.submission_id == sub.id))
    }
    a = sub.assessment
    return {
        "id": sub.id,
        "status": sub.status,
        "assessment": {"id": a.id, "slug": a.slug, "kind": a.kind, "title": a.title,
                       "instructions": a.instructions},
        "items": [_public_item(i) for i in a.items],
        "responses": {str(k): v for k, v in responses.items()},
        "submitted_at": sub.submitted_at,
    }


def _own_submission(db: Session, user: User, submission_id: int) -> AssessmentSubmission:
    sub = db.get(AssessmentSubmission, submission_id)
    if not sub or sub.user_id != user.id:
        raise AppError("NOT_FOUND", "Asesmen tidak ditemukan.", 404)
    return sub


@router.get("/me/assessments")
def my_assessments(db: Session = Depends(get_db), user: User = Depends(get_current_student)):
    out = []
    for a in db.scalars(select(Assessment).order_by(Assessment.kind.desc(), Assessment.id)):
        sub = db.scalar(
            select(AssessmentSubmission).where(
                AssessmentSubmission.user_id == user.id, AssessmentSubmission.assessment_id == a.id
            )
        )
        out.append({
            "id": a.id, "slug": a.slug, "kind": a.kind, "title": a.title,
            "item_count": len(a.items), "is_open": _is_open(db, user, a.id),
            "submission_id": sub.id if sub else None,
            "submission_status": sub.status if sub else None,
        })
    return out


@router.post("/assessments/{assessment_id}/submissions", status_code=201)
def start_submission(
    assessment_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_student)
):
    a = db.get(Assessment, assessment_id)
    if not a:
        raise AppError("NOT_FOUND", "Asesmen tidak ditemukan.", 404)
    sub = db.scalar(
        select(AssessmentSubmission).where(
            AssessmentSubmission.user_id == user.id, AssessmentSubmission.assessment_id == a.id
        )
    )
    if sub:
        return _submission_out(db, sub)
    if not _is_open(db, user, a.id):
        raise AppError("ASSESSMENT_CLOSED", "Asesmen belum dibuka.", 403)
    sub = AssessmentSubmission(user_id=user.id, assessment_id=a.id)
    db.add(sub)
    db.commit()
    return _submission_out(db, sub)


@router.get("/submissions/{submission_id}")
def get_submission(
    submission_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_student)
):
    return _submission_out(db, _own_submission(db, user, submission_id))


@router.put("/submissions/{submission_id}/responses/{item_id}")
def save_item_response(
    submission_id: int, item_id: int, payload: ItemResponseIn,
    db: Session = Depends(get_db), user: User = Depends(get_current_student),
):
    sub = _own_submission(db, user, submission_id)
    if sub.status == "submitted":
        raise AppError("ASSESSMENT_ALREADY_SUBMITTED", "Jawaban sudah dikirim.", 400)
    if not _is_open(db, user, sub.assessment_id):
        raise AppError("ASSESSMENT_CLOSED", "Asesmen sudah ditutup.", 403)
    item = db.get(AssessmentItem, item_id)
    if not item or item.assessment_id != sub.assessment_id:
        raise AppError("NOT_FOUND", "Butir tidak ditemukan.", 404)
    ir = db.scalar(
        select(ItemResponse).where(ItemResponse.submission_id == sub.id, ItemResponse.item_id == item.id)
    ) or ItemResponse(submission_id=sub.id, item_id=item.id)
    ir.response = payload.response
    ir.updated_at = utcnow()
    db.add(ir)
    db.commit()
    return {"saved_at": ir.updated_at}


@router.post("/submissions/{submission_id}/submit")
def submit(submission_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_student)):
    sub = _own_submission(db, user, submission_id)
    if sub.status == "submitted":
        raise AppError("ASSESSMENT_ALREADY_SUBMITTED", "Jawaban sudah dikirim.", 400)
    for ir in db.scalars(select(ItemResponse).where(ItemResponse.submission_id == sub.id)):
        if ir.item.answer_key:
            ir.auto_scores = auto_score_item(ir.response, ir.item.answer_key)
    sub.status = "submitted"
    sub.submitted_at = utcnow()
    db.commit()
    return {"status": sub.status, "submitted_at": sub.submitted_at}
