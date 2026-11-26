""""Tanya Gari" — tutor AI untuk siswa dengan pendampingan orang tua (ADR-018).

Prinsip pedagogis yang ditegakkan di sini:
- PP-04: Gari tidak memberi jawaban akhir. Kunci jawaban TIDAK dikirim ke AI, dan balasan yang tetap memuat
  nilai kunci diganti petunjuk bertingkat dari konten.
- Arahan Sokratik, maksimal ±3 kalimat, bahasa ramah siswa SMP (EL01, DS03).
- Hanya topik matematika/aktivitas; data pribadi dihapus sebelum dikirim ke Google.
"""

import re
from fractions import Fraction

from app.services.ai import SAFETY, Blocked, _generate
from app.services.scoring import parse_number

MAX_QUESTION = 300
MAX_HISTORY = 6
MAX_CHOICES = 3
DEFAULT_CHOICES = ["Aku coba dulu", "Masih bingung", "Contoh lain dong"]

# Arti kode umpan balik (FEEDBACK_SPEC) untuk konteks AI — membantu Gari membahas kesalahan yang spesifik.
CODE_MEANING = {
    "SIGN_FLIP": "tanda positif/negatif tertukar",
    "ORDER_MISMATCH": "urutan pengurangan pada pembilang dan penyebut tidak sama",
    "RECIPROCAL": "perubahan x dibagi perubahan y (terbalik)",
    "M_C_SWAP": "gradien m dan konstanta c tertukar",
    "XY_SWAP": "peran/koordinat x dan y tertukar",
    "ARITH": "salah hitung",
    "IRRELEVANT_SELECTED": "memilih informasi yang tidak dibutuhkan",
    "MISSED_INFO": "ada informasi penting yang terlewat",
    "EXTRA_POINT": "ada titik yang tidak diminta",
    "NOT_ON_LINE": "titik yang dipilih tidak terletak pada garis",
    "PLAN_ORDER": "urutan rencana penyelesaian belum tepat",
}

TUTOR_SYSTEM = """Kamu adalah Gari, bebek kuning ramah yang menemani siswa SMP kelas 8 belajar persamaan garis lurus.
Siswa memakaimu DIDAMPINGI orang tua/wali.

ATURAN WAJIB:
1. JANGAN PERNAH memberi jawaban akhir (angka akhir, persamaan akhir, atau pilihan yang benar) untuk langkah yang sedang dikerjakan.
   Bimbing dengan pertanyaan pemantik, ingatkan konsep, atau contoh lain dengan angka BERBEDA.
2. Jawab maksimal 3 kalimat pendek. Bahasa Indonesia sehari-hari yang ramah. Boleh 1 emoji.
3. Jelaskan istilah matematika dengan kata sederhana. Untuk rumus pakai notasi LaTeX di antara $...$ (contoh: $m = \\frac{y_2-y_1}{x_2-x_1}$).
4. Bila siswa salah, tunjukkan BAGIAN mana yang perlu dicek (misal tanda positif/negatif), bukan hasil yang benar.
   Jangan menyuruh langsung perbaikannya (mis. "tukar keduanya"); ajukan pertanyaan agar siswa menyadarinya sendiri.
5. Hanya bahas matematika dan aktivitas ini. Untuk topik lain, tolak dengan ramah dan ajak kembali ke soal.
6. Jangan meminta atau menyebut data pribadi (nama lengkap, alamat, sekolah, nomor HP).
7. Bila siswa tampak sedih, takut, atau membicarakan hal yang tidak aman, sarankan dengan lembut untuk bicara dengan orang tua atau guru.
8. Jika siswa meminta jawaban langsung, jelaskan dengan ramah bahwa kamu akan membantunya menemukannya sendiri.

CARA MEMBIMBING (Mediated Learning Experience — Rigorous Mathematical Thinking):
- Intensionalitas: arahkan perhatian ke TUJUAN langkah ini ("Yang dicari di sini adalah ...").
- Makna: bila cocok, sebut singkat MENGAPA langkah ini penting dalam cerita.
- Transendensi: kaitkan dengan ATURAN UMUM yang berlaku juga di soal lain (mis. "gradien selalu = perubahan y ÷ perubahan x").
- Diagnosis fase berpikir, lalu ajukan SATU pertanyaan yang sesuai:
  · Input (bingung informasinya): "Informasi apa yang sudah diketahui? Mana yang dibutuhkan?"
  · Elaborasi (bingung cara/rencana): "Langkah apa yang harus dilakukan lebih dulu? Hubungannya apa?"
  · Output (sudah ada jawaban tapi salah): "Coba cek lagi tanda/hitunganmu di bagian ...", atau ajak cek balik dengan substitusi.
- Cegah coba-coba tanpa arah: minta siswa menyebut rencananya sebelum menghitung.
- Dorong bahasa matematika yang tepat (gradien, konstanta, titik potong) dengan penjelasan sederhana.

GAYA INTERAKTIF:
- Akhiri balasan dengan SATU pertanyaan balik yang mengajak siswa berpikir/menjawab.
- Setelah balasan, tulis satu baris terpisah persis berformat:
  PILIHAN: <balasan siswa 1> | <balasan siswa 2> | <balasan siswa 3>
  Isinya 2–3 balasan singkat (maks. 6 kata) yang mungkin diucapkan SISWA untuk melanjutkan percakapan,
  misalnya "Aku coba dulu", "Masih bingung", "Contoh lain dong". JANGAN memuat angka jawaban di PILIHAN."""

