# CLAUDE.md — Instruksi untuk AI Coding Agent

> Dokumen ini adalah instruksi berkelanjutan untuk Claude Code (dan agen AI lain) yang mengerjakan proyek ini.
> **Cara pakai:** saat kode mulai dibuat, buat file `CLAUDE.md` di root repositori yang berisi satu baris impor:
> `@project-planning/development/CLAUDE.md`
> sehingga Claude Code otomatis memuat dokumen ini setiap sesi.

---

## 1. Identitas dan Tujuan Proyek

- **Proyek:** Aplikasi web progresif (PWA) literasi matematika untuk siswa SMP. Nama kerja **JelajahGaris** (nama final TBD).
- **Pemilik:** mahasiswa S1 Pendidikan Matematika (pengembang tunggal sekaligus peneliti).
- **Tujuan:** melatih proses literasi matematika PISA — **Formulate, Employ, Interpret & Evaluate** — pada materi Persamaan Garis Lurus (MVP), dengan desain yang mengelola beban kognitif (CLT).
- **Bukan tujuan:** bank soal pilihan ganda, kumpulan rumus, gamifikasi.
- **Sumber kebenaran:** dokumen di `project-planning/`. Bila kode dan dokumen bertentangan, **tanyakan** ke pemilik, jangan memilih sendiri.

| Untuk pertanyaan tentang… | Baca |
|---|---|
| Apa yang harus dibuat & prioritasnya | `project-planning/PRD.md`, `FEATURE_SPECIFICATION.md` |
| Kriteria selesai fitur | `project-planning/USER_STORIES.md`, `testing/ACCEPTANCE_TESTING.md` |
| Alasan pedagogis | `project-planning/education/PEDAGOGICAL_FRAMEWORK.md`, `INTERVIEW_ANALYSIS.md` |
| Isi unit & struktur aktivitas | `project-planning/education/LEARNING_DESIGN.md` |
| Tabel & JSON konten | `project-planning/technical/DATABASE_SCHEMA.md` |
| Endpoint | `project-planning/technical/API_SPECIFICATION.md` |
| Caching & offline | `project-planning/technical/PWA_SPECIFICATION.md` |
| Urutan pekerjaan | `project-planning/development/TASK_BREAKDOWN.md` |

## 2. Gambaran Arsitektur

```
frontend/ (React + Vite, JavaScript, PWA)  ──HTTPS/JSON /api/v1──▶  backend/ (FastAPI + SQLAlchemy)  ──▶  SQLite (→ PostgreSQL)
```

- SPA terpisah dari REST API (ADR-001).
- Pemeriksaan jawaban **latihan** di klien (`frontend/src/lib/checkers/`); **asesmen** di server (ADR-009).
- Konten pembelajaran = file JSON di `backend/content/`, di-*seed* ke DB (ADR-010).

## 3. Stack Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | React 18+, Vite, React Router, CSS Modules + `tokens.css`, KaTeX, `vite-plugin-pwa` |
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.x, Alembic |
| Basis data | SQLite (pengembangan & uji coba awal), siap PostgreSQL |
| Tes | Vitest + React Testing Library (frontend), pytest (backend), Playwright (E2E, opsional) |
| Alat | VS Code, Git, GitHub, Chrome DevTools, Lighthouse |

**Jangan menambah dependensi baru** tanpa menyebutkan alasannya dan meminta persetujuan. Larangan khusus: Tailwind, Redux, pustaka UI kit besar, pustaka grafik pihak ketiga, TypeScript (lihat ADR-003, 004, 005, 011).

## 4. Struktur Direktori

```
/
├── CLAUDE.md                     # impor dokumen ini
├── project-planning/             # dokumen perencanaan (jangan dihapus)
├── frontend/
│   ├── public/{icons/, offline.html}
│   └── src/{pages/, features/, components/ui/, lib/{api,checkers,math,storage}/, styles/}
└── backend/
    ├── app/{main.py, cli.py, deps.py, core/, models/, schemas/, routers/, services/}
    ├── content/pgl/
    ├── alembic/
    └── tests/
```

Detail: `project-planning/technical/ARCHITECTURE.md` §2.1 & §3.1.

## 5. Aturan Penulisan Kode

- Ikuti `project-planning/development/CODING_STANDARDS.md`.
- Fungsi kecil dan murni untuk logika matematika & pemeriksa jawaban; **wajib** ada tes unit.
- Tidak ada logika bisnis di komponen tampilan maupun router — pindahkan ke `lib/` (frontend) atau `services/` (backend).
- Komentar menjelaskan **mengapa**, bukan apa. Rujuk kode rekomendasi bila relevan, misal `// R-09: deteksi kesalahan tanda (IL05)`.
- Teks antarmuka berbahasa Indonesia; identifier kode berbahasa Inggris.

