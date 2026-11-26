# Mathematics Content Map

> **Dokumen terkait:** [LEARNING_DESIGN.md](LEARNING_DESIGN.md) · [ASSESSMENT_RUBRIC.md](ASSESSMENT_RUBRIC.md) · [PEDAGOGICAL_FRAMEWORK.md](PEDAGOGICAL_FRAMEWORK.md)

---

## 1. Acuan Kurikulum

| Aspek | Status |
|---|---|
| Kurikulum acuan | **TBD-03.** Asumsi kerja: Kurikulum Merdeka, **Fase D** (kelas VII–IX), elemen Aljabar. Nomor keputusan dan rumusan Capaian Pembelajaran (CP) terbaru harus dirujuk langsung dari dokumen resmi Kemendikdasmen/BSKAP. |
| Kelas sasaran | VIII (berdasarkan K01 dan buku paket kelas 8; lihat inkonsistensi D-01 di [INTERVIEW_ANALYSIS.md](INTERVIEW_ANALYSIS.md)). |
| Buku acuan siswa | *Berlogika dengan Matematika* kelas 8 (Umi Salamah) — artefak wawancara. Edisi/penerbit perlu dilengkapi (TBD). |
| Kategori konten PISA | Perubahan dan Hubungan (*change and relationships*). |

> Rumusan Tujuan Pembelajaran (TP) di bawah adalah **rumusan kerja** proyek ini, bukan kutipan resmi CP. Penyelarasan dengan CP resmi dilakukan setelah TBD-03 diputuskan.

---

## 2. Peta Konten Modul MVP: Persamaan Garis Lurus

| Unit | Konsep matematika | Tujuan pembelajaran (rumusan kerja) | Konteks kehidupan nyata | Proses literasi utama | Indikator penilaian (kode rubrik) |
|---|---|---|---|---|---|
| U0 | Koordinat Kartesius, bilangan bertanda, pecahan | Siswa menempatkan titik, mengoperasikan bilangan bertanda dan pecahan sederhana. | — (prasyarat) | Employ | E2 |
| U1 | Tabel nilai, grafik garis lurus | Siswa menyusun tabel dari situasi linear dan memplotnya menjadi grafik. | Tabungan mingguan | F → I | F1, F3, I1 |
| U2 | Gradien dari dua titik; tanda gradien | Siswa menghitung gradien dan menafsirkannya sebagai laju perubahan. | Isi tangki air, tarif per km | E → I | E2, I1 |
| U3 | Bentuk $y = mx + c$; makna $m$ dan $c$ | Siswa menentukan $m$ dan $c$ dari situasi dan grafik, serta menafsirkannya. | Tarif ojek daring (ilustratif) | F → E → I | F3, E2, I1, I2 |
| U4 | Persamaan dari dua titik / titik + gradien / grafik | Siswa menyusun persamaan garis dan memeriksanya dengan substitusi. | Biaya fotokopi/cetak | F → E → Ev | F3, E1, E2, I2 |
| U5 | Garis sejajar dan tegak lurus | Siswa menentukan dan menjelaskan hubungan gradien dua garis sejajar/tegak lurus. | Denah jalan pada peta bergrid | E, Reasoning | E2, E3 |
| U6 | Titik potong dua garis (grafik & tabel) | Siswa memodelkan dua situasi linear, menemukan titik potong, dan mengambil keputusan. | Sewa sepeda / paket tarif | F → E → I → Ev | F1–F3, E1–E3, I1–I2 |

### 2.1 Keterkaitan prasyarat

```
Bilangan bertanda ─┐
Pecahan ───────────┼──> U0 ──> U1 (tabel & grafik) ──> U2 (gradien) ──> U3 (y = mx + c)
Kartesius ─────────┘                                                         │
                                                                             ▼
                                                     U5 (sejajar/tegak) <── U4 (menyusun persamaan)
                                                              │
                                                              ▼
                                                      U6 (dua garis dalam konteks) ──> (lanjutan: SPLDV)
```

### 2.2 Miskonsepsi & kesalahan yang diantisipasi

| Kesalahan | Unit | Sumber | Penanganan |
|---|---|---|---|
| Salah tanda saat menghitung $y_2 - y_1$ atau $x_2 - x_1$ | U2, U4 | IL05 (eksplisit) | Umpan balik `SIGN_FLIP`; completion problem fokus tanda. |
| Urutan titik tidak konsisten di pembilang/penyebut | U2, U4 | Literatur/asumsi | `ORDER_MISMATCH`. |
| Gradien tegak lurus = kebalikan saja (tanpa lawan tanda) | U5 | IL01 (kesulitan eksplisit; jenis kesalahan diasumsikan) | `RECIPROCAL` + visual sudut siku. |
| Menukar $x$ dan $y$ saat membaca titik | U1, U4 | Asumsi | `XY_SWAP`. |
| Menukar makna $m$ (per satuan) dan $c$ (nilai awal) | U3, U6 | Asumsi | `M_C_SWAP`. |
| Menerima hasil negatif/tidak masuk akal dalam konteks (misal jarak negatif) | U1–U6 | Asumsi (tujuan literasi) | Langkah evaluasi wajib (PP-07). |