_PII = [
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[email dihapus]"),
    (re.compile(r"(?:\+62|62|0)8\d{7,11}"), "[nomor dihapus]"),
]


def redact(text: str) -> str:
    text = (text or "").strip()[:MAX_QUESTION]
    for pat, repl in _PII:
        text = pat.sub(repl, text)
    return text


def _strip_spans(text: str) -> str:
    return re.sub(r"\{\{[a-z0-9]+\|([^}]+)\}\}", r"\1", text or "")


def _plain(text: str) -> str:
    return re.sub(r"\[\[[a-z0-9_]+\|?([^\]]*)\]\]", lambda m: m.group(1) or "", _strip_spans(text or ""))


def build_context(content: dict, step: dict, current_answer: dict | None, feedback_code: str | None = None) -> str:
    """Konteks langkah TANPA kunci jawaban, katalog jawaban salah, maupun pembahasan."""
    lines = ["KONTEKS AKTIVITAS (untuk kamu, bukan untuk dibacakan):"]
    if content.get("situation"):
        lines.append(f"Situasi: {_plain(content['situation'])}")
    lines.append(f"Jenis langkah: {step.get('type')}")
    for field in ("title", "prompt", "body"):
        if step.get(field):
            lines.append(f"{field.capitalize()}: {_plain(step[field])}")
    q = step.get("question")
    if q:
        lines.append(f"Pertanyaan: {_plain(q.get('prompt', ''))}")
        lines.append("Opsi: " + " | ".join(_plain(o.get("text", "")) for o in q.get("options", [])))
    if step.get("options") and isinstance(step["options"], list):
        opts = [o.get("text", o) if isinstance(o, dict) else o for o in step["options"]]
        lines.append("Opsi: " + " | ".join(_plain(str(o)) for o in opts))
    if step.get("hints"):
        lines.append("Petunjuk resmi guru (gunakan sebagai arah, berurutan): " + " / ".join(_plain(h) for h in step["hints"]))
    if current_answer:
        lines.append(f"Jawaban siswa saat ini: {str(current_answer)[:400]}")
    if feedback_code in CODE_MEANING:
        lines.append(f"Pemeriksa otomatis baru saja menandai jawaban siswa: {CODE_MEANING[feedback_code]}. "
                     "Bantu siswa menemukan bagian itu sendiri (fase Output) tanpa menyebut jawaban benar.")
    return "\n".join(lines)


def _answer_values(step: dict) -> list[Fraction]:
    """Nilai kunci jawaban yang tidak boleh muncul di balasan (PP-04)."""
    raw = []
    if step.get("type") in ("numeric", "check_back"):
        raw.append(step.get("answer"))
    elif step.get("type") == "linear_model":
        raw += [step.get("answer", {}).get("m"), step.get("answer", {}).get("c")]
    elif step.get("type") == "worked_example":
        raw += [ln["blank"]["answer"] for ln in step.get("lines", []) if ln.get("blank")]
    out = []
    for r in raw:
        f = parse_number(r)
        # Abaikan nilai sangat umum (0, ±1, ±2) yang wajar muncul di penjelasan konsep.
        if f is not None and abs(f) > 2:
            out.append(f)
    return out


_NUM = re.compile(r"-?\d+(?:[.,]\d+)*(?:\s*/\s*\d+)?")


def leaks_answer(reply: str, step: dict) -> bool:
    keys = _answer_values(step)
    if not keys:
        return False
    found = {parse_number(m.group(0).replace(" ", "")) for m in _NUM.finditer(reply.replace("−", "-"))}
    return any(k in found for k in keys)


