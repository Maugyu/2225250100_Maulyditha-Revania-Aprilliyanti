from fractions import Fraction

import pytest

from app.core.security import hash_pin, verify_pin
from app.schemas.content import UnitFile, validate_unit_rules, word_count
from app.services.export import safe_cell
from app.services.scoring import auto_score_item, parse_number, score_identify


@pytest.mark.parametrize("raw,expected", [
    ("2", Fraction(2)), ("-3/4", Fraction(-3, 4)), ("0,5", Fraction(1, 2)), ("2.5", Fraction(5, 2)),
    ("5.000", Fraction(5000)), ("Rp", None), ("1/0", None), ("", None), (" 4/2 ", Fraction(2)),
])
def test_parse_number(raw, expected):
    assert parse_number(raw) == expected


def test_score_identify_table():
    rel = ["s1", "s2"]
    assert score_identify(["s1", "s2"], rel) == 3
    assert score_identify(["s1", "s2", "s3"], rel) == 2
    assert score_identify(["s1"], rel) == 1
    assert score_identify([], rel) == 0


def test_auto_score_model_with_wrong_variables():
    key = {"variabel": {"type": "define_variables", "x": "a", "y": "b"},
           "model": {"type": "linear_model", "indicator": "F3", "m": "3", "c": "2"}}
    resp = {"variabel": {"x": "b", "y": "a"}, "model": {"m": "3", "c": "2"}}
    assert auto_score_item(resp, key) == {"F3": 2}


def test_pin_hash_roundtrip():
    h = hash_pin("123456")
    assert verify_pin("123456", h) and not verify_pin("654321", h)


def test_safe_cell():
    assert safe_cell("=1+1") == "'=1+1"
    assert safe_cell("-3") == "'-3"
    assert safe_cell("aman") == "aman"


def _unit(situation: str, body: str = "teks") -> UnitFile:
    return UnitFile(slug="u", order_index=0, title="t", goal="g", activities=[{
        "slug": "a", "phase": "explore", "title": "t", "literacy_processes": ["employ"],
        "indicators": ["E2"], "content": {"situation": situation,
                                          "steps": [{"key": "s", "type": "info", "body": body}]}}])


def test_validator_flags_missing_glossary_and_long_situation():
    long_text = " ".join(["kata"] * 81)
    problems = validate_unit_rules(_unit(long_text, "lihat [[gradien]]"), glossary_keys=set())
    assert any("PP-05" in p for p in problems) and any("PP-08" in p for p in problems)


def test_word_count_ignores_markup():
    assert word_count("Ada {{s1|biaya awal Rp5.000}} di sini") == 6


def test_validator_requires_literacy_metadata():
    with pytest.raises(ValueError):
        UnitFile(slug="u", order_index=0, title="t", goal="g", activities=[{
            "slug": "a", "phase": "explore", "title": "t", "literacy_processes": [],
            "indicators": ["E2"], "content": {"steps": [{"key": "s", "type": "info"}]}}])
