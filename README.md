# JelajahGaris — Aplikasi Literasi Matematika SMP

Aplikasi web progresif (PWA) untuk melatih literasi matematika (Rumuskan → Selesaikan → Tafsirkan) pada materi **Persamaan Garis Lurus**, ditemani **Gari si bebek kuning**.

- Perencanaan lengkap: [project-planning/README.md](project-planning/README.md)
- Instruksi AI coding agent: [project-planning/development/CLAUDE.md](project-planning/development/CLAUDE.md) (dimuat otomatis lewat [CLAUDE.md](CLAUDE.md))

## Struktur

```
backend/    FastAPI + SQLAlchemy + Alembic + SQLite (konten di backend/content/pgl)
frontend/   React + Vite + PWA (vite-plugin-pwa), KaTeX, grafik SVG kustom
project-planning/   27 dokumen perencanaan
```

## Persyaratan

Node.js ≥ 20, Python ≥ 3.11, Git, Google Chrome/Edge.

## Menjalankan secara lokal (Windows, Git Bash/PowerShell)

### 1. Backend (terminal pertama)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env            # lalu ganti JWT_SECRET
alembic upgrade head              # buat tabel
python -m app.cli seed-content    # muat konten U0–U6 + asesmen
python -m app.cli demo            # akun demo lokal (PIN 123456)
uvicorn app.main:app --reload --port 8000
```

Dokumentasi API interaktif: http://localhost:8000/docs

### 2. Frontend (terminal kedua)

```bash
cd frontend
npm install
npm run dev        # mode pengembangan  → http://localhost:5173
# atau, untuk mencoba PWA (instal & offline):
npm run build && npm run preview   # → http://localhost:4173
```

### Akun demo (hanya lokal)

| Kode | Peran | PIN |
|---|---|---|
| `DEMO-01`, `DEMO-02` | Siswa | `123456` |
| `PENELITI-DEMO` | Peneliti | `123456` |

Asesmen awalnya **tertutup**; buka lewat Area Peneliti → Kelas DEMO → Buka.

## Mengaktifkan AI Gemini (khusus Area Peneliti)

1. Buka https://aistudio.google.com/apikey dengan akun Google Anda (pengguna API wajib berusia 18+).
2. Klik **Create API key**, salin kuncinya.
3. Tempel di `backend/.env` pada baris `GEMINI_API_KEY=` (tanpa tanda kutip). Jangan bagikan atau commit file ini.
4. Jalankan ulang backend. Area Peneliti → **Penilaian rubrik** akan menampilkan tombol “✨ Minta saran skor dari Gari (AI)” dan tab **Ringkasan refleksi (AI)**.

**"Tanya Gari" untuk siswa (ADR-018):** mati secara bawaan. Aktifkan per kelas di Area Peneliti → *Kelas & asesmen* → **Izinkan untuk kelas ini** (setelah persetujuan orang tua). Siswa membukanya lewat tombol 💡 di aktivitas, lalu wajib mengonfirmasi “Orang tuaku sedang mendampingi”. Gari tidak memberi jawaban akhir; riwayat percakapan bisa diekspor (dataset *Riwayat Tanya Gari*).

Saran skor AI untuk peneliti tidak pernah tersimpan otomatis sebagai skor.

## Perintah CLI peneliti

```bash
python -m app.cli create-students --class KLS8A --count 30   # CSV kode+PIN di backend/exports/
python -m app.cli create-researcher --username PENELITI-01
python -m app.cli reset-pin --username KLS8A-07
python -m app.cli delete-student --username KLS8A-07
python -m app.cli delete-class --class KLS8A
python -m app.cli seed-content            # ulangi setelah mengubah JSON konten
```

## Tes

```bash
cd backend && .venv\Scripts\python -m pytest && .venv\Scripts\ruff check app
cd frontend && npm test && npm run lint
```

## Mengubah konten

Edit `backend/content/pgl/units/u*.json` (atau `assessments/*.json`), naikkan `content_version` di `module.json`, lalu jalankan `python -m app.cli seed-content`. Validator menolak konten yang melanggar PP-01 (metadata literasi), PP-05 (istilah tanpa glosarium), dan PP-08 (situasi > 80 kata).

> Konten saat ini adalah **DRAF v0.1** dan perlu ditelaah ahli materi sebelum uji coba.

## Ikon PWA

`npm run icons` membuat ulang ikon dari maskot Gari (`frontend/scripts/gen-icons.mjs`).

## Deployment

Lihat [project-planning/testing/DEPLOYMENT_GUIDE.md](project-planning/testing/DEPLOYMENT_GUIDE.md). Perintah `demo` diblokir saat `ENV=production`.

## Deploy online (Netlify + Render + Neon)

Frontend di Netlify (`netlify.toml`), backend di Render (`render.yaml`), basis data PostgreSQL di Neon.
Langkah lengkap: [`project-planning/testing/DEPLOYMENT_GUIDE.md` §4b](project-planning/testing/DEPLOYMENT_GUIDE.md).
Rahasia (`DATABASE_URL`, `GEMINI_API_KEY`) diisi di dashboard Render — **jangan** di-commit.

## Menjalankan di komputer sendiri (Windows)

Klik dua kali `jalankan-server.bat`, lalu buka http://localhost:8000. Biarkan jendelanya terbuka selama web dipakai.
