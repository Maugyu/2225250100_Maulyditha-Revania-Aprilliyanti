"""Uji integritas konten: setiap kunci jawaban harus dapat diproses pemeriksa di frontend.

Kesalahan ketik di JSON (mis. jawaban pilihan yang tidak ada, frasa yang tidak bisa ditandai)
akan membuat siswa tidak pernah bisa menjawab benar — tes ini menangkapnya sebelum uji coba.
"""

import json
import re
from fractions import Fraction
from pathlib import Path

import pytest

from app.services.scoring import parse_number

CONTENT = Path(__file__).resolve().parents[1] / "content" / "pgl"
SPAN_IDS = re.compile(r"\{\{([a-z0-9]+)\|")
# Harus sama dengan M_VALUES / C_VALUES di frontend/src/features/graph/SlopeExplorer.jsx
M_VALUES = {Fraction(v) for v in
            "-4 -3 -2 -3/2 -1 -2/3 -1/2 -1/3 0 1/3 1/2 2/3 1 3/2 2 3 4".split()}
C_VALUES = {Fraction(v) for v in range(-6, 9)}
EXPLORE_GRID = {"x_min": -6, "x_max": 6, "y_min": -6, "y_max": 8}


def _units():
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted((CONTENT / "units").glob("*.json"))]


def _steps():
    for unit in _units():
        for act in unit["activities"]:
            for step in act["content"]["steps"]:
                yield f"{unit['slug']}/{act['slug']}/{step['key']}", act["content"], step


STEPS = list(_steps())


def _num(v, where):
    f = parse_number(v)
    assert f is not None, f"{where}: '{v}' bukan angka yang dapat dibaca pemeriksa"
    return f


@pytest.mark.parametrize("where,content,step", STEPS, ids=[s[0] for s in STEPS])
def test_step_is_answerable(where, content, step):
    t = step["type"]
    if t in ("numeric", "check_back"):
        _num(step["answer"], where)
        for w in step.get("wrong_answers", []):
            assert _num(w["value"], where) != _num(step["answer"], where), f"{where}: jawaban salah = kunci"
    elif t == "choice":
        ids = {o["id"] for o in step["options"]}
        assert step["answer"] in ids, f"{where}: kunci pilihan tidak ada di opsi"
    elif t == "explore":
        q = step.get("question")
        if q:
            assert q["answer"] in {o["id"] for o in q["options"]}, f"{where}: kunci pertanyaan jelajah"
        init = step.get("initial", {})
        for k in ("m", "m2"):
            if k in init:
                assert _num(init[k], where) in M_VALUES, f"{where}: {k} awal tidak ada di slider"
        for k in ("c", "c2"):
            if k in init:
                assert _num(init[k], where) in C_VALUES, f"{where}: {k} awal tidak ada di slider"
    elif t == "linear_model":
        _num(step["answer"]["m"], where)
        _num(step["answer"]["c"], where)
    elif t == "identify_info":
        spans = set(SPAN_IDS.findall(content.get("situation") or ""))
        assert spans, f"{where}: situasi tidak punya frasa {{{{id|teks}}}}"
        assert set(step["relevant"]) <= spans, f"{where}: id relevan tidak ada di situasi"
        assert set(step["relevant"]) != spans, f"{where}: tidak ada pengecoh (EL05 perlu latihan memilah)"
    elif t == "known_asked":
        assert step["required_values"], f"{where}: required_values kosong"
        for v in step["required_values"]:
            _num(v, where)
    elif t == "define_variables":
        assert step["answer"]["x"] in step["options"] and step["answer"]["y"] in step["options"], where
    elif t == "plot_points":
        g = step["grid"]
        for x, y in step["points"]:
            assert g["x_min"] <= x <= g["x_max"] and g["y_min"] <= y <= g["y_max"], f"{where}: titik di luar grid"
            assert x % g.get("x_step", 1) == 0 and y % g.get("y_step", 1) == 0, f"{where}: titik tidak di kisi"
    elif t == "read_point":
        g = step["grid"]
        m, c = _num(step["line"]["m"], where), _num(step["line"]["c"], where)
        lattice = [x for x in range(g["x_min"], g["x_max"] + 1)
                   if (m * x + c).denominator == 1 and g["y_min"] <= m * x + c <= g["y_max"]]
        assert len(lattice) >= 2, f"{where}: garis butuh ≥ 2 titik kisi yang terlihat"
    elif t == "worked_example":
        blanks = [ln["blank"] for ln in step["lines"] if "blank" in ln]
        assert len(blanks) <= 1, f"{where}: maksimal satu isian per contoh"
        for b in blanks:
            _num(b["answer"], where)
    elif t in ("interpret", "evaluate"):
        assert step.get("model_answer"), f"{where}: langkah terbuka perlu contoh jawaban"
    elif t == "reflection":
        assert step.get("prompt_key") and step.get("pattern"), where
        assert step.get("transfer_prompt"), f"{where}: refleksi perlu pertanyaan transendensi (RMT/MLE)"
    elif t == "plan":
        ids = [i["id"] for i in step["items"]]
        assert len(ids) >= 3 and sorted(ids) == sorted(step["answer"]), f"{where}: item & kunci rencana tidak cocok"
        assert ids != step["answer"], f"{where}: urutan tampilan sama dengan kunci (tidak ada yang direncanakan)"

    # PP-04: petunjuk graded tersedia 3 level
    graded = t in {"numeric", "check_back", "choice", "linear_model", "identify_info", "known_asked",
                   "define_variables", "plot_points", "read_point", "plan"} or (t == "explore" and step.get("question"))
    if graded:
        assert len(step.get("hints", [])) == 3, f"{where}: langkah bernilai harus punya 3 petunjuk"


