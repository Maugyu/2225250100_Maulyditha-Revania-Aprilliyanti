# Wireframe Specification

> **Dokumen terkait:** [USER_FLOW.md](USER_FLOW.md) · [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) · [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md)
>
> Wireframe berupa deskripsi struktur (low-fidelity). **Tidak menetapkan desain visual final** (TBD-02). Sketsa ASCII menggambarkan tata letak ponsel (360 px) kecuali disebutkan lain.

---

## Daftar Layar

| Kode | Layar | Rute | Peran | Prioritas |
|---|---|---|---|---|
| S-01 | Masuk | `/masuk` | Semua | Must |
| S-02 | Beranda | `/` | Siswa | Must |
| S-03 | Peta Unit | `/modul/:moduleSlug` | Siswa | Must |
| S-04 | Pemutar Aktivitas | `/aktivitas/:activityId` | Siswa | Must |
| S-05 | Langkah Penjelajah (di dalam S-04) | — | Siswa | Must |
| S-06 | Langkah Masalah F–E–I (di dalam S-04) | — | Siswa | Must |
| S-07 | Ringkasan Unit & Refleksi | `/unit/:unitSlug/ringkasan` | Siswa | Must |
| S-08 | Asesmen | `/asesmen/:assessmentId` | Siswa | Must |
| S-09 | Panduan Instal | `/pasang` | Semua | Must |
| S-10 | Area Peneliti | `/peneliti/*` | Peneliti | Must (Kelas, Ekspor, Asesmen); Should (Penilaian) |
| S-11 | Halaman Offline | (fallback SW) | Semua | Must |

---

## S-01 — Masuk

```
┌────────────────────────────┐
│  [Nama aplikasi — TBD]     │
│  Belajar garis lurus,      │
│  selangkah demi selangkah. │
│                            │
│  Kode siswa                │
│  [__________________]      │
│  PIN (6 angka)             │
│  [______]  (o) tampilkan   │
│                            │
│  [        Masuk        ]   │  ← aksi utama
│                            │
│  Belum punya kode?         │
│  Minta ke guru/peneliti.   │
└────────────────────────────┘
```

- Input PIN: `inputmode="numeric"`, `autocomplete="current-password"`.
- Galat ditampilkan di atas tombol, tidak menghapus kode siswa yang sudah diketik.

## S-02 — Beranda

```
┌────────────────────────────┐
│ Halo, KLS8A-07         [⎋] │  ← keluar
│                            │
│ ┌────────────────────────┐ │
│ │ Berikutnya:            │ │
│ │ U2 Gradien sebagai     │ │
│ │ Laju Perubahan         │ │
│ │ Langkah 3 dari 9       │ │
│ │ [ Lanjutkan belajar ]  │ │  ← satu aksi utama
│ └────────────────────────┘ │
│                            │
│ Progres: ■■□□□□  2/6 unit  │
│                            │
│ Lihat semua unit  ›        │  ← tautan sekunder
│ Asesmen (bila dibuka)  ›   │
│ Pasang aplikasi  ›         │  ← hanya bila dapat diinstal
└────────────────────────────┘
```

## S-03 — Peta Unit

```
┌────────────────────────────┐
│ ‹ Beranda                  │
│ Persamaan Garis Lurus      │
│ dalam Kehidupan Sehari-hari│
│                            │
│ ✓ U1 Dari Tabel ke Grafik  │
│   Membuat grafik dari tabel│
│ ◐ U2 Gradien … (disarankan)│
│   Mengartikan kemiringan   │
│ ○ U3 y = mx + c            │
│ ○ U4 Menyusun Persamaan    │
│ ○ U5 Sejajar & Tegak Lurus │
│ ○ U6 Proyek: Dua Tarif     │
│                            │
│ (Cek prasyarat — opsional) │
└────────────────────────────┘
```

- Ikon status disertai teks tersembunyi untuk pembaca layar ("selesai", "sedang", "belum mulai").

## S-04 — Pemutar Aktivitas (kerangka umum)

**Ponsel:**
```
┌────────────────────────────┐
│ ✕  U2 · Contoh             │  ← StepHeader
│ Langkah 3 dari 9  ▬▬▬───── │
├────────────────────────────┤
│                            │
│   [Area langkah]           │  ← isi berganti sesuai jenis langkah
│                            │
│                            │
├────────────────────────────┤
│ [‹ Kembali] [ Lanjut ] [?] │  ← ActionBar (sticky); ? = Petunjuk
└────────────────────────────┘
```

**Desktop (≥ 1024 px):**
```
┌──────────────────────────────────────────────────────────┐
│ ✕  U2 · Contoh                       Langkah 3 dari 9    │
├───────────────────────────────┬──────────────────────────┤
│ Teks/instruksi langkah         │  Grafik / interaksi      │
│ Ekspresi matematika            │                          │
│ Input jawaban                  │                          │
│ FeedbackBox                    │                          │
├───────────────────────────────┴──────────────────────────┤
│ [‹ Kembali]                    [ Cek jawaban ]   [Petunjuk]│
└──────────────────────────────────────────────────────────┘
```

### Varian area langkah

