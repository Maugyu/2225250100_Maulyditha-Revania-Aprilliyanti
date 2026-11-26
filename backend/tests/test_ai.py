"""Tes asisten AI peneliti. Gemini disimulasikan — tidak ada panggilan jaringan sungguhan."""

import json
import uuid

import httpx
import pytest

from app.core.config import get_settings
from app.services import ai
from tests.conftest import login

API = "/api/v1"


class FakeResponse:
    def __init__(self, status: int, payload: dict):
        self.status_code = status
        self._payload = payload

    def json(self):
        return self._payload


def gemini_reply(obj: dict) -> dict:
    return {"candidates": [{"content": {"parts": [{"text": json.dumps(obj)}]}, "finishReason": "STOP"}]}


@pytest.fixture()
def ai_on(monkeypatch):
    s = get_settings()
    monkeypatch.setattr(s, "gemini_api_key", "kunci-uji")
    monkeypatch.setattr(s, "gemini_model", "model-uji")
    ai.reset_rate_limit()
    calls = []

    def install(status=200, payload=None):
        def fake_post(url, headers, json, timeout):  # noqa: A002
            calls.append({"url": url, "headers": headers, "body": json})
            return FakeResponse(status, payload or {})

        monkeypatch.setattr(httpx, "post", fake_post)
        return calls

    return install


def _submitted_item_response(client) -> int:
    hr = login(client, "PENELITI-UJI")
    hs = login(client, "UJI-01")
    pre = next(a for a in client.get(f"{API}/me/assessments", headers=hs).json() if a["kind"] == "pre")
    client.patch(f"{API}/researcher/classes/UJI/assessments/{pre['id']}", json={"is_open": True}, headers=hr)
    sub = client.post(f"{API}/assessments/{pre['id']}/submissions", headers=hs).json()
    item = sub["items"][0]
    resp = {"model": {"m": "3", "c": "2"}, "tafsir": {"text": "3 itu tambahan kuota tiap voucer"}}
    client.put(f"{API}/submissions/{sub['id']}/responses/{item['id']}", json={"response": resp}, headers=hs)
    client.post(f"{API}/submissions/{sub['id']}/submit", headers=hs)
    return client.get(f"{API}/researcher/scoring/queue", headers=hr).json()[0]["item_response_id"]


def test_status_and_disabled_without_key(client):
    hr = login(client, "PENELITI-UJI")
    assert client.get(f"{API}/researcher/ai/status", headers=hr).json()["enabled"] is False
    irid = _submitted_item_response(client)
    r = client.post(f"{API}/researcher/ai/score-suggestion/{irid}", headers=hr)
    assert r.status_code == 503 and r.json()["error"]["code"] == "AI_UNAVAILABLE"


def test_students_cannot_use_ai(client, ai_on):
    ai_on()
    hs = login(client, "UJI-01")
    assert client.get(f"{API}/researcher/ai/status", headers=hs).status_code == 403
    assert client.post(f"{API}/researcher/ai/score-suggestion/1", headers=hs).status_code == 403


def test_score_suggestion_cleaned_and_private(client, ai_on):
    irid = _submitted_item_response(client)
    calls = ai_on(payload=gemini_reply({
        "suggestions": [
            {"indicator": "F3", "score": 3, "reason": "Model benar."},
            {"indicator": "I1", "score": 2, "reason": "Tanpa satuan."},
            {"indicator": "E3", "score": 2, "reason": "Bukan indikator butir ini"},
            {"indicator": "I2", "score": 7, "reason": "Di luar rentang"},
        ],
        "overall_note": "ok",
    }))
    hr = login(client, "PENELITI-UJI")
    r = client.post(f"{API}/researcher/ai/score-suggestion/{irid}", headers=hr)
    assert r.status_code == 200, r.text
    got = {s["indicator"]: s["score"] for s in r.json()["suggestions"]}
    assert got == {"F3": 3, "I1": 2}  # E3 bukan indikator butir; skor 7 dibuang

    sent = json.dumps(calls[0]["body"])
    assert "UJI-01" not in sent and "UJI" not in sent.replace("UJI coba", "")  # tanpa identitas
    assert "kunci-uji" not in sent  # kunci hanya di header
    assert calls[0]["headers"]["x-goog-api-key"] == "kunci-uji"
    assert "model-uji:generateContent" in calls[0]["url"]

    # Saran TIDAK menjadi skor tersimpan
    q = client.get(f"{API}/researcher/scoring/queue", headers=hr).json()
    assert q[0]["my_scores"] == {}
    # Ekspor rubrik tetap kosong
    csv_text = client.get(f"{API}/researcher/export/rubric_scores.csv?class_code=UJI", headers=hr).text
    assert csv_text.strip().count("\n") == 0


def test_upstream_error_is_friendly(client, ai_on):
    irid = _submitted_item_response(client)
    ai_on(status=403, payload={"error": {"message": "API key not valid"}})
    hr = login(client, "PENELITI-UJI")
    r = client.post(f"{API}/researcher/ai/score-suggestion/{irid}", headers=hr)
    assert r.status_code == 502
    assert "Kunci API" in r.json()["error"]["message"]


def test_rate_limit(client, ai_on, monkeypatch):
    irid = _submitted_item_response(client)
    ai_on(payload=gemini_reply({"suggestions": []}))
    monkeypatch.setattr(get_settings(), "ai_calls_per_hour", 2)
    hr = login(client, "PENELITI-UJI")
    codes = [client.post(f"{API}/researcher/ai/score-suggestion/{irid}", headers=hr).status_code for _ in range(3)]
    assert codes == [200, 200, 429]


def test_reflection_summary(client, ai_on):
    hs = login(client, "UJI-01")
    hr = login(client, "PENELITI-UJI")
    ai_on(payload=gemini_reply({
        "understood": ["m negatif berarti turun"], "misconceptions": ["1 dari 3 menukar m dan c"],
        "confidence_pattern": "yakin tinggi umumnya benar", "teaching_suggestions": ["latihan makna c"],
    }))
    r = client.post(f"{API}/researcher/ai/reflection-summary?class_code=UJI&unit_slug=u2-gradien", headers=hr)
    assert r.status_code == 400  # belum cukup refleksi
    for text in ("karena m negatif", "garisnya turun karena gradien negatif", "c itu kemiringan"):
        client.post(f"{API}/reflections", headers=hs, json={
            "client_id": str(uuid.uuid4()), "unit_slug": "u2-gradien", "prompt_key": "jelaskan-u2",
            "explanation": text, "confidence": 3})
    r = client.post(f"{API}/researcher/ai/reflection-summary?class_code=UJI&unit_slug=u2-gradien", headers=hr)
    assert r.status_code == 200, r.text
    assert r.json()["reflection_count"] == 3 and r.json()["misconceptions"]
