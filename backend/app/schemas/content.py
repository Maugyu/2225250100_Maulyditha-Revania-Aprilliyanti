"""Skema & validator file konten JSON (ADR-010).

Validator menegakkan prinsip pedagogis yang dapat dicek otomatis:
PP-01 (metadata literasi), PP-04 (petunjuk maks. 3 level), PP-05 (glosarium), PP-08 (≤ 80 kata).
"""

import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

STEP_TYPES = {
    "info", "choice", "numeric", "worked_example", "explore", "plot_points", "read_point",
    "identify_info", "known_asked", "define_variables", "linear_model", "check_back",
    "interpret", "evaluate", "explain", "reflection",
    "plan",  # RMT: Perencanaan Tindakan — menyusun urutan langkah sebelum menghitung
}
PROCESSES = {"formulate", "employ", "interpret", "evaluate", "reasoning"}
PHASES = {"hook", "explore", "example", "guided", "practice", "context_problem", "reflect"}
INDICATORS = {"F1", "F2", "F3", "E1", "E2", "E3", "I1", "I2"}
MAX_SITUATION_WORDS = 80
TERM_RE = re.compile(r"\[\[([a-z0-9_]+)(?:\|[^\]]+)?\]\]")
SPAN_RE = re.compile(r"\{\{[a-z0-9]+\|([^}]+)\}\}")


class Step(BaseModel):
    model_config = ConfigDict(extra="allow")
    key: str = Field(pattern=r"^[a-z0-9-]{1,40}$")
    type: str
    hints: list[str] = Field(default_factory=list, max_length=3)

    @field_validator("type")
    @classmethod
    def _type_known(cls, v: str) -> str:
        if v not in STEP_TYPES:
            raise ValueError(f"jenis langkah tidak dikenal: {v}")
        return v


class ActivityContent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int = 1
    situation: str | None = None  # teks situasi kontekstual, dapat dibaca ulang di setiap langkah
    steps: list[Step] = Field(min_length=1)

    @field_validator("steps")
    @classmethod
    def _unique_keys(cls, steps: list[Step]) -> list[Step]:
        keys = [s.key for s in steps]
        if len(keys) != len(set(keys)):
            raise ValueError("kunci langkah harus unik")
        return steps


class ActivityFile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    slug: str
    phase: str
    title: str
    literacy_processes: list[str] = Field(min_length=1)  # PP-01
    indicators: list[str] = Field(min_length=1)  # PP-01
    context_category: str | None = None
    is_required: bool = True
    content: ActivityContent

    @field_validator("phase")
    @classmethod
    def _phase(cls, v: str) -> str:
        if v not in PHASES:
            raise ValueError(f"fase tidak dikenal: {v}")
        return v

    @field_validator("literacy_processes")
    @classmethod
    def _proc(cls, v: list[str]) -> list[str]:
        bad = set(v) - PROCESSES
        if bad:
            raise ValueError(f"proses literasi tidak dikenal: {bad}")
        return v

    @field_validator("indicators")
    @classmethod
    def _ind(cls, v: list[str]) -> list[str]:
        bad = set(v) - INDICATORS
        if bad:
            raise ValueError(f"indikator tidak dikenal: {bad}")
        return v


class UnitFile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    slug: str
    order_index: int
    title: str
    goal: str
    is_optional: bool = False
    activities: list[ActivityFile] = Field(min_length=1)


class GlossaryEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    key: str
    term: str
    definition: str = Field(max_length=300)
    example: str | None = None


class ModuleFile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    slug: str
    title: str
    grade: int
    pisa_content_category: str
    description: str | None = None
    content_version: str


def _walk_strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from _walk_strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _walk_strings(v)


def word_count(text: str) -> int:
    plain = SPAN_RE.sub(lambda m: m.group(1), text)
    plain = TERM_RE.sub("x", plain)
    return len([w for w in re.split(r"\s+", plain) if w])


def validate_unit_rules(unit: UnitFile, glossary_keys: set[str]) -> list[str]:
    """Mengembalikan daftar pelanggaran PP-05 & PP-08 (kosong = lolos)."""
    problems: list[str] = []
    for act in unit.activities:
        situation = act.content.situation
        if situation:
            for term in TERM_RE.findall(situation):
                if term not in glossary_keys:
                    problems.append(f"{unit.slug}/{act.slug}: istilah '{term}' tanpa glosarium (PP-05)")
            if word_count(situation) > MAX_SITUATION_WORDS:
                problems.append(f"{unit.slug}/{act.slug}: situasi > {MAX_SITUATION_WORDS} kata (PP-08)")
        for step in act.content.steps:
            data = step.model_dump()
            for s in _walk_strings(data):
                for term in TERM_RE.findall(s):
                    if term not in glossary_keys:
                        where = f"{unit.slug}/{act.slug}/{step.key}"
                        problems.append(f"{where}: istilah '{term}' tanpa glosarium (PP-05)")
            situation = data.get("situation")
            if isinstance(situation, str) and word_count(situation) > MAX_SITUATION_WORDS:
                where = f"{unit.slug}/{act.slug}/{step.key}"
                problems.append(f"{where}: situasi > {MAX_SITUATION_WORDS} kata (PP-08)")
    return problems
