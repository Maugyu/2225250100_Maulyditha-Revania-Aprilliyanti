# Task Breakdown

> **Dokumen terkait:** [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) · [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md) · [../USER_STORIES.md](../USER_STORIES.md) · [CLAUDE.md](CLAUDE.md)
>
> Prioritas: **P0** = wajib untuk MVP (Must) · **P1** = Should · **P2** = Could. Setiap tugas memiliki **Definition of Done (DoD)**. DoD umum yang berlaku untuk semua tugas kode: lint lulus, tes relevan ditulis & lulus, dokumen kontrak diperbarui bila berubah.

---

## Fase 0 — Persiapan & Keputusan

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-001 | Konfirmasi kelas materi PGL (D-01) & koreksi laporan wawancara | P0 | — | Laporan direvisi; PRD A-02 diperbarui. |
| T-002 | Tetapkan kurikulum acuan & rumusan CP/TP (TBD-03) | P0 | — | `MATHEMATICS_CONTENT_MAP.md` §1 diperbarui. |
| T-003 | Tetapkan model R&D (TBD-04) bersama pembimbing | P0 | — | `EVALUATION_PLAN.md` diperbarui. |
| T-004 | Putuskan unit terkunci/bebas (TBD-08), rumus U4 (TBD-09), batas U6 (TBD-10) | P0 | — | Keputusan tercatat di PRD §14. |
| T-005 | Ajukan izin sekolah & siapkan formulir persetujuan | P0 | — | Draf surat & formulir siap. |

## Fase 1 — Fondasi

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-101 | Inisialisasi repo Git + `.gitignore` + `CLAUDE.md` root (impor) + README | P0 | — | Repo di GitHub; struktur folder sesuai ARCHITECTURE. |
| T-102 | Scaffold frontend (Vite React JS, React Router, ESLint, Prettier, Vitest, alias `@/`) | P0 | T-101 | `npm run dev`, `npm test`, `npm run lint` berjalan. |
| T-103 | Scaffold backend (FastAPI, config, `GET /health`, Ruff, pytest) | P0 | T-101 | `pytest` lulus; `/api/v1/health` 200. |
| T-104 | Proxy Vite `/api` → 8000; halaman sementara menampilkan status health | P0 | T-102, T-103 | Status "ok" tampil di browser. |
| T-105 | GitHub Actions: lint + tes frontend & backend | P0 | T-102, T-103 | Workflow hijau pada PR. |
| T-106 | `tokens.css` + `global.css` placeholder + komponen `Button`, `ActionBar` | P0 | T-102 | Komponen memakai token; tes render. |

## Fase 2 — Backend Inti

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-201 | Model SQLAlchemy semua tabel MVP + migrasi Alembic awal | P0 | T-103 | `alembic upgrade head` membuat skema; FK pragma aktif. |
| T-202 | Format galat seragam + `AppError` + handler | P0 | T-103 | Tes 422/404/500 berformat seragam. |
| T-203 | Security: hash PIN, JWT, `get_current_user`, `require_role` | P0 | T-201 | Tes unit hash & token. |
| T-204 | `POST /auth/login`, `GET /auth/me` + pembatasan percobaan | P0 | T-203 | Tes: sukses, gagal, 429. |
| T-205 | CLI `create-students`, `create-researcher`, `reset-pin` | P0 | T-203 | CSV kode+PIN dihasilkan; PIN tersimpan sebagai hash. |
| T-206 | Schema Pydantic konten (`ActivityContent`, jenis langkah) + CLI `seed-content` | P0 | T-201 | Seed konten contoh; JSON tidak valid ditolak dengan pesan jelas. |
| T-207 | `GET /modules`, `/modules/{slug}`, `/activities/{id}` | P0 | T-206 | Tes API. |
| T-208 | Attempts: `POST /attempts`, `PATCH`, `POST …/responses` (idempoten) | P0 | T-207 | Tes idempotensi & kepemilikan. |
| T-209 | `GET /me/progress`, `GET /me/resume` (service progres) | P0 | T-208 | Tes perhitungan status unit. |
| T-210 | `POST /reflections` | P0 | T-201 | Tes validasi. |

