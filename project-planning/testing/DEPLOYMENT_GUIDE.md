# Deployment Guide

> **Dokumen terkait:** [../technical/ARCHITECTURE.md](../technical/ARCHITECTURE.md) §8 · [../technical/ADR.md](../technical/ADR.md) (ADR-014) · [../technical/SECURITY_AND_PRIVACY.md](../technical/SECURITY_AND_PRIVACY.md) · [../technical/PWA_SPECIFICATION.md](../technical/PWA_SPECIFICATION.md)
>
> ⚠️ Penyedia hosting **belum diputuskan (TBD-05)**. Panduan ini menjelaskan langkah yang berlaku umum dan dua jalur utama. Nama layanan disebut sebagai contoh; batasan paket gratis dan harga dapat berubah — periksa dokumentasi resmi penyedia sebelum memilih.

---

## 1. Kebutuhan Produksi

| Kebutuhan | Alasan |
|---|---|
| HTTPS untuk frontend & backend | Wajib untuk PWA (service worker) dan keamanan token. |
| Disk persisten **atau** PostgreSQL terkelola | SQLite hilang pada disk sementara. |
| Variabel lingkungan rahasia | `JWT_SECRET`, `DATABASE_URL`. |
| Cadangan basis data | Data penelitian tidak tergantikan. |
| Domain (opsional) | Subdomain bawaan penyedia sudah cukup untuk uji coba; domain sendiri **TBD**. |

## 2. Variabel Lingkungan

### Backend (`backend/.env` — jangan di-commit; contoh di `.env.example`)

| Variabel | Contoh | Keterangan |
|---|---|---|
| `ENV` | `production` | Menonaktifkan `/docs`. |
| `DATABASE_URL` | `sqlite:///./data/app.db` atau `postgresql+psycopg://…` | |
| `JWT_SECRET` | (acak ≥ 32 byte) | Buat dengan `python -c "import secrets; print(secrets.token_urlsafe(48))"`. |
| `JWT_EXPIRE_MINUTES` | `480` | 8 jam. |
| `CORS_ORIGINS` | `https://app-contoh.example` | Domain frontend, dipisah koma. |
| `LOG_LEVEL` | `INFO` | |

### Frontend (saat build)

| Variabel | Contoh | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api-contoh.example/api/v1` | Kosongkan bila frontend & backend satu domain (pakai `/api/v1`). |

## 3. Persiapan Rilis (semua jalur)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest
alembic upgrade head
python -m app.cli seed-content content/pgl
python -m app.cli create-researcher --username PENELITI-01

# Frontend
cd ../frontend
npm ci
npm test
npm run build        # hasil di frontend/dist/
```

## 4. Jalur A — Frontend statis + Backend PaaS + PostgreSQL terkelola

1. **Basis data:** buat instans PostgreSQL di penyedia terkelola; catat `DATABASE_URL`.
2. **Backend:**
   - Hubungkan repositori GitHub ke PaaS; direktori root `backend/`.
   - Perintah build: `pip install -r requirements.txt`.
   - Perintah start: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Isi variabel lingkungan (§2).
   - Jalankan seed & pembuatan akun peneliti lewat konsol/shell penyedia.
   - Catat URL HTTPS backend.
3. **Frontend:**
   - Hubungkan repositori ke hosting statis; root `frontend/`, build `npm run build`, output `dist`.
   - Set `VITE_API_BASE_URL`.
   - Tambahkan aturan *SPA fallback* (semua rute → `index.html`), misal file `_redirects` (Netlify) atau konfigurasi rewrite (Vercel). Pastikan `sw.js` **tidak** di-cache lama oleh CDN (header `Cache-Control: no-cache` untuk `sw.js` dan `index.html`).
4. Perbarui `CORS_ORIGINS` backend dengan domain frontend.

**Perhatikan:** sebagian PaaS gratis "menidurkan" layanan saat tidak aktif sehingga permintaan pertama lambat. Uji sebelum sesi kelas.

## 4b. Jalur A-praktis — Netlify (frontend) + Render (backend) + Neon (PostgreSQL)

Konfigurasi sudah ada di repo: `netlify.toml` (root) dan `render.yaml` (root). Semua layanan punya paket gratis.
Netlify **meneruskan** `/api/*` ke Render, sehingga browser melihat satu domain: tidak perlu `CORS_ORIGINS`
maupun `VITE_API_BASE_URL`.

