"""Tes "Tanya Gari" untuk siswa (ADR-018). Gemini disimulasikan."""

import json

import httpx
import pytest

from app.core.config import get_settings
from app.services.tutor import leaks_answer, redact, split_choices
from tests.conftest import login

API = "/api/v1"


class FakeResponse:
    def __init__(self, status, payload):
        self.status_code = status
        self._payload = payload

    def json(self):
        return self._payload


def text_reply(text, finish="STOP"):
    return {"candidates": [{"content": {"parts": [{"text": text}]}, "finishReason": finish}]}


@pytest.fixture()
def gemini(monkeypatch):
    s = get_settings()
    monkeypatch.setattr(s, "gemini_api_key", "kunci-uji")
    monkeypatch.setattr(s, "gemini_model", "utama")
    monkeypatch.setattr(s, "gemini_fallback_models", "cadangan")
    calls = []
    queue = []

    def fake_post(url, headers, json, timeout):  # noqa: A002
        calls.append({"url": url, "body": json})
        status, payload = queue.pop(0) if queue else (200, text_reply("Coba cek tandanya dulu, ya!"))
        return FakeResponse(status, payload)

    monkeypatch.setattr(httpx, "post", fake_post)
    return calls, queue


def _ojek_step(client, h):
    m = client.get(f"{API}/modules/pgl", headers=h).json()
    u3 = next(u for u in m["units"] if u["slug"] == "u3-ymxc")
    return u3["activities"][2]["id"]  # u3-konteks


def _enable_class(client, on=True):
    hr = login(client, "PENELITI-UJI")
    client.patch(f"{API}/researcher/classes/UJI/ai", json={"is_open": on}, headers=hr)


def _ask(client, h, act_id, step="hitung", q="Aku bingung cara mulainya", supervised=True, **kw):
    return client.post(f"{API}/ai/ask", headers=h, json={
        "activity_id": act_id, "step_key": step, "question": q, "supervised": supervised, **kw})


def test_off_until_researcher_allows_class(client, gemini):
    hs = login(client)
    assert client.get(f"{API}/me/ai", headers=hs).json()["available"] is False
    act = _ojek_step(client, hs)
    assert _ask(client, hs, act).json()["error"]["code"] == "AI_NOT_ALLOWED"
    _enable_class(client)
    assert client.get(f"{API}/me/ai", headers=hs).json()["available"] is True


def test_requires_supervision_confirmation(client, gemini):
    _enable_class(client)
    hs = login(client)
    r = _ask(client, hs, _ojek_step(client, hs), supervised=False)
    assert r.status_code == 403 and r.json()["error"]["code"] == "AI_SUPERVISION_REQUIRED"


def test_ask_ok_no_answer_key_and_pii_redacted(client, gemini):
    calls, _ = gemini
    _enable_class(client)
    hs = login(client)
    r = _ask(client, hs, _ojek_step(client, hs), step="model",
             q="namaku budi, wa 081234567890, gimana nyusun modelnya?",
             history=[{"role": "siswa", "text": "halo"}, {"role": "gari", "text": "Halo! Ada yang bisa dibantu?"}],
             current_answer={"m": "5000", "c": "2500"})
    assert r.status_code == 200, r.text
    assert r.json() == {"reply": "Coba cek tandanya dulu, ya!", "choices": [], "status": "ok"}
    sent = json.dumps(calls[0]["body"], ensure_ascii=False)
    assert "081234567890" not in sent and "[nomor dihapus]" in sent
    assert "UJI-01" not in sent  # tanpa identitas
    assert '"answer"' not in sent and "solution" not in sent  # kunci & pembahasan tidak dikirim
    assert calls[0]["body"]["safetySettings"][0]["threshold"] == "BLOCK_LOW_AND_ABOVE"


def test_final_answer_is_replaced_with_hint(client, gemini):
    _, queue = gemini
    queue.append((200, text_reply("Biayanya adalah Rp25.000, jadi uangnya cukup.")))
    _enable_class(client)
    hs = login(client)
    r = _ask(client, hs, _ojek_step(client, hs), step="hitung", q="kasih tau jawabannya dong")
    body = r.json()
    assert body["status"] == "leak_replaced" and "25.000" not in body["reply"]
    assert "Substitusi" in body["reply"]  # petunjuk level 1 dari konten


def test_blocked_content_is_friendly(client, gemini):
    _, queue = gemini
    queue.append((200, {"promptFeedback": {"blockReason": "SAFETY"}}))
    _enable_class(client)
    hs = login(client)
    r = _ask(client, hs, _ojek_step(client, hs), q="topik tidak pantas")
    assert r.json()["status"] == "blocked" and "orang tua" in r.json()["reply"]


def test_falls_back_when_model_busy(client, gemini):
    calls, queue = gemini
    queue.append((503, {"error": {"message": "high demand"}}))
    _enable_class(client)
    hs = login(client)
    r = _ask(client, hs, _ojek_step(client, hs))
    assert r.status_code == 200
    assert "utama:generateContent" in calls[0]["url"] and "cadangan:generateContent" in calls[1]["url"]


