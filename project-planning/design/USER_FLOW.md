# User Flow

> **Dokumen terkait:** [WIREFRAME_SPECIFICATION.md](WIREFRAME_SPECIFICATION.md) · [../USER_STORIES.md](../USER_STORIES.md) · [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md)
>
> Kode layar (S-xx) merujuk ke [WIREFRAME_SPECIFICATION.md](WIREFRAME_SPECIFICATION.md).

---

## 1. Peta Layar

```
                         ┌──────────────┐
                         │ S-01 Masuk   │
                         └──────┬───────┘
                 siswa ┌────────┴────────┐ peneliti
                       ▼                 ▼
               ┌──────────────┐   ┌──────────────────┐
               │ S-02 Beranda │   │ S-10 Area Peneliti│
               └──┬────────┬──┘   └──┬─────┬─────┬───┘
                  │        │         ▼     ▼     ▼
                  │        │      Kelas  Ekspor  Penilaian (Should)
                  ▼        ▼
        ┌──────────────┐ ┌──────────────┐
        │ S-03 Peta    │ │ S-08 Asesmen │
        │ Unit         │ └──────────────┘
        └──────┬───────┘
               ▼
        ┌──────────────────────┐      ┌──────────────────┐
        │ S-04 Pemutar         │─────>│ S-07 Ringkasan   │
        │ Aktivitas            │      │ Unit + Refleksi  │
        │  ├ S-05 Penjelajah   │      └──────────────────┘
        │  └ S-06 Masalah F–E–I│
        └──────────────────────┘
   (S-09 Panduan Instal & S-11 Halaman Offline dapat muncul dari mana saja)
```

## 2. Alur Utama Siswa (Pertama Kali)

```
[Buka URL di Chrome]
      │
      ▼
S-01 Masuk ──(kode/PIN salah)──> pesan generik ──> S-01
      │ berhasil
      ▼
S-02 Beranda ("Mulai belajar")
      │
      ├──(pretes aktif?)── ya ──> S-08 Asesmen Pretes ──kirim──> S-02
      │
      ▼
S-03 Peta Unit ──pilih U1 (disarankan)──> S-04 Pemutar Aktivitas
      │
      ▼
[Siklus unit: Pemantik → Jelajah → Contoh → Coba bersama → Coba sendiri → Masalah F–E–I]
      │
      ▼
S-07 Ringkasan Unit: Jelaskan ke teman + keyakinan + Pola langkah
      │
      ▼
S-02 Beranda (tombol menjadi "Lanjutkan belajar → U2")
      │
      └──(browser menawarkan instal)──> S-09 Panduan Instal (opsional)
```

## 3. Alur Siswa Kembali

```
[Buka ikon aplikasi / URL]
      │
      ├── token masih berlaku ──> S-02 Beranda ──"Lanjutkan belajar"──> S-04 di langkah terakhir
      │
      └── token kedaluwarsa ──> S-01 Masuk ──> S-02
```

## 4. Alur Satu Langkah Latihan (dengan Petunjuk dan Umpan Balik)

```
Langkah tampil
   │
   ├──[Petunjuk]──> Level 1 ──[lagi]──> Level 2 ──[lagi]──> Level 3 (langkah contoh, bukan jawaban)
   │                 (dicatat hint_level_max)
   ▼
Siswa menjawab ──[Cek jawaban]──> Pemeriksaan (klien)
   │
   ├── benar ──> FeedbackBox "Tepat + makna" ──[Lanjut]──> langkah berikutnya
   │
   └── salah ──> pola dikenali? ── ya ──> pesan spesifik (SIGN_FLIP, dst.)
                        │                     │
                        └── tidak ──> pesan umum
                                              │
                        percobaan ke-2 salah ──> tawarkan Petunjuk level 1
                        percobaan ke-3 salah ──> tombol "Lihat pembahasan" muncul
                                                    └──> pembahasan ──> [Lanjut] (dicatat revealed=true)
```

Setiap jawaban dikirim ke server (`POST /attempts/{id}/responses`). Bila offline: MVP mencatat draf lokal saja; dengan F-19 masuk antrean sinkronisasi.

## 5. Alur Masalah Kontekstual F–E–I

```
Situasi ──> Tandai informasi ──> Diketahui/Ditanya ──> Definisikan x, y ──> Model y = [m]x + [c]
  (F)          (F1)                  (F2)                    (F3)                (F3)
                                                                                   │
           ┌───────────────────────────────────────────────────────────────────────┘
           ▼
        Hitung ──> Cek balik (substitusi) ──> Tafsirkan ──> Evaluasi kewajaran
         (E2)            (I2)                    (I1)           (I2)
```

## 6. Alur Asesmen

```
S-02 Beranda ──[Asesmen]──> Pengantar (jumlah masalah, perkiraan waktu, "tidak ada nilai rapor")
      │
      ▼
Butir 1 … n  (autosave per butir; navigasi bebas antarbutir; tanpa petunjuk & umpan balik)
      │
      ▼
Tinjau jawaban ──[Kirim]──> konfirmasi "Jawaban tidak bisa diubah lagi" ──> Terima kasih ──> S-02
      │
      └── koneksi terputus ──> pesan "Sambungkan internet untuk melanjutkan"; jawaban terakhir tetap aman di server
```

## 7. Alur Peneliti

```
S-01 Masuk (peran peneliti)
   │
   ▼
S-10 Area Peneliti
   ├── Kelas: lihat daftar kelas → progres per unit (agregat per kode siswa)
   ├── Asesmen: aktifkan/nonaktifkan pretes/postes per kelas
   ├── Ekspor: pilih kelas + dataset → unduh CSV
   └── Penilaian (Should): daftar jawaban uraian (buta) → skor 0–3 per indikator + catatan → simpan
```

Pembuatan akun siswa dilakukan lewat skrip CLI di backend (bukan antarmuka) pada MVP.

## 8. Alur Instalasi PWA

| Platform | Alur |
|---|---|
| Chrome Android | Browser menampilkan prompt/ikon instal → aplikasi menangkap `beforeinstallprompt` → tombol "Pasang aplikasi" di Beranda (sekunder) → dialog sistem → ikon di layar utama. |
| Chrome/Edge desktop | Ikon instal di bilah alamat atau tombol "Pasang aplikasi". |
| Safari iOS | Tidak ada prompt otomatis → S-09 menampilkan panduan: Bagikan → "Tambahkan ke Layar Utama". |

## 9. Alur Offline

```
Koneksi hilang
   │
   ├── OfflineBanner muncul
   ├── Materi & Penjelajah yang sudah di-cache tetap berjalan
   ├── Latihan: pemeriksaan jawaban tetap jalan (klien); pencatatan ke server tertunda
   ├── Asesmen & ekspor: dinonaktifkan dengan pesan
   └── Halaman yang belum pernah dimuat ──> S-11 Halaman Offline
Koneksi kembali ──> banner hilang ──> (F-19) antrean dikirim
```