## Fase 3 — Frontend Inti

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-301 | `lib/api/client.js` (token, ApiError, 401 redirect, deteksi offline) | P0 | T-102 | Tes unit dengan fetch tiruan. |
| T-302 | Konteks sesi + S-01 Masuk | P0 | T-301, T-204 | US-01 AC1–AC3 lulus. |
| T-303 | S-02 Beranda (resume + progres) | P0 | T-209 | US-02 lulus. |
| T-304 | S-03 Peta Unit | P0 | T-207 | US-03 lulus. |
| T-305 | S-04 Pemutar Aktivitas (navigasi langkah, StepHeader, ActionBar, draf lokal) | P0 | T-208 | US-04 lulus. |
| T-306 | Renderer langkah: `info`, `choice`, `numeric`, `worked_example`, `completion` | P0 | T-305 | Tes RTL per renderer. |
| T-307 | `MathText` (KaTeX) + `GlossaryTerm` + parser `[[istilah]]` | P0 | T-305 | US-16 lulus; tanpa HTML mentah. |
| T-308 | `HintPanel` 3 level + pencatatan `hint_level_max` | P0 | T-305 | US-14 lulus. |
| T-309 | `FeedbackBox` + alur salah 2×/3× (tawarkan petunjuk / lihat pembahasan) | P0 | T-306 | US-15 AC3 lulus. |
| T-310 | S-07 Refleksi & ringkasan pola langkah | P0 | T-210 | US-17 lulus. |

## Fase 4 — Komponen Interaktif & Pemeriksa

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-401 | `lib/math/fraction.js` + parser input (bulat, desimal koma/titik, `a/b`, negatif) | P0 | T-102 | Tes unit ≥ 20 kasus. |
| T-402 | `lib/checkers`: numeric, linear_model, identify_info, known_asked, point + katalog pola kesalahan | P0 | T-401 | Tes setiap kode umpan balik. |
| T-403 | `GraphCanvas` (grid, sumbu, transformasi koordinat, skala 1:1, responsif) | P0 | T-106 | Tes `coords.js`; tampilan benar di 360 px. |
| T-404 | `SlopeExplorer` mode satu garis + segitiga naik/jalan | P0 | T-403 | US-05 lulus. |
| T-405 | `SlopeExplorer` mode dua garis + status sejajar/tegak lurus | P0 | T-404 | US-06 lulus. |
| T-406 | `PointPlotter` mode plot (snap, hapus titik, garis muncul) | P0 | T-403 | US-07 lulus. |
| T-407 | `PointPlotter` mode baca dengan 3 level fading | P0 | T-406 | US-08 lulus. |
| T-408 | Renderer F–E–I: `identify_info`, `known_asked`, `define_variables`, `linear_model`, `check_back`, `interpret`, `evaluate` | P0 | T-402, T-306 | US-10 s.d. US-13 lulus. |
| T-409 | Mode kontekstual penjelajah (label sumbu, domain terbatas) | P0 | T-404 | Dipakai di U3 & U6. |

## Fase 5 — Konten (dikerjakan pemilik proyek, dibantu validator)

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-501 | Templat JSON per jenis aktivitas + contoh lengkap U3 | P0 | T-206 | Lolos validator. |
| T-502 | Glosarium modul PGL | P0 | T-501 | Semua istilah `[[…]]` di konten punya entri (PP-05). |
| T-503 | Konten U1 | P0 | T-501 | Telaah pemilik; lolos validator. |
| T-504 | Konten U2 | P0 | T-501 | Idem. |
| T-505 | Konten U3 | P0 | T-501 | Idem. |
| T-506 | Konten U4 | P0 | T-501, T-004 | Idem. |
| T-507 | Konten U5 | P0 | T-501 | Idem. |
| T-508 | Konten U6 | P0 (lihat jalur minimum) | T-501, T-004 | Idem. |
| T-509 | Konten U0 cek prasyarat | P1 | T-501 | Idem. |
| T-510 | Validator konten: PP-01 (metadata), PP-05 (glosarium), PP-08 (≤ 80 kata) | P0 | T-206 | Seed gagal bila dilanggar. |

