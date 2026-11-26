"""Asisten AI peneliti berbasis Gemini API (ADR-016).

Aturan yang tidak boleh dilanggar:
- Hanya dipanggil dari endpoint peneliti; siswa tidak pernah berinteraksi dengan AI
  (ketentuan Gemini API mensyaratkan pengguna ≥ 18 tahun).
- Tidak mengirim identitas apa pun (kode siswa, kelas) ke Google — hanya teks soal & jawaban.
- Keluaran AI adalah SARAN. Skor final selalu diputuskan dan disimpan oleh peneliti.
"""

import json
import logging
import re
import time
from collections import defaultdict, deque

import httpx

from app.core.config import get_settings
from app.core.errors import AppError

log = logging.getLogger("app.ai")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Deskriptor rubrik (ASSESSMENT_RUBRIC.md §4), diringkas untuk prompt.
RUBRIC = {
    "F1": ("Memahami informasi", ["tidak/menandai sebagian besar info tak relevan", "sebagian info penting + ada tak relevan",
                                  "semua info penting, ≤1 tak relevan", "semua info penting & hanya yang relevan"]),
    "F2": ("Mengidentifikasi masalah", ["kosong/keliru", "diketahui sebagian benar, ditanya keliru",
                                       "benar dengan sedikit ketidaktepatan", "lengkap, tepat, dengan satuan"]),
    "F3": ("Merumuskan model", ["tidak ada/tidak berkaitan", "variabel ada tetapi model salah (mis. m & c tertukar)",
                               "model benar, definisi variabel kurang lengkap", "variabel bersatuan & model benar"]),
    "E1": ("Memilih strategi", ["tidak tampak", "kurang sesuai tetapi ada upaya", "sesuai tetapi tidak efisien/lengkap",
                               "sesuai, efisien, beralasan"]),
    "E2": ("Konsep & prosedur", ["salah total", "benar sebagian; ada kesalahan konsep",
                                "prosedur benar; salah hitung kecil (mis. tanda)", "prosedur & hitungan benar"]),
    "E3": ("Penalaran", ["tidak ada/tidak matematis", "mengulang prosedur tanpa 'mengapa'",
                        "alasan benar tetapi tidak lengkap", "alasan benar, runtut, lengkap"]),
    "I1": ("Menafsirkan hasil", ["tidak/salah", "angka tanpa makna konteks", "dalam konteks, satuan/arah kurang tepat",
                                "tepat dalam konteks dengan satuan & arah"]),
    "I2": ("Mengevaluasi dalam konteks", ["tidak mengevaluasi", "'masuk akal/tidak' tanpa alasan",
                                         "beralasan, belum menyebut batas model", "beralasan + batas model/verifikasi"]),
}

SCORE_SYSTEM = (
    "Anda membantu peneliti pendidikan matematika menilai jawaban siswa SMP kelas VIII tentang persamaan "
    "garis lurus memakai rubrik analitik literasi matematika (PISA: formulate, employ, interpret & evaluate). "
    "Beri skor 0–3 hanya untuk indikator yang diminta, berdasarkan deskriptor rubrik. Nilai isi dan penalaran, "
    "bukan ejaan atau gaya bahasa. Jika jawaban kosong untuk indikator itu, skor 0. Alasan maksimal 2 kalimat, "
    "bahasa Indonesia, merujuk bagian jawaban siswa. Anda hanya memberi saran; peneliti yang memutuskan."
)

SUMMARY_SYSTEM = (
    "Anda membantu peneliti pendidikan matematika membaca refleksi siswa SMP (penjelasan dengan bahasa sendiri "
    "+ tingkat keyakinan 1–4). Ringkas secara deskriptif dan hati-hati: jangan menggeneralisasi ke semua siswa, "
    "jangan mengarang kutipan, jangan menilai individu. Tulis dalam bahasa Indonesia."
)

_calls: dict[str, deque[float]] = defaultdict(deque)


