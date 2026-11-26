# JelajahGaris — Aplikasi Literasi Matematika SMP (Dokumen Perencanaan)

> Nama **JelajahGaris** adalah nama kerja (TBD-01). Folder ini berisi seluruh dokumen perencanaan. **Kode program belum dibuat.**

---

## 1. Gambaran Proyek

Aplikasi web progresif (PWA) untuk siswa SMP yang melatih **literasi matematika** — merumuskan (*formulate*), menggunakan (*employ*), serta menafsirkan dan mengevaluasi (*interpret & evaluate*) matematika dalam situasi sehari-hari — dimulai dari materi **Persamaan Garis Lurus (PGL)**.

Rancangan didasarkan pada:
- Kerangka literasi matematika **PISA 2022** (OECD).
- **Cognitive Load Theory** untuk mengelola beban belajar.
- **Wawancara eksploratif** dengan satu siswa kelas IX (lihat [education/INTERVIEW_ANALYSIS.md](education/INTERVIEW_ANALYSIS.md)).

## 2. Tujuan

1. Menyediakan eksplorasi visual interaktif (misal grafik yang langsung berubah saat gradien diubah).
2. Menyajikan prosedur dan masalah kontekstual secara bertahap dengan bantuan yang dapat diminta.
3. Mengumpulkan bukti proses literasi matematika untuk penelitian.
4. Dapat dipakai di laptop & HP Android, dapat diinstal tanpa toko aplikasi, tetap berguna saat offline.

## 3. Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | JavaScript, React, Vite, HTML5, CSS3 (CSS Modules + design token), KaTeX, SVG kustom |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Basis data | SQLite (awal) → siap PostgreSQL |
| PWA | Web App Manifest, Service Worker (vite-plugin-pwa / Workbox) |
| Alat | VS Code, Git, GitHub, Browser DevTools, Lighthouse |

Alasan keputusan: [technical/ADR.md](technical/ADR.md).

## 4. Peta Dokumen

| Kelompok | Dokumen | Isi singkat |
|---|---|---|
| Produk | [PRD.md](PRD.md) | Kebutuhan produk, fitur & prioritas, MVP, risiko, daftar TBD |
| | [PRODUCT_VISION.md](PRODUCT_VISION.md) | Visi, misi, nilai, arah jangka panjang |
| | [USER_STORIES.md](USER_STORIES.md) | 26 user story + acceptance criteria |
| | [FEATURE_SPECIFICATION.md](FEATURE_SPECIFICATION.md) | Detail 21 fitur, alur, ketergantungan, katalog umpan balik |
| Pendidikan | [education/INTERVIEW_ANALYSIS.md](education/INTERVIEW_ANALYSIS.md) | Analisis wawancara (temuan–interpretasi–rekomendasi R-01…R-21) |
| | [education/PEDAGOGICAL_FRAMEWORK.md](education/PEDAGOGICAL_FRAMEWORK.md) | Literasi matematika, PISA, CLT, pendekatan, scaffolding, prinsip PP-01…PP-10 |
| | [education/LEARNING_DESIGN.md](education/LEARNING_DESIGN.md) | Siklus belajar, rancangan unit U0–U6, contoh masalah F–E–I |
| | [education/MATHEMATICS_CONTENT_MAP.md](education/MATHEMATICS_CONTENT_MAP.md) | Peta konten PGL, bank konteks, peta materi SMP lanjutan |
| | [education/ASSESSMENT_RUBRIC.md](education/ASSESSMENT_RUBRIC.md) | Indikator F1–I2, rubrik 0–3, desain pretes–postes, batas klaim |
| Desain | [design/UI_UX_GUIDELINES.md](design/UI_UX_GUIDELINES.md) | Prinsip UI, token placeholder, komponen, aksesibilitas |
| | [design/USER_FLOW.md](design/USER_FLOW.md) | Alur siswa, peneliti, asesmen, instalasi, offline |
| | [design/WIREFRAME_SPECIFICATION.md](design/WIREFRAME_SPECIFICATION.md) | Struktur layar S-01…S-11 |
| Teknis | [technical/ARCHITECTURE.md](technical/ARCHITECTURE.md) | Arsitektur, struktur folder, alur komunikasi |
| | [technical/DATABASE_SCHEMA.md](technical/DATABASE_SCHEMA.md) | 15 tabel, ERD, JSON konten, contoh data, migrasi |
| | [technical/API_SPECIFICATION.md](technical/API_SPECIFICATION.md) | Endpoint, request/response, status, validasi |
| | [technical/PWA_SPECIFICATION.md](technical/PWA_SPECIFICATION.md) | Manifest, SW, caching, offline, pembaruan |
| | [technical/SECURITY_AND_PRIVACY.md](technical/SECURITY_AND_PRIVACY.md) | Minimisasi data anak, autentikasi, validasi, retensi |
| | [technical/ADR.md](technical/ADR.md) | 14 keputusan arsitektur |
| Pengembangan | [development/CLAUDE.md](development/CLAUDE.md) | Instruksi untuk Claude Code |
| | [development/CODING_STANDARDS.md](development/CODING_STANDARDS.md) | Standar JS/React & Python/FastAPI |
| | [development/DEVELOPMENT_ROADMAP.md](development/DEVELOPMENT_ROADMAP.md) | 12 fase, tonggak, jalur minimum |
| | [development/TASK_BREAKDOWN.md](development/TASK_BREAKDOWN.md) | Tugas T-xxx dengan prioritas, dependensi, DoD |
| Pengujian | [testing/TESTING_STRATEGY.md](testing/TESTING_STRATEGY.md) | Unit, integrasi, API, UI, responsif, PWA, lintas browser |
| | [testing/ACCEPTANCE_TESTING.md](testing/ACCEPTANCE_TESTING.md) | Skenario AT-01…AT-53 |
| | [testing/DEPLOYMENT_GUIDE.md](testing/DEPLOYMENT_GUIDE.md) | Dua jalur deployment, HTTPS, akses siswa |
| | [testing/EVALUATION_PLAN.md](testing/EVALUATION_PLAN.md) | Validasi ahli, usability, uji coba, analisis |

