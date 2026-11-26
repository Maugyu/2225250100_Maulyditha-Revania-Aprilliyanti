# Testing Strategy

> **Dokumen terkait:** [ACCEPTANCE_TESTING.md](ACCEPTANCE_TESTING.md) · [../development/CODING_STANDARDS.md](../development/CODING_STANDARDS.md) · [../technical/PWA_SPECIFICATION.md](../technical/PWA_SPECIFICATION.md) · [EVALUATION_PLAN.md](EVALUATION_PLAN.md)
>
> Pengujian di dokumen ini adalah **pengujian perangkat lunak** (apakah aplikasi bekerja benar). Evaluasi pedagogis & kelayakan media ada di [EVALUATION_PLAN.md](EVALUATION_PLAN.md).

---

## 1. Piramida Pengujian

```
            ┌───────────────┐
            │  E2E (sedikit)│   Playwright: 3–5 alur kritis
            ├───────────────┤
            │ Integrasi/API │   pytest + TestClient; RTL untuk alur komponen
            ├───────────────┤
            │  Unit (banyak)│   checkers, math, coords, services
            └───────────────┘
   + Manual terstruktur: responsif, PWA, lintas browser, aksesibilitas
```

Prioritas tertinggi: **logika pemeriksa jawaban dan matematika**, karena kesalahan di sini langsung memberi umpan balik keliru kepada siswa.

## 2. Unit Testing

| Target | Alat | Contoh kasus wajib |
|---|---|---|
| `lib/math/fraction.js` | Vitest | `"1/2"`, `"-3/4"`, `"0,5"`, `"2.5"`, `"4/2"` = 2, penyebut 0 → galat, spasi, input kosong. |
| `lib/checkers` | Vitest | Benar; `SIGN_FLIP` (−2 vs 2); `ORDER_MISMATCH`; `RECIPROCAL` (½ vs −½); `M_C_SWAP`; `XY_SWAP`; `IRRELEVANT_SELECTED`; `MISSED_INFO`; pola tak dikenali → `ARITH`/umum. |
| `features/graph/coords.js` | Vitest | Konversi dunia ↔ layar; skala 1:1; snap ke bilangan bulat & kelipatan 0,5. |
| Service backend (progres, penskoran asesmen, ekspor CSV) | pytest | Status unit dengan aktivitas opsional; skor F1/F3/E2 sesuai tabel; sel `=1+1` diawali `'`. |
| Security backend | pytest | Hash & verifikasi PIN; token kedaluwarsa ditolak. |
| Validator konten | pytest | Tanpa `literacy_processes` → gagal; istilah tanpa glosarium → gagal; situasi > 80 kata → gagal. |

Target cakupan: `lib/checkers` & `lib/math` ≥ 90%; service backend ≥ 70%.

## 3. Integration Testing

| Skenario | Lapisan |
|---|---|
| Seed konten → `GET /modules/pgl` mengembalikan unit & glosarium yang sesuai file JSON. | Backend (DB SQLite sementara) |
| Alur attempt: buat → kirim respons → PATCH completed → progres berubah. | Backend |
| Pemutar aktivitas: jawab salah 2× → petunjuk ditawarkan; 3× → tombol pembahasan. | Frontend (RTL, API tiruan) |
| Draf lokal: ketik jawaban → pindah langkah → kembali → jawaban masih ada. | Frontend |
| Migrasi Alembic dari kosong → head berhasil di SQLite **dan** PostgreSQL (sebelum migrasi produksi). | Backend |

## 4. API Testing

Setiap endpoint diuji untuk kategori berikut (pytest + `TestClient`):

| Kategori | Contoh |
|---|---|
| Sukses | 200/201 dengan schema respons sesuai. |
| Validasi | Field hilang/terlalu panjang/tidak dikenal → 422 format seragam. |
| Autentikasi | Tanpa token / token rusak / kedaluwarsa → 401. |
| Otorisasi | Siswa ke `/researcher/*` → 403. |
| Kepemilikan (IDOR) | Siswa A mengakses `attempt` siswa B → 404. |
| Idempotensi | `client_id` sama dua kali → satu baris; isi berbeda → 409. |
| Kerahasiaan | Respons asesmen tidak memuat `answer_key` (cek rekursif). |
| Pembatasan | 6 login gagal → 429. |