def _check_rate(user_id: int, limit: int | None = None, bucket: str = "peneliti") -> None:
    limit = limit or get_settings().ai_calls_per_hour
    now = time.monotonic()
    q = _calls[f"{bucket}:{user_id}"]
    while q and now - q[0] > 3600:
        q.popleft()
    if len(q) >= limit:
        raise AppError("AI_RATE_LIMIT", f"Batas {limit} pertanyaan AI per jam tercapai. Coba lagi nanti.", 429)
    q.append(now)


def reset_rate_limit() -> None:
    _calls.clear()


# Filter keamanan ketat — pengguna mencakup siswa (ADR-018).
SAFETY = [
    {"category": c, "threshold": "BLOCK_LOW_AND_ABOVE"}
    for c in (
        "HARM_CATEGORY_HARASSMENT",
        "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "HARM_CATEGORY_DANGEROUS_CONTENT",
    )
]
_RETRYABLE = {429, 500, 503, 504}
_HINTS = {
    400: "Permintaan ditolak — periksa nama model (GEMINI_MODEL).",
    401: "Kunci API tidak valid.",
    403: "Kunci API tidak punya izin / tidak valid.",
    404: "Model tidak ditemukan — periksa GEMINI_MODEL.",
    429: "Kuota Gemini habis atau terlalu sering. Coba lagi nanti.",
}


class Blocked(Exception):
    """Gemini memblokir prompt/jawaban karena filter keamanan."""


def _models() -> list[str]:
    s = get_settings()
    extra = [m.strip() for m in s.gemini_fallback_models.split(",") if m.strip()]
    return list(dict.fromkeys([s.gemini_model, *extra]))


def _generate(body: dict) -> str:
    """Panggil generateContent; coba model cadangan bila model sibuk/habis waktu. Kembalikan teks."""
    s = get_settings()
    if not s.ai_enabled:
        raise AppError(
            "AI_UNAVAILABLE",
            "Fitur AI belum aktif. Isi GEMINI_API_KEY di backend/.env lalu jalankan ulang server.",
            503,
        )
    last_error: AppError | None = None
    for model in _models():
        try:
            res = httpx.post(
                API_URL.format(model=model),
                headers={"x-goog-api-key": s.gemini_api_key, "Content-Type": "application/json"},
                json=body,
                timeout=s.gemini_timeout_seconds,
            )
        except httpx.HTTPError as exc:
            log.warning("Gemini (%s) tidak dapat dihubungi: %s", model, type(exc).__name__)
            last_error = AppError("AI_ERROR", "Layanan AI tidak dapat dihubungi. Periksa koneksi internet.", 502)
            continue
        if res.status_code != 200:
            # Jangan pernah mencatat kunci API; cukup status & pesan ringkas dari Google.
            detail = ""
            try:
                detail = res.json().get("error", {}).get("message", "")[:200]
            except ValueError:
                pass
            log.warning("Gemini (%s) menolak permintaan: %s %s", model, res.status_code, detail)
            last_error = AppError(
                "AI_ERROR", _HINTS.get(res.status_code, "Layanan AI sedang sibuk. Coba lagi sebentar lagi."),
                502, [{"field": "gemini", "issue": detail}] if detail else None,
            )
            if res.status_code in _RETRYABLE:
                continue  # coba model berikutnya
            raise last_error
        data = res.json()
        if data.get("promptFeedback", {}).get("blockReason"):
            raise Blocked()
        try:
            cand = data["candidates"][0]
            if cand.get("finishReason") in ("SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"):
                raise Blocked()
            parts = cand["content"]["parts"]
            return "".join(p.get("text", "") for p in parts if not p.get("thought"))
        except (KeyError, IndexError) as exc:
            log.warning("Jawaban Gemini (%s) kosong/tidak dapat dibaca", model)
            last_error = AppError("AI_ERROR", "Jawaban AI tidak dapat dibaca. Coba lagi.", 502)
            if isinstance(exc, KeyError | IndexError):
                continue
    raise last_error or AppError("AI_ERROR", "Layanan AI sedang bermasalah.", 502)


def call_gemini(system: str, prompt: str, schema: dict) -> dict:
    """Panggilan dengan keluaran JSON terstruktur (untuk fitur peneliti)."""
    body = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "safetySettings": SAFETY,
        "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json", "responseSchema": schema},
    }
    try:
        return json.loads(_generate(body))
    except Blocked as exc:
        raise AppError("AI_BLOCKED", "Permintaan diblokir filter keamanan AI.", 422) from exc
    except ValueError as exc:
        raise AppError("AI_ERROR", "Jawaban AI tidak dapat dibaca. Coba lagi.", 502) from exc


