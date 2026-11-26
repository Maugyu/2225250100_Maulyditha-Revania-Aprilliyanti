# Architecture

> **Dokumen terkait:** [ADR.md](ADR.md) · [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) · [API_SPECIFICATION.md](API_SPECIFICATION.md) · [PWA_SPECIFICATION.md](PWA_SPECIFICATION.md) · [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md) · [../testing/DEPLOYMENT_GUIDE.md](../testing/DEPLOYMENT_GUIDE.md)

---

## 1. Gambaran Arsitektur

Arsitektur **dua bagian terpisah** (frontend SPA + backend REST API) dengan satu basis data. Dipilih karena sederhana, sesuai ketentuan proyek, dan mudah dipahami (lihat ADR-001).

```
┌───────────────────────────── Perangkat siswa ─────────────────────────────┐
│                                                                           │
│  Browser / PWA terinstal                                                  │
│  ┌──────────────────────────────┐     ┌─────────────────────────────────┐ │
│  │ React SPA (Vite build)       │     │ Service Worker (Workbox)        │ │
│  │ - Halaman & komponen         │◀───▶│ - Precache app shell            │ │
│  │ - Pemeriksa jawaban latihan  │     │ - Cache konten modul (API GET)  │ │
│  │ - Grafik SVG, KaTeX          │     │ - Fallback halaman offline      │ │
│  └──────────────┬───────────────┘     └───────────────┬─────────────────┘ │
│                 │ localStorage / IndexedDB (draf, token, antrean F-19)    │
└─────────────────┼─────────────────────────────────────┼───────────────────┘
                  │ HTTPS · JSON · Authorization: Bearer │
                  ▼                                      ▼
┌──────────────────────────────── Server ───────────────────────────────────┐
│  FastAPI (Uvicorn)                                                        │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────────────────┐ │
│  │ Routers  │─▶│ Services │─▶│ Repos/ORM  │─▶│ SQLite (awal)            │ │
│  │ /api/v1  │  │ (logika) │  │ SQLAlchemy │  │ → PostgreSQL (opsional)  │ │
│  └──────────┘  └──────────┘  └────────────┘  └──────────────────────────┘ │
│        ▲ Pydantic schemas (validasi)    Alembic (migrasi)                 │
│        │                                                                  │
│  Konten modul (JSON) ──seed──▶ tabel modules/units/activities             │
└───────────────────────────────────────────────────────────────────────────┘
```

## 2. Frontend

| Aspek | Keputusan |
|---|---|
| Kerangka | React 18+ dengan Vite (JavaScript, bukan TypeScript — ADR-003). |
| Routing | React Router. |
| State | State lokal komponen + React Context untuk sesi pengguna. Data server diambil dengan modul `api/` sederhana berbasis `fetch` (tanpa pustaka state global — ADR-004). |
| Gaya | CSS3 dengan CSS Modules + token di `tokens.css` (custom properties). Tanpa framework CSS. |
| Grafik | Komponen SVG kustom (`GraphCanvas`) — ADR-005. |
| Matematika | KaTeX untuk merender ekspresi — ADR-006. |
| PWA | `vite-plugin-pwa` (Workbox) — ADR-007. |
| Pemeriksa latihan | Modul murni `src/lib/checkers/` (dapat diuji unit), dijalankan di klien agar latihan bekerja offline. |

### 2.1 Struktur direktori frontend (rencana)

```
frontend/
├── index.html
├── vite.config.js            # termasuk konfigurasi vite-plugin-pwa
├── public/
│   ├── icons/                # 192, 512, maskable
│   └── offline.html
└── src/
    ├── main.jsx
    ├── App.jsx               # router
    ├── pages/                # satu file per layar S-xx
    ├── features/
    │   ├── auth/
    │   ├── modules/          # peta unit, progres
    │   ├── player/           # pemutar aktivitas + renderer per jenis langkah
    │   ├── graph/            # GraphCanvas, SlopeExplorer, PointPlotter
    │   ├── assessment/
    │   ├── reflection/
    │   └── researcher/
    ├── components/ui/        # Button, ActionBar, FeedbackBox, GlossaryTerm, MathText
    ├── lib/
    │   ├── api/              # client fetch + endpoint wrappers
    │   ├── checkers/         # pemeriksa jawaban & deteksi pola kesalahan
    │   ├── math/             # pecahan, parsing input, util garis
    │   └── storage/          # draf lokal, antrean (F-19)
    └── styles/
        ├── tokens.css
        └── global.css
```

## 3. Backend

| Aspek | Keputusan |
|---|---|
| Kerangka | FastAPI + Uvicorn. |
| Validasi | Pydantic v2. |
| ORM | SQLAlchemy 2.x — memungkinkan SQLite ↔ PostgreSQL (ADR-002). |
| Migrasi | Alembic. |
| Autentikasi | JWT (HS256) dalam header `Authorization: Bearer`; PIN di-hash dengan bcrypt/argon2 (ADR-008). |
| Pengujian | pytest + `httpx`/`TestClient` FastAPI. |
| Konten | File JSON di `backend/content/` divalidasi skema Pydantic lalu di-*seed* ke basis data dengan perintah CLI. |

### 3.1 Struktur direktori backend (rencana)

