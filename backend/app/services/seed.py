"""Memuat konten JSON ke basis data secara idempoten (upsert berdasarkan slug)."""

import json
from pathlib import Path

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, Assessment, AssessmentItem, GlossaryTerm, Module, Unit
from app.schemas.content import GlossaryEntry, ModuleFile, UnitFile, validate_unit_rules


class ContentError(Exception):
    pass


def _load(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ContentError(f"{path.name}: JSON tidak valid ({exc})") from exc


def seed_module(db: Session, folder: Path) -> Module:
    try:
        mod_file = ModuleFile(**_load(folder / "module.json"))
        glossary = [GlossaryEntry(**g) for g in _load(folder / "glossary.json")]
        units = [UnitFile(**_load(p)) for p in sorted((folder / "units").glob("*.json"))]
    except ValidationError as exc:
        raise ContentError(str(exc)) from exc

    keys = {g.key for g in glossary}
    problems = [p for u in units for p in validate_unit_rules(u, keys)]
    if problems:
        raise ContentError("Konten melanggar prinsip pedagogis:\n- " + "\n- ".join(problems))

    module = db.scalar(select(Module).where(Module.slug == mod_file.slug)) or Module(slug=mod_file.slug)
    for field in ("title", "grade", "pisa_content_category", "description", "content_version"):
        setattr(module, field, getattr(mod_file, field))
    module.is_published = True
    db.add(module)
    db.flush()

    existing_terms = {
        t.key: t for t in db.scalars(select(GlossaryTerm).where(GlossaryTerm.module_id == module.id))
    }
    for g in glossary:
        term = existing_terms.pop(g.key, None) or GlossaryTerm(module_id=module.id, key=g.key)
        term.term, term.definition, term.example = g.term, g.definition, g.example
        db.add(term)
    for leftover in existing_terms.values():
        db.delete(leftover)

    for uf in units:
        unit = db.scalar(
            select(Unit).where(Unit.module_id == module.id, Unit.slug == uf.slug)
        ) or Unit(module_id=module.id, slug=uf.slug)
        unit.order_index, unit.title, unit.goal = uf.order_index, uf.title, uf.goal
        unit.is_optional = uf.is_optional
        db.add(unit)
        db.flush()
        for idx, af in enumerate(uf.activities):
            act = db.scalar(
                select(Activity).where(Activity.unit_id == unit.id, Activity.slug == af.slug)
            ) or Activity(unit_id=unit.id, slug=af.slug)
            act.order_index = idx
            act.phase, act.title = af.phase, af.title
            act.literacy_processes, act.indicators = af.literacy_processes, af.indicators
            act.context_category, act.is_required = af.context_category, af.is_required
            act.content = af.content.model_dump()
            db.add(act)
    db.flush()

    for path in sorted((folder / "assessments").glob("*.json")):
        seed_assessment(db, module, _load(path))
    db.commit()
    return module


def seed_assessment(db: Session, module: Module, data: dict) -> Assessment:
    for k in ("slug", "kind", "title", "instructions", "items"):
        if k not in data:
            raise ContentError(f"asesmen tanpa field '{k}'")
    a = db.scalar(select(Assessment).where(Assessment.slug == data["slug"])) or Assessment(
        slug=data["slug"]
    )
    a.module_id, a.kind, a.title, a.instructions = (
        module.id, data["kind"], data["title"], data["instructions"],
    )
    db.add(a)
    db.flush()
    existing = {i.item_key: i for i in a.items}
    for idx, item in enumerate(data["items"]):
        it = existing.get(item["item_key"]) or AssessmentItem(
            assessment_id=a.id, item_key=item["item_key"]
        )
        it.order_index, it.prompt = idx, item["prompt"]
        it.answer_key, it.indicators = item.get("answer_key"), item["indicators"]
        db.add(it)
    return a