## 6. Standar Penamaan

| Hal | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase, file `.jsx` | `SlopeExplorer.jsx` |
| Hook | `useCamelCase` | `useOnlineStatus.js` |
| Fungsi/variabel JS | camelCase | `detectSignFlip` |
| CSS Module | `Nama.module.css`, kelas camelCase | `styles.actionBar` |
| Token CSS | `--kategori-nama` | `--color-primary` |
| Modul Python | snake_case | `progress_service.py` |
| Kelas Python | PascalCase | `StepResponse` |
| Tabel DB | jamak snake_case | `step_responses` |
| Field API JSON | snake_case | `hint_level_max` |
| Kode umpan balik | UPPER_SNAKE | `SIGN_FLIP` |
| Kunci langkah konten | kebab-case | `contoh-3` |
| Branch Git | `feat/…`, `fix/…`, `docs/…`, `content/…` | `feat/slope-explorer` |

## 7. Aturan Komponen (Frontend)

1. Komponen hanya memakai **token** dari `tokens.css`; dilarang nilai warna/ukuran mentah.
2. Setiap layar memiliki **maksimal satu** `Button variant="primary"` (PP-02).
3. Tidak ada elemen dekoratif (ilustrasi, animasi, latar bermotif) tanpa fungsi informasi (PP-03).
4. Teks antarmuka tidak di-hardcode tersebar: kumpulkan string UI di `src/lib/strings.js` (persiapan perubahan wording).
5. Renderer langkah berada di `features/player/steps/` — satu komponen per `step.type`; pemutar memilih renderer lewat peta `type → komponen`.
6. Interaksi grafik harus dapat dioperasikan dengan keyboard dan sentuhan; target sentuh ≥ 44 px.
7. Dilarang `dangerouslySetInnerHTML` untuk data pengguna; konten bertanda (`[[istilah]]`, `$…$`) di-parse oleh komponen.

## 8. Aturan API

- Ikuti kontrak di `API_SPECIFICATION.md`. **Ubah dokumen dulu, baru kode** bila kontrak berubah.
- Prefiks `/api/v1`; JSON `snake_case`; format galat seragam `{"error": {...}}`.
- Setiap endpoint: schema request & response Pydantic (`extra="forbid"`), dependency autentikasi, cek kepemilikan di service.
- Endpoint tulis yang menerima data dari klien offline harus idempoten via `client_id`.
- Kunci jawaban asesmen **tidak pernah** dikirim ke klien siswa.

## 9. Aturan Database

- Perubahan skema **hanya** lewat migrasi Alembic; jangan memanggil `create_all` di produksi.
- Tipe kolom portabel SQLite/PostgreSQL; aktifkan `PRAGMA foreign_keys=ON`.
- Tidak menambah kolom data pribadi (nama asli, email, HP, foto) — dilarang tanpa persetujuan tertulis pemilik dan pembaruan `SECURITY_AND_PRIVACY.md`.
- Waktu disimpan UTC.

## 10. Standar Keamanan

- Rahasia lewat variabel lingkungan; jangan commit `.env`, `*.db`, CSV ekspor, atau daftar PIN.
- PIN di-hash (argon2/bcrypt); jangan pernah log PIN atau token.
- Pembatasan percobaan login wajib.
- `/docs` nonaktif saat `ENV=production`.
- Ekspor CSV: lindungi dari formula injection.
- Detail: `project-planning/technical/SECURITY_AND_PRIVACY.md`.

## 11. Standar Responsivitas

- Mobile-first; uji di lebar **360 px**, 768 px, dan 1280 px.
- Tidak boleh ada gulir horizontal.
- Pemutar aktivitas: satu kolom < 1024 px, dua kolom ≥ 1024 px.
- `ActionBar` menempel di bawah pada ponsel; input aktif tidak tertutup papan ketik.

## 12. Aturan PWA

- Konfigurasi hanya di `vite.config.js` (`vite-plugin-pwa`, `generateSW`, `registerType: "prompt"`).
- Endpoint tulis, asesmen, autentikasi, peneliti = `NetworkOnly`. **Jangan pernah** meng-cache respons POST/PUT/PATCH.
- Logout menghapus cache `user-v1`, token, dan draf.
- Prompt pembaruan tidak boleh tampil selama asesmen.
- Setiap perubahan konfigurasi PWA → jalankan daftar periksa di `PWA_SPECIFICATION.md` §8.

