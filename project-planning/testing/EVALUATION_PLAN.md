# Evaluation Plan

> **Dokumen terkait:** [../education/ASSESSMENT_RUBRIC.md](../education/ASSESSMENT_RUBRIC.md) · [../education/INTERVIEW_ANALYSIS.md](../education/INTERVIEW_ANALYSIS.md) · [ACCEPTANCE_TESTING.md](ACCEPTANCE_TESTING.md) · [../development/DEVELOPMENT_ROADMAP.md](../development/DEVELOPMENT_ROADMAP.md)
>
> Evaluasi produk ini adalah bagian dari penelitian pengembangan. **Model pengembangan (ADDIE, 4D, atau lainnya) belum ditetapkan — TBD-04.** Rancangan di bawah dapat dipetakan ke tahap *Evaluate* (ADDIE; Branch, 2009) maupun *Develop* (4D; Thiagarajan dkk., 1974).

---

## 1. Pertanyaan Evaluasi

| Kode | Aspek | Pertanyaan |
|---|---|---|
| EQ-1 | Kelayakan media | Apakah konten dan media dinilai layak oleh ahli materi dan ahli media? |
| EQ-2 | Usability | Seberapa mudah siswa menggunakan aplikasi? |
| EQ-3 | Responsivitas | Apakah aplikasi berfungsi baik di perangkat dan ukuran layar sasaran? |
| EQ-4 | Keterlaksanaan pembelajaran | Apakah siswa dapat menjalankan siklus unit (jelajah → contoh → latihan → masalah F–E–I → refleksi) sesuai rancangan? |
| EQ-5 | Pengalaman siswa | Bagaimana siswa merasakan beban, bantuan, dan tampilan aplikasi? Apakah hipotesis kebutuhan dari wawancara (T1–T5) terkonfirmasi? |
| EQ-6 | Potensi literasi matematika | Bagaimana gambaran proses F–E–I siswa (data proses, rubrik pretes–postes) selama uji coba? |

## 2. Tahapan Evaluasi

| Tahap | Peserta | Tujuan | Keluaran |
|---|---|---|---|
| E1 Validasi ahli | Ahli materi (dosen/guru matematika, jumlah **TBD**, umumnya 2–3); ahli media (dosen TI/pendidikan, **TBD**) | EQ-1 | Skor kelayakan + saran revisi |
| E2 Uji coba perorangan (*one-to-one*) | 2–3 siswa dengan kemampuan beragam (**TBD**) | EQ-2, EQ-4, EQ-5 — temukan masalah besar | Catatan *think-aloud*, daftar masalah, revisi |
| E3 Uji coba kelompok kecil | 6–12 siswa (**TBD**) | EQ-2 s.d. EQ-6 | SUS, angket, data proses, pretes–postes |
| E4 Uji lapangan (opsional/lanjutan) | Satu kelas | Di luar lingkup MVP bila waktu terbatas | — |

## 3. Instrumen

| Aspek | Instrumen | Bentuk | Status |
|---|---|---|---|
| EQ-1 materi | Angket validasi ahli materi: kesesuaian dengan CP/TP, kebenaran konsep, kesesuaian konteks, keterlaksanaan F–E–I, kualitas petunjuk & umpan balik, bahasa | Skala Likert 1–4/1–5 + saran | Disusun (TBD); aspek mengacu dokumen ini |
| EQ-1 media | Angket validasi ahli media: tampilan, navigasi, keterbacaan, responsivitas, interaktivitas, PWA | Skala Likert + saran | Disusun (TBD) |
| EQ-2 | **System Usability Scale (SUS)** (Brooke, 1996), diterjemahkan ke bahasa Indonesia | 10 butir, skala 1–5 | Gunakan terjemahan yang telah divalidasi dalam literatur, bila ada (TBD) |
| EQ-2 | Tugas usability terstruktur (misal: "Masuk, lanjutkan U2, gunakan petunjuk, kirim refleksi") | Keberhasilan tugas, waktu, jumlah bantuan | Disusun dari ACCEPTANCE_TESTING |
| EQ-3 | Daftar periksa responsif & PWA | Ya/Tidak per perangkat | Dari TESTING_STRATEGY §6–7 |
| EQ-4 | Lembar observasi keterlaksanaan per fase unit + log sistem (penyelesaian langkah) | Ceklis + data otomatis | Disusun (TBD) |
| EQ-5 | Angket respons siswa (aspek: kemudahan, kejelasan bahasa, manfaat visual, bantuan, distraksi) + wawancara singkat pasca-uji (pertanyaan paralel dengan wawancara awal K/IL/EL/GL/DS) | Likert + terbuka | Disusun (TBD) |
| EQ-6 | Asesmen pretes–postes + rubrik F–E–I; data proses (petunjuk, kode kesalahan); refleksi | Lihat ASSESSMENT_RUBRIC | Divalidasi ahli (E1) |