Koleksi permintaan manual (misal file `.http` untuk ekstensi REST Client VS Code) disediakan di `backend/tests/manual/` untuk eksplorasi.

## 5. UI Testing

| Jenis | Alat | Cakupan |
|---|---|---|
| Komponen | Vitest + React Testing Library | Renderer langkah, HintPanel, FeedbackBox, SlopeExplorer (slider memperbarui teks persamaan), PointPlotter (klik menghasilkan titik ter-snap). |
| E2E | Playwright (P1 — dapat diganti uji manual terstruktur bila waktu terbatas) | (1) Login → selesaikan aktivitas contoh; (2) asesmen → kirim; (3) peneliti ekspor CSV; (4) offline: buka unit dalam mode offline. |
| Manual terstruktur | Lembar periksa | Setiap layar S-01 s.d. S-11 sesuai WIREFRAME_SPECIFICATION. |

## 6. Responsive Testing

| Lebar | Perangkat acuan | Periksa |
|---|---|---|
| 360 px | Android kecil | Tidak ada gulir horizontal; ActionBar menempel; grafik terbaca; papan ketik tidak menutupi input. |
| 412 px | Android umum | Idem. |
| 768 px | Tablet | Satu kolom lebar. |
| 1280 px | Laptop | Dua kolom di Pemutar Aktivitas; panel petunjuk samping. |
| Lanskap ponsel | 740×360 | Grafik dan slider tetap dapat dipakai. |

Alat: DevTools Device Mode + minimal **satu perangkat Android nyata**.

## 7. PWA Testing

| Uji | Cara | Lulus bila |
|---|---|---|
| Installable | Lighthouse (kategori PWA/installability) & DevTools Application | Tidak ada galat manifest/SW. |
| Instal Android | Chrome → Instal aplikasi | Ikon & nama benar; terbuka standalone. |
| Offline | DevTools "Offline" + mode pesawat di HP | Beranda, Peta Unit, unit ter-prefetch, Penjelajah berjalan; asesmen menampilkan pesan. |
| Cache tulis | Network tab | POST/PUT/PATCH tidak pernah dilayani SW. |
| Pembaruan | Deploy versi baru | `UpdatePrompt` muncul; tidak muncul selama asesmen. |
| Logout | Logout lalu periksa Cache Storage & localStorage | `user-v1`, token, draf terhapus. |

## 8. Cross-Browser Testing

| Browser | Prioritas | Cakupan |
|---|---|---|
| Chrome Android (terbaru & 1 versi sebelumnya) | Tinggi | Seluruh skenario acceptance. |
| Chrome desktop | Tinggi | Seluruh skenario. |
| Edge desktop | Sedang | Alur utama + instal. |
| Firefox desktop | Sedang | Alur utama (tanpa instal). |
| Safari iOS | Rendah (bila perangkat ada) | Alur utama + panduan instal manual. |

## 9. Aksesibilitas, Performa, Keamanan

| Area | Alat/cara | Target |
|---|---|---|
| Aksesibilitas | Lighthouse Accessibility, navigasi keyboard penuh, pemeriksa kontras | Skor ≥ 90; semua kontrol dapat dicapai keyboard. |
| Performa | Lighthouse mobile (Slow 4G), `vite build` laporan ukuran | NFR-02. |
| Keamanan | Daftar periksa SECURITY §10, tes otorisasi otomatis | Semua butir lulus. |

## 10. Data Uji

- Fixture konten kecil (`backend/tests/fixtures/content_min/`) — tidak bergantung pada konten produksi.
- Akun uji `TEST-01…TEST-05` dibuat otomatis di basis data tes; **tidak pernah** di produksi.
- Tidak memakai data siswa nyata di tes.

## 11. Kapan Tes Dijalankan

| Momen | Yang dijalankan |
|---|---|
| Setiap commit/PR (GitHub Actions) | Lint + unit + integrasi + API. |
| Sebelum tonggak (M2–M4) | + E2E/manual terstruktur + responsif. |
| Sebelum rilis uji coba | + PWA + lintas browser + aksesibilitas + performa + keamanan + ACCEPTANCE_TESTING lengkap. |
