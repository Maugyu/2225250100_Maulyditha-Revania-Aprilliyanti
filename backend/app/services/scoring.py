"""Skor otomatis awal asesmen (ASSESSMENT_RUBRIC §5.1). Peneliti tetap dapat mengoreksi."""

from fractions import Fraction


def parse_number(raw) -> Fraction | None:
    """Menerima bulat, desimal (koma/titik), pecahan a/b, pemisah ribuan titik (5.000)."""
    if raw is None:
        return None
    s = str(raw).strip().replace(" ", "")
    if not s:
        return None
    try:
        if "/" in s:
            num, den = s.split("/", 1)
            return Fraction(parse_number(num)) / Fraction(parse_number(den))
        if "," in s:
            s = s.replace(".", "").replace(",", ".")
        elif s.count(".") >= 1 and len(s.rsplit(".", 1)[1]) == 3 and s.lstrip("-").split(".")[0] != "0":
            s = s.replace(".", "")  # 5.000 -> 5000 (format Indonesia)
        return Fraction(s)
    except (ValueError, ZeroDivisionError, TypeError):
        return None


def score_identify(selected: list, relevant: list) -> int:
    sel, rel = set(selected or []), set(relevant)
    if not rel:
        return 0
    hit = len(sel & rel) / len(rel)
    extra = len(sel - rel)
    if hit == 1 and extra == 0:
        return 3
    if hit == 1 and extra == 1:
        return 2
    if hit >= 0.5:
        return 1
    return 0


def score_model(resp: dict, key: dict, variables_ok: bool | None = None) -> int:
    m, c = parse_number((resp or {}).get("m")), parse_number((resp or {}).get("c"))
    km, kc = parse_number(key["m"]), parse_number(key["c"])
    good = (m == km) + (c == kc)
    if good == 2:
        return 3 if variables_ok in (True, None) else 2
    return 1 if good == 1 else 0


def score_numeric(raw, key) -> int:
    v, k = parse_number(raw), parse_number(key)
    if v is None or k is None:
        return 0
    if v == k:
        return 3
    if k != 0 and v == -k:
        return 2
    return 0


def auto_score_item(response: dict, answer_key: dict) -> dict:
    """answer_key: {step_key: {"type":..., "indicator":..., ...}} -> {indicator: skor}."""
    scores: dict[str, int] = {}
    response = response or {}
    variables_ok = None
    for step_key, spec in answer_key.items():
        if spec["type"] == "define_variables":
            r = response.get(step_key) or {}
            variables_ok = r.get("x") == spec["x"] and r.get("y") == spec["y"]
    for step_key, spec in answer_key.items():
        r = response.get(step_key)
        ind = spec.get("indicator")
        if spec["type"] == "identify_info":
            s = score_identify((r or {}).get("selected", []), spec["relevant"])
        elif spec["type"] == "linear_model":
            s = score_model(r or {}, spec, variables_ok)
        elif spec["type"] == "numeric":
            s = score_numeric((r or {}).get("value"), spec["value"])
        else:
            continue
        if ind:
            scores[ind] = min(scores.get(ind, 3), s) if ind in scores else s
    return scores