**Urutan baca yang disarankan:** README → INTERVIEW_ANALYSIS → PRD → PEDAGOGICAL_FRAMEWORK → LEARNING_DESIGN → FEATURE_SPECIFICATION → ARCHITECTURE → TASK_BREAKDOWN.

## 5. Persyaratan Pengembangan (rencana)

| Perangkat lunak | Versi |
|---|---|
| Node.js | LTS terbaru (≥ 20) |
| npm | bawaan Node.js |
| Python | ≥ 3.11 |
| Git | terbaru |
| VS Code | + ekstensi ESLint, Prettier, Python, Ruff (disarankan) |
| Google Chrome | terbaru (DevTools & Lighthouse) |

## 6. Instalasi & Menjalankan (setelah kode dibuat)

> Perintah ini adalah **rencana**; folder `frontend/` dan `backend/` belum ada.

```bash
# 1. Klon repositori
git clone <url-repo> && cd <nama-repo>

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env            # macOS/Linux: cp .env.example .env
alembic upgrade head
python -m app.cli seed-content content/pgl
python -m app.cli create-researcher --username PENELITI-01
python -m app.cli create-students --class KLS8A --count 5
uvicorn app.main:app --reload     # http://localhost:8000/docs

# 3. Frontend (terminal baru)
cd frontend
npm install
npm run dev                        # http://localhost:5173

# 4. Tes
cd backend && pytest
cd frontend && npm test
```

## 7. Roadmap Singkat

| Fase | Fokus |
|---|---|
| 0 | Keputusan TBD kritis & persetujuan pembimbing |
| 1–2 | Fondasi proyek & backend inti |
| 3–4 | Frontend inti & komponen interaktif (Penjelajah Gradien, plot titik) |
| 5 | Konten unit U1–U6 |
| 6–7 | Asesmen, area peneliti, PWA & offline |
| 8 | QA |
| 9–11 | Validasi ahli, deployment, uji coba, evaluasi |

Detail: [development/DEVELOPMENT_ROADMAP.md](development/DEVELOPMENT_ROADMAP.md).

## 8. Konvensi Kode Rujukan Silang

| Awalan | Arti | Didefinisikan di |
|---|---|---|
| K, IL, EL, GL, DS | Kode kutipan wawancara | Laporan wawancara / INTERVIEW_ANALYSIS |
| R-xx | Rekomendasi desain dari wawancara | INTERVIEW_ANALYSIS |
| T1–T5 | Tema kebutuhan | INTERVIEW_ANALYSIS §7 |
| P-xx, UN-xx, FR-xx, NFR-xx, A-xx, RK-xx, TBD-xx | Masalah, kebutuhan, requirement, asumsi, risiko, keputusan tertunda | PRD |
| F-xx | Fitur | PRD / FEATURE_SPECIFICATION |
| US-xx | User story | USER_STORIES |
| PP-xx | Prinsip pedagogis wajib | PEDAGOGICAL_FRAMEWORK §8 |
| U0–U6 | Unit modul PGL | LEARNING_DESIGN |
| F1–F3, E1–E3, I1–I2 | Indikator literasi | ASSESSMENT_RUBRIC |
| S-xx | Layar | WIREFRAME_SPECIFICATION |
| ADR-xxx | Keputusan arsitektur | ADR |
| T-xxx | Tugas | TASK_BREAKDOWN |
| AT-xx | Skenario uji penerimaan | ACCEPTANCE_TESTING |

## 9. Status

| Item | Status |
|---|---|
| Dokumen perencanaan | Draf v0.1 — menunggu telaah pemilik & pembimbing |
| Desain visual | Menunggu referensi (TBD-02) |
| Kode | Belum dimulai |