SCORE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "suggestions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "indicator": {"type": "STRING"},
                    "score": {"type": "INTEGER"},
                    "reason": {"type": "STRING"},
                },
                "required": ["indicator", "score", "reason"],
            },
        },
        "overall_note": {"type": "STRING"},
    },
    "required": ["suggestions"],
}


def build_score_prompt(prompt: dict, response: dict, indicators: list[str], answer_key: dict | None) -> str:
    """Prompt penilaian. TIDAK memuat kode siswa/kelas (minimisasi data)."""
    lines = [f"MASALAH: {prompt.get('title', '')}", f"SITUASI: {_strip_spans(prompt.get('situation', ''))}", ""]
    lines.append("SUB-SOAL DAN JAWABAN SISWA:")
    for step in prompt.get("steps", []):
        ans = (response or {}).get(step["key"])
        lines.append(f"- [{step['key']}] {step.get('prompt', '')}")
        lines.append(f"  Jawaban siswa: {json.dumps(ans, ensure_ascii=False) if ans else '(kosong)'}")
    if answer_key:
        lines += ["", f"KUNCI (bagian yang dapat dicek otomatis): {json.dumps(answer_key, ensure_ascii=False)}"]
    lines += ["", "RUBRIK untuk indikator yang diminta (skor 0/1/2/3):"]
    for ind in indicators:
        name, levels = RUBRIC[ind]
        lines.append(f"{ind} {name}: " + " | ".join(f"{i}={d}" for i, d in enumerate(levels)))
    lines += ["", f"Beri saran skor untuk indikator: {', '.join(indicators)}."]
    return "\n".join(lines)


def clean_suggestions(raw: dict, indicators: list[str]) -> dict:
    """Validasi keluaran AI: hanya indikator butir, skor 0–3, alasan dipangkas."""
    seen: dict[str, dict] = {}
    for s in raw.get("suggestions", []) if isinstance(raw, dict) else []:
        ind = str(s.get("indicator", "")).upper().strip()
        try:
            score = int(s.get("score"))
        except (TypeError, ValueError):
            continue
        if ind in indicators and ind not in seen and 0 <= score <= 3:
            seen[ind] = {"indicator": ind, "score": score, "reason": str(s.get("reason", ""))[:400]}
    return {
        "suggestions": [seen[i] for i in indicators if i in seen],
        "overall_note": str(raw.get("overall_note", ""))[:500] if isinstance(raw, dict) else "",
    }


SUMMARY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "understood": {"type": "ARRAY", "items": {"type": "STRING"}},
        "misconceptions": {"type": "ARRAY", "items": {"type": "STRING"}},
        "confidence_pattern": {"type": "STRING"},
        "teaching_suggestions": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": ["understood", "misconceptions", "confidence_pattern", "teaching_suggestions"],
}


def build_summary_prompt(unit_title: str, reflection_prompt: str, rows: list[tuple[str, int | None]]) -> str:
    lines = [
        f"UNIT: {unit_title}",
        f"PERTANYAAN REFLEKSI: {reflection_prompt}",
        f"JUMLAH REFLEKSI: {len(rows)}",
        "",
        "REFLEKSI (anonim, urutan acak):",
    ]
    for i, (text, conf) in enumerate(rows, 1):
        lines.append(f"{i}. (yakin {conf or '-'}/4) {text}")
    lines += [
        "",
        "Tulis: (1) pemahaman yang tampak, (2) miskonsepsi/kesulitan yang muncul (sebut berapa refleksi), "
        "(3) pola hubungan tingkat keyakinan dengan ketepatan penjelasan, (4) maksimal 3 saran tindak lanjut "
        "pembelajaran. Masing-masing butir singkat.",
    ]
    return "\n".join(lines)


def _strip_spans(text: str) -> str:
    return re.sub(r"\{\{[a-z0-9]+\|([^}]+)\}\}", r"\1", text or "")