## Fase 6 — Asesmen, Peneliti

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-601 | Kisi-kisi & butir asesmen paket A/B + rubrik final | P0 | T-002 | Ditelaah pembimbing/ahli. |
| T-602 | Seed asesmen; endpoint siswa asesmen (tanpa kunci) | P0 | T-201 | Tes: `answer_key` tidak pernah ada di respons. |
| T-603 | Autosave & submit + skor otomatis F1/F3/E2 | P0 | T-602 | Tes penskoran sesuai ASSESSMENT_RUBRIC §5.1. |
| T-604 | S-08 Asesmen (tanpa petunjuk/umpan balik, navigasi butir, tinjau, kirim) | P0 | T-603 | US-18 lulus. |
| T-605 | Endpoint peneliti: kelas, progres, buka/tutup asesmen | P0 | T-209 | Tes peran (siswa → 403). |
| T-606 | Ekspor CSV 5 dataset + proteksi formula injection | P0 | T-605 | US-22 lulus; tes injeksi. |
| T-607 | S-10 Area Peneliti (Kelas, Asesmen, Ekspor) | P0 | T-605, T-606 | Uji manual. |
| T-608 | Penilaian rubrik di aplikasi (queue buta + simpan skor) | P1 | T-603 | US-24 lulus. |

## Fase 7 — PWA & Offline

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-701 | Ikon (192, 512, maskable, apple-touch) | P0 | TBD-02 (boleh placeholder) | Manifest tanpa peringatan. |
| T-702 | Konfigurasi `vite-plugin-pwa` (manifest, precache, runtime caching sesuai PWA_SPECIFICATION) | P0 | T-305 | Lighthouse installable. |
| T-703 | Prefetch konten modul setelah login | P0 | T-702 | Mode pesawat: semua unit terbuka. |
| T-704 | `OfflineBanner`, S-11 Halaman Offline, nonaktifkan asesmen saat offline | P0 | T-702 | US-20 lulus. |
| T-705 | `UpdatePrompt` (ditunda selama asesmen) | P0 | T-702 | Uji manual pembaruan versi. |
| T-706 | Tombol/panduan instal (S-09) | P0 | T-702 | US-19 lulus. |
| T-707 | Logout membersihkan cache `user-v1` & draf | P0 | T-702 | Uji manual + tes unit storage. |
| T-708 | Antrean IndexedDB + `POST /sync/batch` | P1 | T-208 | US-25 lulus. |

## Fase 8 — QA & Penguatan

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-801 | Uji responsif 360/768/1280 & perangkat Android nyata | P0 | Fase 3–7 | Daftar periksa TESTING_STRATEGY lulus. |
| T-802 | Audit aksesibilitas (Lighthouse + keyboard + kontras) | P0 | Fase 3–7 | Tidak ada temuan kritis. |
| T-803 | Audit keamanan (daftar periksa SECURITY §10, tes otorisasi) | P0 | Fase 2, 6 | Semua butir dicentang. |
| T-804 | Performa (ukuran bundel, Lighthouse mobile) | P0 | Fase 7 | NFR-02 terpenuhi atau tercatat penyimpangannya. |
| T-805 | Jalankan seluruh ACCEPTANCE_TESTING (Must) | P0 | T-801–T-804 | Laporan hasil uji. |

## Fase 9–11 — Validasi, Deployment, Evaluasi

| ID | Tugas | Prioritas | Dependensi | DoD |
|---|---|---|---|---|
| T-901 | Siapkan instrumen validasi ahli materi & media | P0 | T-003 | Instrumen disetujui pembimbing. |
| T-902 | Validasi ahli & revisi | P0 | T-805, T-901 | Rekap skor + log revisi. |
| T-1001 | Putuskan hosting (TBD-05) & deploy produksi HTTPS | P0 | T-805 | DEPLOYMENT_GUIDE dijalankan; aplikasi diakses dari HP. |
| T-1002 | Cadangan terjadwal + uji pemulihan | P0 | T-1001 | Pemulihan berhasil diuji. |
| T-1003 | Buat akun uji coba, catat persetujuan | P0 | T-1001, T-005 | `consent_confirmed` terisi. |
| T-1004 | Uji coba perorangan (one-to-one) & revisi | P0 | T-1003 | Catatan observasi + revisi. |
| T-1005 | Uji coba kelompok kecil | P0 | T-1004 | Data terkumpul. |
| T-1101 | Analisis data (SUS, angket, data proses, rubrik) | P0 | T-1005 | Laporan evaluasi. |