> Pengukuran beban kognitif subjektif (misal skala rating usaha mental satu butir dari Paas, 1992) dapat ditambahkan untuk EQ-5 — **TBD** atas persetujuan pembimbing.

## 4. Analisis Data

| Data | Analisis | Kriteria/tafsiran |
|---|---|---|
| Validasi ahli | Persentase skor / rata-rata per aspek, dikonversi ke kategori kelayakan | Kategori & batas **TBD** mengikuti acuan yang disepakati pembimbing |
| SUS | Skor SUS (0–100) per responden, rata-rata | Acuan umum: ±68 sebagai rata-rata; tafsiran kategori adjektif mengacu Bangor dkk. (2009) |
| Tugas usability | Tingkat keberhasilan, waktu, jenis kendala | Deskriptif |
| Observasi & log | Persentase fase yang terlaksana; langkah dengan petunjuk/kesalahan terbanyak | Deskriptif; temuan → revisi konten |
| Angket & wawancara siswa | Statistik deskriptif + analisis tematik | Bandingkan dengan tema T1–T5 dari wawancara awal |
| Pretes–postes | Statistik deskriptif per indikator (F1–I2); bila diinginkan *N-gain* sebagai deskripsi | **Tidak** ditafsirkan sebagai bukti kausal (ASSESSMENT_RUBRIC §7) |
| Refleksi | Analisis kualitatif; kalibrasi keyakinan vs ketepatan | Deskriptif |

## 5. Pemetaan ke Hipotesis Kebutuhan dari Wawancara

| Tema (INTERVIEW_ANALYSIS §7) | Bukti evaluasi yang dicari |
|---|---|
| T1 Jembatan representasi | Ketepatan langkah `read_point`, `plot_points`; pendapat siswa tentang Penjelajah Gradien. |
| T2 Prosedur bertahap | Penyelesaian contoh terbimbing; apakah siswa merasa tempo sesuai. |
| T3 Soal kontekstual | Skor F1/F2/F3; kesulitan pada `identify_info`. |
| T4 Evaluasi diri & umpan balik | Frekuensi `SIGN_FLIP` antarunit; pemakaian cek balik; skor I2. |
| T5 Antarmuka bersih | Butir angket distraksi; komentar SUS/wawancara. |

## 6. Etika dan Prosedur

1. Izin sekolah dan persetujuan orang tua/wali + *assent* siswa sebelum uji coba.
2. Siswa boleh berhenti kapan saja tanpa konsekuensi; hasil tidak memengaruhi nilai sekolah.
3. Data memakai kode pseudonim (SECURITY_AND_PRIVACY).
4. Dokumentasi foto/video hanya dengan izin terpisah; wajah tidak dipublikasikan tanpa izin.

## 7. Siklus Revisi

```
Validasi ahli (E1) ──revisi──> Uji perorangan (E2) ──revisi──> Uji kelompok kecil (E3) ──revisi──> Produk akhir
```

Setiap revisi dicatat di log revisi: temuan → sumber (ahli/siswa/data) → perubahan → dokumen/konten yang diperbarui.

## 8. Batasan Evaluasi

- Jumlah peserta kecil; hasil tidak dapat digeneralisasi.
- Tanpa kelompok pembanding, perubahan pretes–postes tidak dapat dikaitkan secara kausal dengan aplikasi.
- Efek kebaruan (*novelty effect*) dapat memengaruhi respons siswa.
- Instrumen asesmen baru; reliabilitas belum teruji sebelum uji coba.

## 9. Referensi

> Verifikasi detail bibliografis langsung dari sumber sebelum dikutip.

- Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies, 4*(3), 114–123.
- Branch, R. M. (2009). *Instructional Design: The ADDIE Approach*. Springer.
- Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan dkk. (Eds.), *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.
- Paas, F. G. W. C. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology, 84*(4), 429–434.
- Thiagarajan, S., Semmel, D. S., & Semmel, M. I. (1974). *Instructional Development for Training Teachers of Exceptional Children: A Sourcebook*. Indiana University.