> Kesalahan bertanda "asumsi" tidak berasal dari wawancara; dimasukkan karena relevan secara matematis dan akan diverifikasi dari data proses uji coba.

---

## 3. Bank Konteks Kehidupan Nyata

Konteks dipilih dari kategori yang disarankan, dikaitkan dengan model linear.

| Kategori | Konteks | Model | Unit | Konteks PISA |
|---|---|---|---|---|
| Belanja & uang | Tabungan mingguan | $y = 5.000x + 20.000$ | U1 | Personal |
| Belanja & uang | Biaya cetak per lembar + biaya tetap | $y = 200x + 3.000$ | U4 | Personal |
| Transportasi | Tarif ojek daring (ilustratif) | $y = 2.500x + 5.000$ | U3 | Personal/Sosial |
| Transportasi | Sewa sepeda dua tempat | $y = 2.000x + 10.000$ vs $y = 4.000x$ | U6 | Personal |
| Lingkungan | Air tangki berkurang per jam | $y = -15x + 120$ | U2 | Sosial |
| Pengukuran | Suhu naik terhadap waktu saat memanaskan air | linear dalam rentang terbatas | Cadangan | Ilmiah |
| Bangun & ruang | Denah jalan sejajar/tegak lurus | $m_1 \times m_2 = -1$ | U5 | Sosial |
| Teknologi | Sisa kuota internet per hari | $y = -0,5x + 10$ (GB) | Cadangan | Personal |
| Kesehatan | Langkah kaki harian vs waktu jalan | linear dalam rentang terbatas | Cadangan | Personal |

**Catatan evaluasi model:** konteks seperti suhu, kesehatan, dan kuota hanya linear dalam rentang tertentu. Ini justru dipakai sebagai bahan langkah **Evaluate** ("Apakah model berlaku selamanya?").

---

## 4. Peta Materi SMP untuk Pengembangan Lanjutan (Bukan MVP)

Tabel ini adalah **arah pengembangan**, bukan lingkup MVP. Belum ada data wawancara untuk materi selain PGL.

| Kategori konten PISA | Materi SMP (perkiraan, menunggu TBD-03) | Contoh konteks | Contoh tujuan literasi |
|---|---|---|---|
| Perubahan & Hubungan | Persamaan & pertidaksamaan linear satu variabel | Anggaran jajan | Merumuskan batasan dan menafsirkan himpunan penyelesaian. |
| Perubahan & Hubungan | Relasi & fungsi | Tarif parkir per jam | Membedakan fungsi dan bukan fungsi dari situasi. |
| Perubahan & Hubungan | **SPLDV** (lanjutan langsung U6) | Membandingkan dua paket | Menyelesaikan dan memutuskan berdasarkan titik potong. |
| Kuantitas | Perbandingan senilai & berbalik nilai | Resep, skala peta | Memilih jenis perbandingan yang sesuai situasi. |
| Kuantitas | Aritmetika sosial (diskon, bunga, untung-rugi) | Belanja diskon bertingkat | Mengevaluasi klaim promosi. |
| Ruang & Bentuk | Teorema Pythagoras | Jarak terpendek di denah | Merumuskan situasi sebagai segitiga siku-siku. |
| Ruang & Bentuk | Bangun ruang sisi datar/lengkung | Volume wadah, kemasan | Memilih model bangun ruang & menilai kewajaran hasil. |
| Ketidakpastian & Data | Statistika (rata-rata, median, diagram) | Data tinggi badan kelas | Menafsirkan dan mengkritisi penyajian data. |
| Ketidakpastian & Data | Peluang | Undian, permainan | Mengevaluasi klaim "pasti menang". |

---

## 5. Indikator Penilaian (Ringkas)

Kode indikator dirinci di [ASSESSMENT_RUBRIC.md](ASSESSMENT_RUBRIC.md):

| Kode | Indikator | Proses |
|---|---|---|
| F1 | Memahami informasi | Formulate |
| F2 | Mengidentifikasi masalah | Formulate |
| F3 | Merumuskan model matematika | Formulate |
| E1 | Memilih strategi | Employ |
| E2 | Menggunakan konsep & prosedur | Employ |
| E3 | Melakukan penalaran | Employ (Reasoning) |
| I1 | Menginterpretasikan hasil | Interpret |
| I2 | Mengevaluasi jawaban dalam konteks | Evaluate |