## 13. Prinsip Pedagogis yang Tidak Boleh Dilanggar

| Kode | Aturan |
|---|---|
| PP-01 | Setiap aktivitas punya `literacy_processes` dan `indicators` di data konten. |
| PP-02 | Satu langkah dan satu aksi utama per layar. |
| PP-03 | Tidak ada elemen visual dekoratif tanpa informasi matematika. |
| PP-04 | Petunjuk tidak pernah berisi jawaban akhir. |
| PP-05 | Istilah teknis baru memiliki entri glosarium. |
| PP-06 | Transformasi aljabar: satu langkah per tampilan + sorotan perubahan. |
| PP-07 | Masalah kontekstual selalu memuat langkah tafsir **dan** evaluasi. |
| PP-08 | Teks situasi ≤ 80 kata; blok penjelas ≤ 3 kalimat. |
| PP-09 | Asesmen tanpa umpan balik benar/salah dan tanpa petunjuk. |
| PP-10 | Tidak ada poin, peringkat, lencana, atau iklan. |
| PP-11 | Masalah kontekstual U2–U6 memuat langkah `plan` sebelum perhitungan (RMT). |
| PP-12 | Refleksi unit memuat `transfer_prompt` (transendensi RMT/MLE). |
| PP-13 | Mediasi (petunjuk, Gari) bertanya & mengarahkan, tidak mengambil alih berpikir siswa. |

Validasi PP-01, PP-05, PP-08 dilakukan otomatis oleh validator konten saat *seeding* (bila memungkinkan).

## 14. Alur Kerja Sebelum Mengubah Kode

1. **Pahami tugas:** temukan ID tugas di `TASK_BREAKDOWN.md` dan fitur/US terkait.
2. **Baca dokumen terkait** (tabel di §1). Bila tugas tidak tercakup PRD → **berhenti dan tanyakan**.
3. **Periksa kode yang ada** sebelum membuat file baru; gunakan ulang komponen/util.
4. **Rencanakan singkat:** sebutkan file yang akan diubah dan tes yang akan ditulis.
5. **Implementasi kecil & bertahap**; satu tugas = satu branch/commit yang fokus.
6. **Tes:** tulis/perbarui tes; jalankan `npm test` / `pytest` dan linter.
7. **Perbarui dokumen** bila kontrak API, skema DB, atau perilaku fitur berubah.
8. **Laporkan:** apa yang diubah, hasil tes (apa adanya), dan hal yang belum selesai.

## 15. Aturan Testing

| Area | Wajib |
|---|---|
| `lib/checkers`, `lib/math` | Tes unit untuk setiap fungsi, termasuk kasus tanda negatif, pecahan, dan input tidak valid. |
| Service backend | Tes unit/integrasi; cakupan ≥ 70%. |
| Endpoint | Tes API: sukses, validasi gagal, tanpa token, peran salah, akses data milik orang lain. |
| Komponen interaktif | Tes RTL untuk perilaku utama (slider memperbarui persamaan, snap titik). |
| PWA & responsif | Daftar periksa manual sebelum rilis. |

Perintah (setelah proyek dibuat): `cd frontend && npm run lint && npm test` · `cd backend && ruff check . && pytest`.

Jangan menandai tugas selesai bila tes gagal; laporkan kegagalan apa adanya.

## 16. Larangan

- ❌ Membuat fitur di luar PRD/FEATURE_SPECIFICATION tanpa persetujuan pemilik (termasuk "sekalian" menambah gamifikasi atau animasi).
- ❌ Melonggarkan pengaman "Tanya Gari" (ADR-018): izin per kelas, konfirmasi pendamping, tanpa kunci jawaban ke AI, cek bocoran jawaban, tidak di asesmen.
- ❌ Mengirim kunci `GEMINI_API_KEY` ke frontend, log, atau repositori.
- ❌ Mengubah prioritas MoSCoW sendiri.
- ❌ Mengubah isi pedagogis konten (soal, petunjuk, rubrik) tanpa diminta — konten adalah wewenang pemilik.
- ❌ Menambah pelacak analitik, iklan, atau skrip pihak ketiga.
- ❌ Mengumpulkan data pribadi tambahan.
- ❌ Menulis klaim efektivitas ("terbukti meningkatkan …") di UI atau dokumen.
- ❌ Menghapus/menimpa dokumen `project-planning/` tanpa diminta.
- ❌ Commit rahasia, basis data, atau data siswa.