def test_chats_logged_and_exported_for_researcher(client, gemini):
    _enable_class(client)
    hs = login(client)
    _ask(client, hs, _ojek_step(client, hs), q="mulai dari mana?")
    hr = login(client, "PENELITI-UJI")
    csv_text = client.get(f"{API}/researcher/export/ai_chats.csv?class_code=UJI", headers=hr).text
    assert "UJI-01" in csv_text and "mulai dari mana?" in csv_text


def test_student_rate_limit(client, gemini, monkeypatch):
    monkeypatch.setattr(get_settings(), "ai_student_calls_per_hour", 2)
    _enable_class(client)
    hs = login(client)
    act = _ojek_step(client, hs)
    codes = [_ask(client, hs, act).status_code for _ in range(3)]
    assert codes == [200, 200, 429]


def test_helpers():
    assert redact("email a.b@c.com no 08123456789") == "email [email dihapus] no [nomor dihapus]"
    step = {"type": "numeric", "answer": "25000"}
    assert leaks_answer("totalnya 25.000 rupiah", step)
    assert leaks_answer("jawabannya 25000", step)
    assert not leaks_answer("ingat 2500 per km dikali jaraknya", step)
    assert not leaks_answer("gradien 2 artinya naik", {"type": "numeric", "answer": "2"})  # nilai kecil diabaikan


def test_reply_choices_are_parsed_and_filtered(client, gemini):
    _, queue = gemini
    queue.append((200, text_reply("Apa yang berubah tiap 1 km? 🤔\nPILIHAN: Tarifnya bertambah | Totalnya 25.000 | Masih bingung")))
    _enable_class(client)
    hs = login(client)
    body = _ask(client, hs, _ojek_step(client, hs), step="hitung").json()
    assert body["status"] == "ok"
    assert body["reply"] == "Apa yang berubah tiap 1 km? 🤔"
    assert body["choices"] == ["Tarifnya bertambah", "Masih bingung"]  # pilihan berisi kunci dibuang


def test_feedback_code_reaches_context_and_is_validated(client, gemini):
    calls, _ = gemini
    _enable_class(client)
    hs = login(client)
    act = _ojek_step(client, hs)
    assert _ask(client, hs, act, feedback_code="SIGN_FLIP").status_code == 200
    assert "tanda positif/negatif tertukar" in json.dumps(calls[-1]["body"], ensure_ascii=False)
    assert _ask(client, hs, act, feedback_code="NGAWUR").status_code == 422


def test_split_choices_helper():
    step = {"type": "numeric", "answer": "25000"}
    assert split_choices("Halo!", step) == ("Halo!", [])
    assert split_choices("Coba lagi.\n**PILIHAN:** \"Aku coba\" | Aku coba | Contoh lain", step) == (
        "Coba lagi.", ["Aku coba", "Contoh lain"])


# ---------- Obrolan umum dari bilah samping (ADR-021) ----------

def _chat(client, h, q="Apa itu gradien?", supervised=True, **kw):
    return client.post(f"{API}/ai/chat", headers=h, json={"question": q, "supervised": supervised, **kw})


def test_general_chat_guarded_and_logged(client, gemini):
    calls, queue = gemini
    hs = login(client)
    assert _chat(client, hs).json()["error"]["code"] == "AI_NOT_ALLOWED"
    _enable_class(client)
    assert _chat(client, hs, supervised=False).json()["error"]["code"] == "AI_SUPERVISION_REQUIRED"
    queue.append((200, text_reply("Gradien itu kemiringan garis. Menurutmu garis naik gradiennya positif?\nPILIHAN: Iya positif | Contoh lain dong")))
    r = _chat(client, hs, history=[{"role": "gari", "text": "Hai!"}])
    assert r.status_code == 200, r.text
    assert r.json()["choices"] == ["Iya positif", "Contoh lain dong"]
    sent = json.dumps(calls[-1]["body"], ensure_ascii=False)
    assert "MODE OBROLAN UMUM" in sent and "UJI-01" not in sent
    hr = login(client, "PENELITI-UJI")
    csv_text = client.get(f"{API}/researcher/export/ai_chats.csv?class_code=UJI", headers=hr).text
    assert "(obrolan umum)" in csv_text and "Apa itu gradien?" in csv_text


def test_general_chat_blocked_during_assessment(client, gemini):
    _enable_class(client)
    hs = login(client)
    hr = login(client, "PENELITI-UJI")
    pre = client.get(f"{API}/me/assessments", headers=hs).json()[0]
    client.patch(f"{API}/researcher/classes/UJI/assessments/{pre['id']}", json={"is_open": True}, headers=hr)
    sub = client.post(f"{API}/assessments/{pre['id']}/submissions", headers=hs).json()
    r = _chat(client, hs)
    assert r.status_code == 403 and r.json()["error"]["code"] == "AI_DURING_ASSESSMENT"
    client.post(f"{API}/submissions/{sub['id']}/submit", headers=hs)
    assert _chat(client, hs).status_code == 200
