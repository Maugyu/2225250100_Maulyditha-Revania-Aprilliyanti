"""CLI peneliti (ADR-013). Pemakaian: python -m app.cli <perintah> --help"""

import argparse
import csv
import sys
from pathlib import Path

from sqlalchemy import select

from app.core.config import BASE_DIR, get_settings
from app.core.database import SessionLocal
from app.core.security import generate_pin, hash_pin
from app.models import (
    AssessmentSubmission,
    Attempt,
    ClassAssessment,
    Classroom,
    ItemResponse,
    Reflection,
    RubricScore,
    StepResponse,
    User,
)
from app.services.seed import ContentError, seed_module

DEMO_PIN = "123456"


def cmd_seed(args) -> int:
    with SessionLocal() as db:
        try:
            m = seed_module(db, Path(args.folder))
        except ContentError as exc:
            print(f"GAGAL seed konten:\n{exc}", file=sys.stderr)
            return 1
        print(f"Konten {m.slug} versi {m.content_version} dimuat: {len(m.units)} unit.")
    return 0


def _get_class(db, code: str, label: str | None = None) -> Classroom:
    c = db.scalar(select(Classroom).where(Classroom.code == code.upper()))
    if not c:
        c = Classroom(code=code.upper(), label=label or f"Kelas {code.upper()}")
        db.add(c)
        db.flush()
    return c


def cmd_create_students(args) -> int:
    code = args.class_code.upper()
    out = Path(args.out) if args.out else BASE_DIR / "exports" / f"akun_{code}.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with SessionLocal() as db:
        c = _get_class(db, code, args.label)
        last = db.scalar(select(User).where(User.class_id == c.id).order_by(User.id.desc()))
        start = int(last.username.rsplit("-", 1)[1]) + 1 if last else 1
        rows = []
        for i in range(start, start + args.count):
            username, pin = f"{c.code}-{i:02d}", generate_pin()
            db.add(User(username=username, pin_hash=hash_pin(pin), role="student", class_id=c.id))
            rows.append((username, pin))
        db.commit()
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["kode_siswa", "pin"])
        writer.writerows(rows)
    print(f"{len(rows)} akun dibuat. Daftar kode+PIN: {out}")
    print("Bagikan lalu simpan file ini di tempat aman; PIN tidak dapat dilihat lagi.")
    return 0


def cmd_create_researcher(args) -> int:
    pin = args.pin or generate_pin(10)
    username = args.username.upper()
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username == username)):
            print("Username sudah ada.", file=sys.stderr)
            return 1
        db.add(User(username=username, pin_hash=hash_pin(pin), role="researcher"))
        db.commit()
    print(f"Peneliti {username} dibuat. PIN/kata sandi: {pin}")
    return 0


def cmd_reset_pin(args) -> int:
    pin = generate_pin()
    with SessionLocal() as db:
        u = db.scalar(select(User).where(User.username == args.username.upper()))
        if not u:
            print("Pengguna tidak ditemukan.", file=sys.stderr)
            return 1
        u.pin_hash = hash_pin(pin)
        db.commit()
    print(f"PIN baru {u.username}: {pin}")
    return 0


def _delete_user_data(db, u: User) -> None:
    for a in db.scalars(select(Attempt).where(Attempt.user_id == u.id)).all():
        for r in db.scalars(select(StepResponse).where(StepResponse.attempt_id == a.id)).all():
            db.delete(r)
        db.delete(a)
    for r in db.scalars(select(Reflection).where(Reflection.user_id == u.id)).all():
        db.delete(r)
    subs = db.scalars(select(AssessmentSubmission).where(AssessmentSubmission.user_id == u.id)).all()
    for s in subs:
        for ir in db.scalars(select(ItemResponse).where(ItemResponse.submission_id == s.id)).all():
            for rs in db.scalars(select(RubricScore).where(RubricScore.item_response_id == ir.id)).all():
                db.delete(rs)
            db.delete(ir)
        db.delete(s)
    db.flush()
    db.delete(u)


def cmd_delete_student(args) -> int:
    with SessionLocal() as db:
        u = db.scalar(select(User).where(User.username == args.username.upper()))
        if not u:
            print("Pengguna tidak ditemukan.", file=sys.stderr)
            return 1
        _delete_user_data(db, u)
        db.commit()
    print("Data siswa dihapus.")
    return 0


def cmd_delete_class(args) -> int:
    with SessionLocal() as db:
        c = db.scalar(select(Classroom).where(Classroom.code == args.class_code.upper()))
        if not c:
            print("Kelas tidak ditemukan.", file=sys.stderr)
            return 1
        for u in db.scalars(select(User).where(User.class_id == c.id)).all():
            _delete_user_data(db, u)
        for ca in db.scalars(select(ClassAssessment).where(ClassAssessment.class_id == c.id)).all():
            db.delete(ca)
        db.flush()
        db.delete(c)
        db.commit()
    print("Seluruh data kelas dihapus.")
    return 0


def cmd_demo(_args) -> int:
    """Akun demo dengan PIN tetap. HANYA untuk pengembangan lokal."""
    if get_settings().is_production:
        print("Perintah demo dilarang di produksi.", file=sys.stderr)
        return 1
    with SessionLocal() as db:
        c = _get_class(db, "DEMO", "Kelas demo (lokal)")
        accounts = (
            ("DEMO-01", "student", c.id),
            ("DEMO-02", "student", c.id),
            ("PENELITI-DEMO", "researcher", None),
        )
        for name, role, class_id in accounts:
            if not db.scalar(select(User).where(User.username == name)):
                db.add(User(username=name, pin_hash=hash_pin(DEMO_PIN), role=role, class_id=class_id))
        db.commit()
    print(f"Akun demo: DEMO-01, DEMO-02 (siswa), PENELITI-DEMO (peneliti). PIN: {DEMO_PIN}")
    return 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="python -m app.cli")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("seed-content", help="muat konten JSON ke DB")
    s.add_argument("folder", nargs="?", default=str(BASE_DIR / "content" / "pgl"))
    s.set_defaults(fn=cmd_seed)

    s = sub.add_parser("create-students", help="buat akun siswa massal")
    s.add_argument("--class", dest="class_code", required=True)
    s.add_argument("--count", type=int, required=True)
    s.add_argument("--label")
    s.add_argument("--out")
    s.set_defaults(fn=cmd_create_students)

    s = sub.add_parser("create-researcher", help="buat akun peneliti")
    s.add_argument("--username", required=True)
    s.add_argument("--pin", help="kosongkan agar dibuat acak (10 digit)")
    s.set_defaults(fn=cmd_create_researcher)

    s = sub.add_parser("reset-pin")
    s.add_argument("--username", required=True)
    s.set_defaults(fn=cmd_reset_pin)

    s = sub.add_parser("delete-student")
    s.add_argument("--username", required=True)
    s.set_defaults(fn=cmd_delete_student)

    s = sub.add_parser("delete-class")
    s.add_argument("--class", dest="class_code", required=True)
    s.set_defaults(fn=cmd_delete_class)

    s = sub.add_parser("demo", help="akun demo lokal (PIN 123456)")
    s.set_defaults(fn=cmd_demo)

    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    raise SystemExit(main())
