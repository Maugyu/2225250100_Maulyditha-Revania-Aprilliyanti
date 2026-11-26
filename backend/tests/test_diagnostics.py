"""Diagnostik RMT: fase kognitif & asesmen dinamis, serta refleksi transendensi."""

import uuid

from app.services.diagnostics import PHASE_OF_CODE
from tests.conftest import login

API = "/api/v1"


def _uid():
    return str(uuid.uuid4())


def _attempt(client, h):
    m = client.get(f"{API}/modules/pgl", headers=h).json()
    act = m["units"][2]["activities"][1]  # u2-contoh
    cid = _uid()
    client.post(f"{API}/attempts", headers=h, json={"client_id": cid, "activity_id": act["id"], "content_version": "x"})
    return cid


def _resp(client, h, cid, step, ok, code=None, hint=0, revealed=False, n=1):
    client.post(f"{API}/attempts/{cid}/responses", headers=h, json={
        "client_id": _uid(), "step_key": step, "step_type": "numeric", "try_number": n,
        "response": {"value": "x"}, "is_correct": ok, "feedback_code": code,
        "hint_level_max": hint, "solution_revealed": revealed})


def test_class_diagnostics_profile(client):
    hs = login(client, "UJI-01")
    cid = _attempt(client, hs)
    # latihan-1: salah urutan (elaborasi) lalu benar tanpa petunjuk → mandiri
    _resp(client, hs, cid, "latihan-1", False, "ORDER_MISMATCH")
    _resp(client, hs, cid, "latihan-1", True, n=2)
    # latihan-2: salah tanda 2x (output), benar setelah petunjuk → dimediasi
    _resp(client, hs, cid, "latihan-2", False, "SIGN_FLIP")
    _resp(client, hs, cid, "latihan-2", False, "SIGN_FLIP", hint=1, n=2)
    _resp(client, hs, cid, "latihan-2", True, hint=2, n=3)
    # contoh-2: dibuka pembahasannya
    _resp(client, hs, cid, "contoh-2", False, "ARITH", revealed=True)

    hr = login(client, "PENELITI-UJI")
    data = client.get(f"{API}/researcher/classes/UJI/diagnostics", headers=hr).json()
    s = next(x for x in data["students"] if x["username"] == "UJI-01")
    assert s["errors"] == {"input": 0, "elaborasi": 1, "output": 3}
    assert s["dominant_phase"] == "output"
    assert s["top_codes"][0] == "SIGN_FLIP"
    assert s["dynamic"] == {"mandiri": 1, "dimediasi": 1, "dibuka": 1}
    other = next(x for x in data["students"] if x["username"] == "UJI-02")
    assert other["dominant_phase"] is None

    csv_text = client.get(f"{API}/researcher/export/diagnostics.csv?class_code=UJI", headers=hr).text
    assert "UJI-01,0,1,3,output" in csv_text


def test_students_cannot_see_diagnostics(client):
    hs = login(client)
    assert client.get(f"{API}/researcher/classes/UJI/diagnostics", headers=hs).status_code == 403


def test_every_feedback_code_with_phase_is_known():
    from app.schemas.api import FEEDBACK_CODES

    assert set(PHASE_OF_CODE) <= FEEDBACK_CODES
    assert set(PHASE_OF_CODE.values()) == {"input", "elaborasi", "output"}


def test_reflection_transfer_saved_and_exported(client):
    hs = login(client)
    client.post(f"{API}/reflections", headers=hs, json={
        "client_id": _uid(), "unit_slug": "u3-ymxc", "prompt_key": "jelaskan-u3",
        "explanation": "m itu per km, c itu biaya awal", "transfer": "tarif parkir: masuk 2000 lalu 1000 per jam",
        "confidence": 3})
    hr = login(client, "PENELITI-UJI")
    text = client.get(f"{API}/researcher/export/reflections.csv?class_code=UJI", headers=hr).text
    assert "tarif parkir" in text