def test_every_context_problem_has_interpret_and_evaluate():
    """PP-07: masalah kontekstual tidak boleh berhenti pada angka."""
    for unit in _units():
        for act in unit["activities"]:
            if act["phase"] != "context_problem":
                continue
            types = {s["type"] for s in act["content"]["steps"]}
            assert "interpret" in types or "choice" in types, act["slug"]
            assert "evaluate" in types, f"{act['slug']}: tidak ada langkah evaluasi"


def test_each_required_unit_ends_with_reflection():
    for unit in _units():
        if unit.get("is_optional"):
            continue
        last = unit["activities"][-1]["content"]["steps"][-1]
        assert last["type"] == "reflection", f"{unit['slug']}: unit wajib diakhiri refleksi (F-12)"


def _assessments():
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted((CONTENT / "assessments").glob("*.json"))]


@pytest.mark.parametrize("data", _assessments(), ids=lambda d: d["slug"])
def test_assessment_keys_match_prompt(data):
    for item in data["items"]:
        steps = {s["key"]: s for s in item["prompt"]["steps"]}
        spans = set(SPAN_IDS.findall(item["prompt"]["situation"]))
        for key, spec in (item.get("answer_key") or {}).items():
            assert key in steps, f"{item['item_key']}: kunci '{key}' tidak ada di butir"
            assert steps[key]["type"] == spec["type"], f"{item['item_key']}/{key}: jenis beda"
            if spec["type"] == "identify_info":
                assert set(spec["relevant"]) <= spans, f"{item['item_key']}: frasa relevan tidak ada"
            if spec["type"] == "define_variables":
                assert {spec["x"], spec["y"]} <= set(steps[key]["options"]), item["item_key"]
            if spec["type"] == "linear_model":
                parse_number(spec["m"]), parse_number(spec["c"])
            if spec["type"] == "numeric":
                assert parse_number(spec["value"]) is not None
        for ind in item["indicators"]:
            assert ind in {"F1", "F2", "F3", "E1", "E2", "E3", "I1", "I2"}


def test_pre_and_post_are_parallel():
    """Paket pretes & postes harus setara strukturnya (ASSESSMENT_RUBRIC §5)."""
    pre, post = sorted(_assessments(), key=lambda d: d["kind"] != "pre")
    assert len(pre["items"]) == len(post["items"])
    for a, b in zip(pre["items"], post["items"], strict=True):
        assert [s["type"] for s in a["prompt"]["steps"]] == [s["type"] for s in b["prompt"]["steps"]]
        assert a["indicators"] == b["indicators"]


def test_context_problems_have_planning_step():
    """RMT (Learning Activity): masalah kontekstual U2–U6 memuat Perencanaan Tindakan sebelum menghitung."""
    for unit in _units():
        if unit["order_index"] < 2:
            continue
        for act in unit["activities"]:
            if act["phase"] == "context_problem":
                types = [s["type"] for s in act["content"]["steps"]]
                assert "plan" in types, f"{act['slug']}: belum ada langkah rencana"
                numeric_like = [i for i, t in enumerate(types) if t in ("numeric", "linear_model")]
                assert types.index("plan") < min(numeric_like), f"{act['slug']}: rencana harus sebelum menghitung"
