# PWA Specification

> **Dokumen terkait:** [ARCHITECTURE.md](ARCHITECTURE.md) · [ADR.md](ADR.md) (ADR-007) · [../design/USER_FLOW.md](../design/USER_FLOW.md) §8–9 · [../testing/TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)

---

## 1. Tujuan PWA dalam Proyek Ini

| Tujuan | Ukuran keberhasilan |
|---|---|
| Dapat diinstal tanpa toko aplikasi | Lolos kriteria installable di Chrome; ikon muncul di layar utama Android. |
| Tetap berguna saat koneksi terputus | Materi unit yang pernah dibuka dan Penjelajah Gradien berjalan dalam mode pesawat. |
| Ringan | App shell di-precache; pembukaan berikutnya cepat dari cache. |
| Pembaruan aman | Versi baru tidak memotong siswa yang sedang menjawab. |

## 2. Web App Manifest

Dihasilkan oleh `vite-plugin-pwa` dari konfigurasi di `vite.config.js`.

```json
{
  "name": "JelajahGaris — Literasi Matematika",
  "short_name": "JelajahGaris",
  "description": "Belajar persamaan garis lurus dalam kehidupan sehari-hari, selangkah demi selangkah.",
  "lang": "id",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#FFFFFF",
  "theme_color": "#FFFFFF",
  "icons": [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
```

| Field | Status |
|---|---|
| `name`, `short_name` | Nama kerja; **TBD-01**. |
| `theme_color`, `background_color` | Placeholder; **TBD-02** (menunggu referensi desain). |
| Ikon | Harus dibuat (192, 512, maskable 512 dengan *safe zone*). Tambahan `apple-touch-icon` 180×180 di `index.html` untuk iOS. |
| `orientation: any` | Grafik nyaman di lanskap pada ponsel. |

## 3. Service Worker

### 3.1 Pembuatan

- Mode `generateSW` dari `vite-plugin-pwa` (Workbox) — tidak menulis service worker manual di MVP.
- `registerType: "prompt"` — pengguna diberi tahu ada versi baru (komponen `UpdatePrompt`), bukan dimuat ulang otomatis.
- `navigateFallback: "/index.html"` untuk rute SPA; `navigateFallbackDenylist: [/^\/api\//]`.

### 3.2 Strategi caching

| Sumber | Pola URL | Strategi | Nama cache | Kedaluwarsa | Alasan |
|---|---|---|---|---|---|
| App shell (HTML, JS, CSS, font KaTeX, ikon) | Hasil build | **Precache** | `workbox-precache` | Diganti saat versi baru | Aplikasi terbuka offline. |
| Daftar modul & detail modul | `GET /api/v1/modules*` | **NetworkFirst** (timeout 3 dtk) | `content-v1` | 30 hari, maks. 20 entri | Konten terbaru bila online; cache bila offline. |
| Detail aktivitas | `GET /api/v1/activities/*` | **NetworkFirst** (timeout 3 dtk) | `content-v1` | 30 hari, maks. 100 entri | Idem. |
| Progres & resume | `GET /api/v1/me/progress`, `GET /api/v1/me/resume` (bukan `/me/assessments`) | **NetworkFirst** (timeout 3 dtk) | `user-v1` | 1 hari | Tampil data terakhir saat offline, ditandai "mungkin belum terbaru". |
| Endpoint tulis | `POST/PUT/PATCH /api/v1/*` | **NetworkOnly** | — | — | Tidak boleh di-cache. |
| Asesmen | `/api/v1/me/assessments`, `/api/v1/assessments*`, `/api/v1/submissions*` | **NetworkOnly** | — | — | Asesmen hanya online (US-18). |
| Peneliti & autentikasi | `/api/v1/researcher/*`, `/api/v1/auth/*` | **NetworkOnly** | — | — | Data sensitif & sesi. |

> **Privasi cache:** cache `user-v1` berisi data progres pengguna. Saat logout, aplikasi menghapus cache `user-v1` dan draf lokal (lihat [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md) §6).

### 3.3 Prefetch konten modul

Setelah login berhasil dan online, aplikasi memanggil `GET /modules/pgl` lalu seluruh `GET /activities/{id}` untuk modul tersebut di latar belakang (ukuran total konten diperkirakan kecil, < 500 KB — **akan diukur**). Tujuannya: seluruh unit tersedia offline tanpa harus dibuka satu per satu. Dapat dinonaktifkan bila ukuran ternyata besar.