> Catatan: paket gratis Render "tidur" setelah ±15 menit tanpa pengunjung; permintaan pertama setelahnya
> bisa 30–60 detik. Buka aplikasi beberapa menit sebelum sesi kelas.
> Jangan memakai SQLite di Render gratis — disknya terhapus setiap deploy/restart (data siswa hilang).

### Langkah 1 — Basis data (Neon)
1. Daftar di https://neon.tech (boleh dengan akun GitHub) → **New Project** → region terdekat (mis. Singapore).
2. Buka **Connection Details**, salin *connection string* (`postgresql://…?sslmode=require`).
   Simpan sementara di tempat aman — ini rahasia, **jangan** ditempel ke GitHub.

### Langkah 2 — Backend (Render)
1. Daftar di https://render.com dengan akun GitHub.
2. **New → Blueprint** → pilih repositori ini → Render membaca `render.yaml` dan membuat layanan `jelajahgaris-api`.
3. Saat diminta mengisi variabel:
   - `DATABASE_URL` = connection string Neon dari Langkah 1.
   - `GEMINI_API_KEY` = kunci Gemini (kosongkan bila AI tidak dipakai).
   - `JWT_SECRET` dibuat otomatis oleh Render.
4. Tunggu deploy selesai (log menampilkan `alembic upgrade` → `seed-content` → `Uvicorn running`).
5. Catat URL layanan, mis. `https://jelajahgaris-api.onrender.com`. Uji: buka `<URL>/api/v1/health` → `{"status":"ok"…}`.

### Langkah 3 — Frontend (Netlify)
1. **Jika URL Render berbeda** dari `https://jelajahgaris-api.onrender.com`, ubah baris `to = …` di `netlify.toml`,
   commit, dan push.
2. Netlify → **Add new site → Import an existing project → GitHub** → pilih repositori ini.
   Pengaturan build terbaca dari `netlify.toml` (base `frontend`, perintah `npm run build`, publish `dist`).
3. **Deploy**. Setelah selesai, buka URL Netlify (mis. `https://nama-situs.netlify.app`).
4. (Opsional) **Site configuration → Change site name** agar alamatnya mudah diingat siswa.

### Langkah 4 — Buat akun (dari laptop, ke basis data Neon)
Render gratis tidak menyediakan Shell, jadi akun dibuat dari laptop dengan menunjuk ke basis data Neon.
Di PowerShell, dari folder `backend`:

```powershell
.venv\Scripts\python -m pip install -r requirements.txt     # sekali saja (memasang driver PostgreSQL)
$env:DATABASE_URL = "postgresql://...salinan-dari-Neon..."
.venv\Scripts\python -m app.cli create-researcher --username PENELITI-01
.venv\Scripts\python -m app.cli create-students --class KLS8A --count 30 --label "Kelas 8A"
Remove-Item Env:DATABASE_URL                                 # kembali ke basis data lokal
```

- PIN peneliti tampil sekali di layar; daftar kode+PIN siswa tersimpan di `backend/exports/akun_KLS8A.csv`
  (sudah dikecualikan dari Git — simpan di tempat aman).
- Perintah `demo` (PIN 123456) **ditolak** untuk basis data online.
- Masuk sebagai peneliti → izinkan Tanya Gari per kelas bila diperlukan (ADR-018).

### Langkah 5 — Periksa (§8) lalu bagikan URL Netlify ke siswa.

## 5. Jalur B — Satu VPS (SQLite, kendali penuh)

1. Siapkan VPS Linux (Ubuntu LTS), buat pengguna non-root, aktifkan firewall (port 22, 80, 443).
2. Pasang Python 3.11+, Node.js LTS (hanya untuk build, atau build di lokal lalu unggah `dist/`), dan Nginx atau Caddy.
3. Salin repositori, siapkan backend (§3) di `/srv/app/backend`, `DATABASE_URL=sqlite:////srv/app/data/app.db`.
4. Jalankan backend sebagai layanan `systemd`:
   ```ini
   [Service]
   WorkingDirectory=/srv/app/backend
   EnvironmentFile=/srv/app/backend/.env
   ExecStart=/srv/app/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
   Restart=always
   ```
   `--workers 1` karena SQLite & pembatasan login di memori (lihat SECURITY §3).