| Jenis langkah | Isi area |
|---|---|
| `info` | ≤ 3 kalimat + opsional satu visual bermakna. |
| `worked_example` | Daftar langkah sebelumnya (redup) + langkah aktif dengan sorotan bagian yang berubah + label tujuan langkah. |
| `completion` | Sama dengan `worked_example`, tetapi satu baris berupa input. |
| `plot_points` | Tabel nilai (atas) + `PointPlotter` (bawah) + penghitung "3 dari 5 titik". |
| `read_point` | Grafik + petunjuk pilih dua titik + input koordinat (sesuai level fading). |
| `numeric` / `linear_model` | Pertanyaan + input terstruktur + tombol "Cek jawaban". |
| `choice` | Pertanyaan + 2–4 opsi (radio besar). |

## S-05 — Langkah Penjelajah Gradien

```
┌────────────────────────────┐
│ U2 · Jelajah   Langkah 2/9 │
├────────────────────────────┤
│   y = 2x + 1               │  ← persamaan diperbarui langsung
│  ┌──────────────────────┐  │
│  │        grid          │  │
│  │      /  (segitiga    │  │
│  │     /    naik/jalan) │  │
│  └──────────────────────┘  │
│  m  ◀──────●──────▶  2     │
│  c  ◀────●────────▶  1     │
│                            │
│  ❓ Apa yang terjadi saat  │
│  m kamu buat negatif?      │
│  ( ) garis naik            │
│  ( ) garis turun           │
│  ( ) garis mendatar        │
├────────────────────────────┤
│ [‹]     [ Cek jawaban ] [?]│
└────────────────────────────┘
```

**Mode dua garis:** dua pasang slider (dapat dilipat per garis), panel status: `m₁ = 2 · m₂ = −½ · m₁×m₂ = −1 → tegak lurus ⟂`.

## S-06 — Langkah Masalah F–E–I

Setiap sub-langkah tampil pada layar terpisah, dengan label proses kecil di atas ("Rumuskan", "Selesaikan", "Tafsirkan").

**Tandai informasi:**
```
┌────────────────────────────┐
│ Rumuskan · Tandai info 1/9 │
├────────────────────────────┤
│ Raka memesan ojek daring … │
│ biaya awal [Rp5.000], lalu │
│ [Rp2.500 untuk setiap km]. │
│ Jarak … [8 km] … [Rp30.000]│
│                            │
│ Ketuk bagian yang penting  │
│ untuk menjawab pertanyaan. │
├────────────────────────────┤
│ [‹]    [ Cek pilihan ]  [?]│
└────────────────────────────┘
```

**Diketahui–Ditanya:** tabel dua bagian dengan baris isian (`label` + `nilai` + `satuan`).

**Model:** `x menyatakan [pilih ▾]`, `y menyatakan [pilih ▾]`, lalu `y = [ ] x + [ ]`.

**Tafsirkan/Evaluasi:** pertanyaan + kotak teks (maks. 300 karakter) + tombol "Simpan jawaban" (tidak dinilai otomatis).

## S-07 — Ringkasan Unit & Refleksi

```
┌────────────────────────────┐
│ U2 selesai                 │
│                            │
│ Jelaskan ke temanmu:       │
│ "Kenapa garis y = −2x + 1  │
│ turun?"                    │
│ [________________________] │
│ [________________________] │
│                            │
│ Seberapa yakin kamu?       │
│ (1) (2) (3) (4)            │
│                            │
│ [ Simpan & lihat pola ]    │
│ Lewati                     │
└────────────────────────────┘
→ kemudian: kartu "Pola langkah U2" (3–5 butir) + [Kembali ke Beranda]
```

## S-08 — Asesmen

- Layar pengantar: tujuan, jumlah masalah, perkiraan waktu, pernyataan "bukan untuk nilai rapor".
- Per butir: sama dengan S-06 **tanpa** tombol petunjuk dan tanpa umpan balik. Indikator "Tersimpan ✓" kecil setelah autosave.
- Navigasi butir: daftar nomor di atas (1 · 2 · 3) untuk berpindah bebas.
- Layar tinjau + tombol "Kirim" dengan konfirmasi.

## S-09 — Panduan Instal

- Deteksi platform; tampilkan langkah sesuai (Android/desktop: tombol instal; iOS: 3 langkah bergambar ikon Bagikan → "Tambahkan ke Layar Utama").

## S-10 — Area Peneliti (desktop-first)

| Tab | Isi |
|---|---|
| Kelas | Tabel kode siswa × unit (status ✓ ◐ ○), jumlah petunjuk, waktu terakhir aktif. |
| Asesmen | Daftar asesmen per kelas dengan sakelar buka/tutup. |
| Ekspor | Pilih kelas + dataset (`attempts`, `step_responses`, `reflections`, `assessment_responses`, `rubric_scores`) → Unduh CSV. |
| Penilaian (Should) | Daftar jawaban uraian acak tanpa kode siswa → formulir skor 0–3 per indikator + catatan. |

## S-11 — Halaman Offline

- Pesan singkat: "Halaman ini belum tersimpan di perangkatmu. Sambungkan internet, atau buka unit yang pernah kamu pelajari." + tombol ke Beranda (yang tersimpan di cache).
