"""Diagnostik RMT (Kinard & Kozulin, 2008) dari data proses latihan.

1. Profil fungsi kognitif (Feuerstein): kode kesalahan dipetakan ke fase pemrosesan
   Input (mengumpulkan informasi) · Elaborasi (mengolah/merelasikan) ·
   Output (mengekspresikan dengan presisi).
2. Asesmen dinamis ("cake"): hasil akhir tiap langkah bernilai dikelompokkan menjadi
   mandiri (benar tanpa petunjuk) · dimediasi (benar setelah petunjuk) · dibuka (pembahasan dibuka).

CATATAN: pemetaan kode → fase adalah HIPOTESIS kerja peneliti, belum divalidasi.
Gunakan sebagai petunjuk awal untuk observasi/wawancara, bukan diagnosis individual.
"""

from collections import Counter, defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Attempt, Classroom, StepResponse, User

PHASE_OF_CODE = {
    # Input — persepsi & pengumpulan data yang tepat
    "MISSED_INFO": "input",
    "IRRELEVANT_SELECTED": "input",
    "XY_SWAP": "input",
    "NOT_ON_LINE": "input",
    # Elaborasi — merelasikan, merencanakan, penalaran
    "M_C_SWAP": "elaborasi",
    "ORDER_MISMATCH": "elaborasi",
    "RECIPROCAL": "elaborasi",
    "PLAN_ORDER": "elaborasi",
    # Output — presisi & akurasi ekspresi jawaban
    "SIGN_FLIP": "output",
    "ARITH": "output",
    "EXTRA_POINT": "output",
}
PHASES = ("input", "elaborasi", "output")
PHASE_LABEL = {"input": "Input", "elaborasi": "Elaborasi", "output": "Output"}


def _student_profile(rows: list[StepResponse]) -> dict:
    phases: Counter = Counter()
    codes: Counter = Counter()
    final: dict[tuple[int, str], StepResponse] = {}
    for r in rows:
        if r.is_correct is False and r.feedback_code in PHASE_OF_CODE:
            phases[PHASE_OF_CODE[r.feedback_code]] += 1
            codes[r.feedback_code] += 1
        if r.is_correct is not None:
            key = (r.attempt_id, r.step_key)
            if key not in final or r.answered_at >= final[key].answered_at:
                final[key] = r
    dyn = Counter()
    for r in final.values():
        if r.solution_revealed:
            dyn["dibuka"] += 1
        elif r.is_correct and r.hint_level_max == 0:
            dyn["mandiri"] += 1
        elif r.is_correct:
            dyn["dimediasi"] += 1
    total_err = sum(phases.values())
    dominant = max(PHASES, key=lambda p: phases[p]) if total_err else None
    return {
        "errors": {p: phases[p] for p in PHASES},
        "dominant_phase": dominant,
        "top_codes": [c for c, _ in codes.most_common(3)],
        "dynamic": {k: dyn[k] for k in ("mandiri", "dimediasi", "dibuka")},
    }


def class_diagnostics(db: Session, classroom: Classroom) -> list[dict]:
    q = (
        select(StepResponse, User.username)
        .join(Attempt, StepResponse.attempt_id == Attempt.id)
        .join(User, Attempt.user_id == User.id)
        .where(User.class_id == classroom.id)
    )
    by_user: dict[str, list[StepResponse]] = defaultdict(list)
    for r, username in db.execute(q):
        by_user[username].append(r)
    students = db.scalars(select(User.username).where(User.class_id == classroom.id).order_by(User.username))
    return [{"username": u, **_student_profile(by_user.get(u, []))} for u in students]