5. Reverse proxy (contoh Caddy — HTTPS otomatis via Let's Encrypt):
   ```
   app-contoh.example {
       handle /api/* {
           reverse_proxy 127.0.0.1:8000
       }
       handle {
           root * /srv/app/frontend/dist
           try_files {path} /index.html
           file_server
       }
       @nocache path /sw.js /index.html
       header @nocache Cache-Control "no-cache"
   }
   ```
   Dengan satu domain, CORS tidak diperlukan dan `VITE_API_BASE_URL` dikosongkan.
6. Cadangan harian (cron):
   ```bash
   sqlite3 /srv/app/data/app.db ".backup /srv/app/backups/app-$(date +%F).db"
   ```
   Salin cadangan ke lokasi lain secara berkala dan **uji pemulihan** minimal sekali.

## 5b. Jalur C — Satu kontainer Docker (disarankan; sudah disiapkan di repo)

Backend kini dapat menyajikan build frontend sendiri bila `STATIC_DIR` diisi. Satu layanan, satu domain, tanpa CORS. File yang tersedia:

| File | Fungsi |
|---|---|
| `Dockerfile` | Build frontend (Node 20) → runtime Python 3.12; pengguna non-root. |
| `backend/start.sh` | `alembic upgrade head` → `seed-content` (idempoten) → `uvicorn --workers 1`. |
| `.dockerignore` | Mengecualikan data, `.env`, CSV, PDF wawancara, `project-planning/`. |
| `.github/workflows/ci.yml` | Lint + tes + build otomatis di GitHub. |

```bash
docker build -t jelajahgaris .
docker run -p 8000:8000 -v jg-data:/app/backend/data \
  -e ENV=production -e JWT_SECRET=<acak ≥ 32 karakter> jelajahgaris
```

- Volume `/app/backend/data` **wajib persisten** (berisi `app.db`).
- Aplikasi **menolak start** bila `ENV=production` dan `JWT_SECRET` masih bawaan/pendek.
- Header keamanan (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy) dipasang oleh backend.
- Setelah start pertama, buat akun peneliti lewat shell kontainer: `python -m app.cli create-researcher --username PENELITI-01`.
- **Status:** Dockerfile belum diuji build di komputer pengembang (Docker tidak terpasang); mode satu layanan sudah diuji lokal tanpa Docker.

Uji mode satu layanan tanpa Docker:

```bash
cd frontend && npm run build
cd ../backend && STATIC_DIR=../frontend/dist uvicorn app.main:app --port 8000   # buka http://localhost:8000
```

## 6. Konfigurasi HTTPS dan Domain

| Hal | Langkah |
|---|---|
| Hosting statis/PaaS | HTTPS biasanya otomatis untuk subdomain bawaan; untuk domain sendiri, tambahkan record DNS (CNAME/A) sesuai petunjuk penyedia. |
| VPS | Arahkan record A domain ke IP VPS; Caddy/Certbot menerbitkan sertifikat otomatis. |
| Verifikasi | Buka `https://…` → ikon gembok; DevTools → Application → Service Workers aktif. |
| HSTS | Aktifkan setelah HTTPS terbukti stabil. |

## 7. Cara Siswa Mengakses Aplikasi

1. Peneliti membagikan **URL** (atau kode QR berisi URL) dan **kartu kode siswa + PIN**.
2. Siswa membuka URL di Chrome (Android/laptop).
3. Masuk dengan kode & PIN.
4. (Disarankan) Pasang aplikasi: Chrome → menu ⋮ → **Instal aplikasi** / **Tambahkan ke layar utama**; atau tautan "Pasang aplikasi" di Beranda. iOS: Safari → Bagikan → **Tambahkan ke Layar Utama**.
5. Buka aplikasi sekali saat online agar konten tersimpan untuk penggunaan offline.

## 8. Daftar Periksa Setelah Deploy

- [ ] `GET /api/v1/health` 200 via HTTPS.
- [ ] `/docs` tidak dapat diakses.
- [ ] Login siswa & peneliti berhasil dari HP.
- [ ] Lighthouse installable lulus pada URL produksi.
- [ ] Mode offline berfungsi (PWA_SPECIFICATION §8).
- [ ] Ekspor CSV berfungsi.
- [ ] Cadangan pertama berhasil dibuat & dipulihkan di lingkungan uji.
- [ ] Tidak ada akun uji (`TEST-*`, `UJI-*`) di produksi.

## 9. Pembaruan Versi

1. Uji di lokal → merge ke `main`.
2. Backend: deploy → `alembic upgrade head` (selalu cadangkan DB sebelum migrasi).
3. Frontend: build & deploy → service worker baru memicu `UpdatePrompt` di perangkat siswa.
4. Hindari deploy saat sesi uji coba kelas berlangsung.