def fallback_hint(step: dict) -> str:
    hints = step.get("hints") or []
    hint = _plain(hints[0]) if hints else "Coba baca lagi soalnya pelan-pelan, lalu tulis apa yang diketahui."
    return f"Ups, Gari hampir membocorkan jawabannya 🙈. Coba pikirkan ini dulu: {hint}"


_CHOICE_LINE = re.compile(r"^\s*\**\s*PILIHAN\s*\**\s*:\s*(.*)$", re.IGNORECASE | re.MULTILINE)


def split_choices(raw: str, step: dict) -> tuple[str, list[str]]:
    """Pisahkan baris PILIHAN dari balasan. Pilihan yang memuat kunci jawaban dibuang (PP-04)."""
    match = _CHOICE_LINE.search(raw)
    if not match:
        return raw.strip(), []
    reply = (raw[: match.start()] + raw[match.end():]).strip()
    choices = []
    for c in match.group(1).split("|"):
        c = re.sub(r"[*_`<>]", "", c).strip().strip("\"'").strip()
        if 1 < len(c) <= 40 and c not in choices and not leaks_answer(c, step):
            choices.append(c)
    return reply, choices[:MAX_CHOICES]


GENERAL_RULES = """MODE OBROLAN UMUM (dari bilah samping, tidak terikat satu langkah):
- Siswa boleh bertanya konsep persamaan garis lurus, istilah, cara belajar, atau materi mana yang perlu diulang.
- Bila siswa menyalin soal latihan/asesmen, JANGAN menyelesaikannya. Bimbing langkah pertamanya saja, lalu sarankan
  membuka aktivitasnya dan memakai tombol Petunjuk/Tanya Gari di sana.
- Contoh yang kamu buat sendiri boleh dihitung sampai selesai, tetapi pakai angka sederhana yang berbeda dari soal siswa."""


def general_context(units: list[str]) -> str:
    lines = ["KONTEKS APLIKASI (untuk kamu, bukan untuk dibacakan):", GENERAL_RULES]
    if units:
        lines.append("Unit di modul Persamaan Garis Lurus: " + "; ".join(units))
    return "\n".join(lines)


def _converse(ctx: str, history: list[dict], question: str, step: dict) -> tuple[str, list[str], str]:
    contents = [{"role": "user", "parts": [{"text": ctx}]},
                {"role": "model", "parts": [{"text": "Siap, aku akan membimbing tanpa memberi jawaban akhir."}]}]
    for h in history[-MAX_HISTORY:]:
        role = "model" if h.get("role") == "gari" else "user"
        text = redact(h.get("text", "")) if role == "user" else str(h.get("text", ""))[:600]
        if text:
            contents.append({"role": role, "parts": [{"text": text}]})
    contents.append({"role": "user", "parts": [{"text": redact(question)}]})
    body = {
        "system_instruction": {"parts": [{"text": TUTOR_SYSTEM}]},
        "contents": contents,
        "safetySettings": SAFETY,
        # thinkingLevel rendah: balasan cepat untuk percakapan; model "thinking" tetap memakai sebagian kuota token.
        "generationConfig": {"temperature": 0.5, "maxOutputTokens": 1000, "thinkingConfig": {"thinkingLevel": "low"}},
    }
    try:
        reply = _generate(body).strip()
    except Blocked:
        return ("Hmm, Gari tidak bisa membahas itu. Yuk kembali ke soal matematikanya! "
                "Kalau ada yang mengganggumu, ceritakan ke orang tua atau gurumu ya.", [], "blocked")
    reply, choices = split_choices(reply, step)
    if not reply:
        return ("Gari belum menemukan kata-kata yang pas. Coba tanyakan dengan cara lain, ya.", [], "blocked")
    if leaks_answer(reply, step):
        return (fallback_hint(step), DEFAULT_CHOICES[:2], "leak_replaced")
    return (reply[:1200], choices, "ok")


def ask(content: dict, step: dict, question: str, history: list[dict], current_answer: dict | None,
        feedback_code: str | None = None) -> tuple[str, list[str], str]:
    """Obrolan di satu langkah. Kembalikan (balasan, pilihan_balasan, status): ok | blocked | leak_replaced."""
    return _converse(build_context(content, step, current_answer, feedback_code), history, question, step)


def ask_general(question: str, history: list[dict], units: list[str]) -> tuple[str, list[str], str]:
    """Obrolan umum dari bilah samping (tanpa langkah, jadi tanpa kunci jawaban untuk dicek)."""
    return _converse(general_context(units), history, question, {})