## 4. Instalasi

| Platform | Perilaku |
|---|---|
| Chrome Android / Chrome & Edge desktop | Tangkap event `beforeinstallprompt`, simpan, tampilkan tautan sekunder "Pasang aplikasi" di Beranda. Setelah `appinstalled`, sembunyikan tautan. |
| Safari iOS/iPadOS | Tidak mendukung `beforeinstallprompt`. Tampilkan panduan manual (S-09). |
| Firefox desktop | Dukungan instalasi PWA terbatas/berbeda antarversi; aplikasi tetap berjalan sebagai situs web. |

Prasyarat instalasi: HTTPS (atau `localhost`), manifest valid dengan ikon 192 & 512, service worker terdaftar.

## 5. Dukungan Offline

| Fitur | Offline? | Catatan |
|---|---|---|
| Membuka aplikasi & Beranda | ✅ | Progres dari cache terakhir. |
| Peta unit | ✅ | Dari cache `content-v1`. |
| Penjelajah Gradien, plot titik | ✅ | Logika sepenuhnya di klien. |
| Latihan & masalah kontekstual | ✅ (pemeriksaan) | Pencatatan ke server: MVP tertunda (draf lokal); F-19 antrean. |
| Refleksi | ⚠️ | MVP: draf lokal, kirim saat online. |
| Asesmen | ❌ | Pesan "Sambungkan internet". |
| Login pertama | ❌ | Butuh server. |
| Area peneliti | ❌ | |

### 5.1 Draf lokal (MVP)

- Kunci `localStorage`: `draft:{username}:{activityId}:{stepKey}`; dihapus setelah respons terkirim.
- Membaca/menulis dibungkus `try/catch` (mode privat dapat menolak).

### 5.2 Antrean sinkronisasi (F-19, Should)

- IndexedDB store `outbox` berisi entri `{client_id, type, payload, created_at, tries}`.
- Pemicu kirim: event `online`, saat aplikasi dibuka, dan setiap 60 detik bila ada entri.
- Kirim lewat `POST /sync/batch`; hapus entri yang `accepted`/`duplicates`; simpan `rejected` untuk diperiksa.
- **Tidak** bergantung pada Background Sync API karena dukungan lintas browser tidak merata.

## 6. Pembaruan Versi

1. Build baru menghasilkan service worker baru.
2. SW baru menunggu (`waiting`); aplikasi menampilkan `UpdatePrompt`: "Versi baru tersedia. [Muat ulang]".
3. Prompt **tidak** ditampilkan di tengah asesmen; ditunda hingga siswa berada di Beranda/Peta Unit.
4. Konten modul diberi `content_version`; bila versi konten berubah saat attempt berlangsung, attempt tetap mencatat versi saat dimulai.

## 7. Kompatibilitas Perangkat

| Target | Status | Pengujian |
|---|---|---|
| Chrome Android (2 versi utama terakhir), layar 360–412 px | Utama | Perangkat nyata minimal 1 + emulasi DevTools |
| Chrome/Edge desktop (Windows) | Utama | Langsung |
| Firefox desktop | Didukung (tanpa jaminan instalasi) | Langsung |
| Safari iOS | Didukung terbatas (instal manual; penyimpanan dapat dibersihkan sistem bila jarang dipakai) | Bila perangkat tersedia (TBD) |
| Browser bawaan vendor Android (misal Samsung Internet) | Upaya terbaik | Bila perangkat tersedia |

## 8. Daftar Periksa PWA

- [ ] Manifest valid (DevTools → Application → Manifest tanpa peringatan).
- [ ] Ikon 192, 512, maskable tersedia.
- [ ] Service worker aktif dan mengontrol halaman.
- [ ] Lighthouse: kriteria installable terpenuhi.
- [ ] Mode pesawat: Beranda, Peta Unit, dan unit yang di-prefetch terbuka.
- [ ] Endpoint tulis tidak pernah dilayani dari cache.
- [ ] Logout menghapus `user-v1` & draf.
- [ ] Prompt pembaruan muncul dan tidak memotong asesmen.