```
backend/
├── pyproject.toml / requirements.txt
├── alembic.ini
├── alembic/versions/
├── content/
│   └── pgl/                  # module.json, units/*.json, activities/*.json, glossary.json
├── app/
│   ├── main.py               # buat app, CORS, router
│   ├── cli.py                # create-students, seed-content, reset-pin
│   ├── core/
│   │   ├── config.py         # pengaturan dari variabel lingkungan
│   │   ├── security.py       # hash PIN, JWT
│   │   └── database.py       # engine, session
│   ├── models/               # model SQLAlchemy
│   ├── schemas/              # model Pydantic (request/response, skema konten)
│   ├── routers/              # auth, modules, attempts, reflections, assessments, researcher
│   ├── services/             # logika bisnis (progres, penskoran asesmen, ekspor)
│   └── deps.py               # dependency: get_db, get_current_user, require_role
└── tests/
```

### 3.2 Lapisan dan tanggung jawab

| Lapisan | Tanggung jawab | Tidak boleh |
|---|---|---|
| Router | Menerima request, memanggil service, mengembalikan schema. | Berisi query SQL atau logika bisnis kompleks. |
| Service | Logika bisnis (menghitung progres, menskor asesmen, menyusun CSV). | Mengakses objek `Request` HTTP. |
| Model | Definisi tabel ORM. | Logika bisnis. |
| Schema | Validasi dan bentuk data masuk/keluar. | Akses basis data. |

## 4. Database

- **SQLite** untuk pengembangan dan uji coba awal (file `backend/data/app.db`).
- Kolom JSON memakai tipe `JSON` SQLAlchemy (portabel ke PostgreSQL `JSONB` via varian tipe).
- Semua perubahan skema lewat migrasi Alembic.
- Detail tabel: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## 5. REST API

- Prefiks `/api/v1`, format JSON, penamaan `snake_case`.
- Autentikasi Bearer kecuali `/health` dan `/auth/login`.
- Galat memakai format seragam `{ "error": { "code", "message", "details" } }`.
- Detail: [API_SPECIFICATION.md](API_SPECIFICATION.md).

## 6. PWA

- Manifest + service worker dari `vite-plugin-pwa`.
- Precache app shell; konten modul `NetworkFirst` dengan fallback cache; endpoint tulis `NetworkOnly`.
- Detail: [PWA_SPECIFICATION.md](PWA_SPECIFICATION.md).

## 7. Alur Komunikasi Sistem

### 7.1 Masuk

```
Siswa        React SPA                FastAPI                  DB
  │ kode+PIN    │                        │                      │
  │────────────▶│ POST /auth/login       │                      │
  │             │───────────────────────▶│ cari user, cek hash  │
  │             │                        │─────────────────────▶│
  │             │       200 {token,user} │◀─────────────────────│
  │             │◀───────────────────────│                      │
  │             │ simpan token           │                      │
```

### 7.2 Mengerjakan langkah latihan

```
SPA: tampil langkah (konten dari cache/API)
SPA: siswa menjawab → checker klien → umpan balik instan
SPA: POST /attempts/{id}/responses {step_key, response, is_correct, feedback_code, hint_level_max, client_id}
API: validasi → simpan step_responses → 201
(offline: MVP simpan draf lokal; F-19 masukkan antrean IndexedDB)
```

### 7.3 Asesmen

```
SPA: GET /assessments/{id}   → butir TANPA kunci jawaban
SPA: PUT /submissions/{id}/responses/{item_id}  (autosave)
SPA: POST /submissions/{id}/submit
API: skor otomatis awal (F1, F3, E2) → simpan → 200
Peneliti: skor uraian lewat rubrik (F-18) atau CSV
```

## 8. Deployment (ringkas)

| Komponen | Opsi | Catatan |
|---|---|---|
| Frontend | Hosting statis dengan HTTPS otomatis (misal Netlify, Vercel, Cloudflare Pages, GitHub Pages) | Build `npm run build` → folder `dist/`. SPA butuh aturan *fallback* ke `index.html`. |
| Backend | Layanan yang menjalankan Python + **disk persisten** (VPS, atau PaaS dengan volume persisten) | SQLite memerlukan disk persisten. Bila PaaS gratis berdisk sementara → gunakan PostgreSQL terkelola. |
| Basis data | SQLite file (dengan cadangan) atau PostgreSQL terkelola | Keputusan **TBD-05**. |

Panduan langkah demi langkah: [../testing/DEPLOYMENT_GUIDE.md](../testing/DEPLOYMENT_GUIDE.md).

## 9. Lingkungan

| Lingkungan | Frontend | Backend | DB |
|---|---|---|---|
| Lokal | `npm run dev` (port 5173) | `uvicorn app.main:app --reload` (port 8000) | SQLite lokal |
| Produksi (uji coba) | Hosting statis HTTPS | Server HTTPS | SQLite persisten / PostgreSQL |

Pada pengembangan lokal, Vite *proxy* meneruskan `/api` ke `http://localhost:8000` sehingga tidak perlu CORS. Di produksi, CORS backend hanya mengizinkan domain frontend.

## 10. Hal yang Sengaja Tidak Dipakai

| Teknologi | Alasan |
|---|---|
| Microservices, message queue, Redis | Berlebihan untuk skala S1. |
| Docker (wajib) | Opsional; menambah kurva belajar. Dapat ditambahkan nanti. |
| GraphQL | REST cukup dan sesuai ketentuan. |
| Pustaka grafik berat (misal kalkulator grafik pihak ketiga) | Ukuran bundel, ketergantungan eksternal, kendali tampilan (EL03). |
| Server-side rendering (Next.js) | Tidak dibutuhkan; SPA + PWA lebih sederhana. |
