# Development Roadmap

> **Dokumen terkait:** [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) · [../PRD.md](../PRD.md) · [../testing/EVALUATION_PLAN.md](../testing/EVALUATION_PLAN.md)
>
> Durasi adalah **estimasi** untuk satu pengembang paruh waktu dan harus disesuaikan dengan kalender akademik (TBD). Roadmap disusun agar sejalan dengan model pengembangan penelitian (ADDIE/4D — TBD-04): Analisis → Desain → Pengembangan → Implementasi → Evaluasi.

---

## 1. Ringkasan Fase

| Fase | Nama | Estimasi | Tahap R&D | Keluaran utama | Gerbang keluar |
|---|---|---|---|---|---|
| 0 | Persiapan & keputusan | 1 minggu | Analisis | TBD kritis terjawab; dokumen disetujui pembimbing | TBD-03, 04, 08, 09, 10 diputuskan |
| 1 | Fondasi proyek | 1 minggu | Pengembangan | Repo, kerangka frontend & backend berjalan, CI lint+tes | `GET /health` tampil di frontend lokal |
| 2 | Backend inti | 2 minggu | Pengembangan | Model DB, migrasi, auth, CLI akun, seed konten, API modul/attempt | Tes API lulus |
| 3 | Frontend inti | 2–3 minggu | Pengembangan | Login, Beranda, Peta Unit, Pemutar Aktivitas, renderer langkah dasar | Satu aktivitas contoh dapat diselesaikan end-to-end |
| 4 | Komponen interaktif | 2 minggu | Pengembangan | GraphCanvas, SlopeExplorer (1 & 2 garis), PointPlotter, checkers & umpan balik | Tes unit checker lulus; uji manual sentuh/keyboard |
| 5 | Konten unit U1–U6 | 2–3 minggu (paralel dengan 3–4) | Desain/Pengembangan | JSON konten tervalidasi, glosarium | Telaah konten oleh pemilik/pembimbing |
| 6 | Asesmen, refleksi, peneliti | 1–2 minggu | Pengembangan | Asesmen pretes/postes, refleksi, progres peneliti, ekspor CSV | Skenario ACC-asesmen & ekspor lulus |
| 7 | PWA & offline | 1 minggu | Pengembangan | Manifest, SW, cache, prefetch, banner offline, prompt pembaruan | Daftar periksa PWA lulus |
| 8 | QA & penguatan | 1 minggu | Pengembangan | Tes lintas perangkat, aksesibilitas, keamanan, performa | Seluruh acceptance test Must lulus |
| 9 | Validasi ahli & revisi | 2 minggu | Pengembangan (validasi) | Penilaian ahli materi & media, revisi | Kategori "layak" (instrumen TBD) |
| 10 | Deployment & uji coba | 2–3 minggu | Implementasi | Aplikasi daring HTTPS; uji perorangan → kelompok kecil | Data uji coba terkumpul |
| 11 | Evaluasi & laporan | 2 minggu | Evaluasi | Analisis SUS, respons siswa, data proses, revisi akhir | Laporan evaluasi |

Total estimasi: **±19–23 minggu**. Bila waktu terbatas, gunakan **jalur minimum** di §3.

## 2. Linimasa Visual (perkiraan)

```
Minggu:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21
Fase 0  ██
Fase 1     ██
Fase 2        █████
Fase 3              ████████
Fase 4                    ██████
Fase 5              ████████████
Fase 6                          █████
Fase 7                                ██
Fase 8                                   ██
Fase 9                                      █████
Fase 10                                          ███████
Fase 11                                                 █████
```

## 3. Jalur Minimum (bila waktu terbatas)

Urutan pemotongan lingkup, dari yang pertama dipotong:

1. F-20 Riwayat, F-21 Tema → tunda.
2. F-19 Antrean sinkronisasi → tunda (MVP tetap dengan draf lokal).
3. F-18 Penilaian rubrik di aplikasi → nilai dari CSV di spreadsheet.
4. U0 Cek prasyarat → tunda.
5. U6 Proyek dua tarif → turunkan menjadi satu masalah kontekstual di akhir U5 (**perlu persetujuan pemilik**, TBD).

Yang **tidak boleh** dipotong: F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-12, F-14, F-16 (inti pedagogis dan ketentuan proyek).

## 4. Tonggak (Milestones)

| Kode | Tonggak | Kriteria |
|---|---|---|
| M1 | "Hello stack" | Frontend memanggil backend, tes & lint otomatis berjalan di GitHub Actions. |
| M2 | "Satu langkah" | Siswa login dan menyelesaikan satu aktivitas U2 dengan Penjelajah Gradien; respons tersimpan. |
| M3 | "Satu modul" | U1–U6 dapat diselesaikan; progres benar. |
| M4 | "Siap uji" | Asesmen, ekspor, PWA, QA lulus; deploy di HTTPS. |
| M5 | "Tervalidasi" | Revisi pasca-validasi ahli selesai. |
| M6 | "Terevaluasi" | Uji coba selesai, laporan evaluasi tersusun. |

## 5. Risiko Jadwal

| Risiko | Mitigasi |
|---|---|
| Penulisan konten lebih lama dari kode | Mulai Fase 5 paralel sejak Fase 3; gunakan templat JSON. |
| Izin sekolah tertunda | Ajukan izin sejak Fase 0–2. |
| Komponen grafik lebih rumit dari perkiraan | Mulai dari mode satu garis; mode dua garis setelah M2. |
| Kendala hosting | Uji deployment percobaan sejak Fase 7, bukan di akhir. |
