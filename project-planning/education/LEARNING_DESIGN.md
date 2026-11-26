# Learning Design

> **Dokumen terkait:** [PEDAGOGICAL_FRAMEWORK.md](PEDAGOGICAL_FRAMEWORK.md) · [MATHEMATICS_CONTENT_MAP.md](MATHEMATICS_CONTENT_MAP.md) · [ASSESSMENT_RUBRIC.md](ASSESSMENT_RUBRIC.md) · [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md)
>
> Semua angka dalam konteks soal (tarif, harga, jarak) adalah **angka ilustratif** untuk keperluan desain, bukan data harga nyata.

---

## 1. Gambaran Pengalaman Belajar

Modul MVP: **"Persamaan Garis Lurus dalam Kehidupan Sehari-hari"**.

Satu modul terdiri atas unit; satu unit terdiri atas beberapa aktivitas; satu aktivitas terdiri atas beberapa langkah (satu langkah = satu layar).

```
Modul PGL
 ├── (Pretes literasi)                       ← F-14
 ├── U0 Cek Prasyarat          [Should]      ← IL03
 ├── U1 Dari Tabel ke Grafik                 ← GL01, EL02
 ├── U2 Gradien sebagai Laju Perubahan       ← DS01, K03
 ├── U3 y = mx + c dan Makna c               ← K03, K01
 ├── U4 Menyusun Persamaan Garis             ← IL01, IL02, IL05, GL02
 ├── U5 Garis Sejajar dan Tegak Lurus        ← IL01, DS02
 ├── U6 Proyek: Membandingkan Dua Tarif      ← IL04, EL05
 └── (Postes literasi)                       ← F-14
```

Estimasi waktu per unit: 20–30 menit (**asumsi**, akan diukur saat uji coba). Total modul ±3–4 jam belajar, dapat dibagi dalam beberapa sesi.

---

## 2. Siklus Belajar Setiap Unit

Setiap unit mengikuti siklus tetap agar siswa membentuk ekspektasi (mengurangi beban navigasi) — lihat GL05 tentang "pola langkah dasar".

| # | Fase | Tujuan | Jenis langkah | Prinsip | Proses literasi |
|---|---|---|---|---|---|
| 1 | **Pemantik** | Situasi singkat + tujuan unit dalam bahasa sehari-hari. | `info` | CTL, R-01 | Formulate (mengenali) |
| 2 | **Jelajah** | Eksplorasi interaktif dengan 2–3 pertanyaan pengamatan. | `explore_*`, `plot_points`, `choice` | Inquiry terbimbing, dynamic linking | Employ / Reasoning |
| 3 | **Contoh** | Contoh terbimbing penuh, langkah demi langkah. | `worked_example` | Worked example, segmenting, signaling | Employ |
| 4 | **Coba bersama** | Completion problem (1–2 langkah kosong). | `completion` | Fading, GRR | Employ |
| 5 | **Coba sendiri** | 2–3 soal mandiri bertingkat; petunjuk opsional. | `numeric`, `linear_model`, `read_point` | Scaffolding opsional | Employ |
| 6 | **Masalah kontekstual** | Satu masalah dengan langkah F–E–I lengkap. | lihat F-08 | Polya, CTL | F → E → I |
| 7 | **Jelaskan & refleksi** | Jelaskan ke teman + tingkat keyakinan + ringkasan pola langkah. | `explain`, `reflection` | Self-explanation | Reasoning, Interpret |

---

### 2.1 Penyesuaian RMT (26 Nov 2026)

Siklus di atas dipetakan ke Learning Activity RMT: **analisis tugas** (Pemantik, tandai informasi, Diketahui–Ditanya) → **perencanaan** (langkah *Rencanakan* di masalah kontekstual U2–U6) → **pelaksanaan** dengan alat psikologis (tabel, grafik, persamaan) → **validasi** (cek balik, evaluasi) → **refleksi + transendensi** ("Di mana lagi pola ini bisa dipakai?"). Lihat [PEDAGOGICAL_FRAMEWORK.md](PEDAGOGICAL_FRAMEWORK.md) §7b.

Contoh langkah *Rencanakan* (U3, ojek). Siswa mengetuk langkah-langkah yang ditampilkan acak sesuai urutan:

1. Tentukan arti $x$ dan $y$
2. Susun model $y = mx + c$
3. Hitung biaya untuk 8 km
4. Bandingkan dengan uang Raka

Bila urutan keliru, umpan balik menyebut posisi pertama yang salah dan bertanya "langkah mana yang harus ada lebih dulu?". Umpan balik itu tidak memberi urutan yang benar.

## 3. Rancangan Per Unit

### U0 — Cek Prasyarat *(Should)*

| Aspek | Isi |
|---|---|
| Tujuan | Siswa mengetahui kesiapan prasyarat: membaca/menempatkan titik Kartesius, operasi bilangan bertanda, operasi pecahan sederhana. |
| Aktivitas | 6 butir singkat (2 per prasyarat). Butir yang salah membuka "penyegar" 1–2 layar. |
| Dasar | IL03, IL05. |
| Catatan | Opsional dan dapat dilewati. Tidak memblokir unit lain. |

### U1 — Dari Tabel ke Grafik

| Aspek | Isi |
|---|---|
| Tujuan belajar | Siswa dapat membuat tabel nilai dari situasi, memplot titik pada bidang Kartesius, dan mengenali bahwa titik-titik membentuk garis lurus. |
| Tujuan literasi | **Formulate**: mengubah situasi menjadi pasangan nilai $(x, y)$. **Interpret**: menjelaskan arti satu titik dalam konteks. |
| Konteks | Tabungan: "Dina sudah punya Rp20.000 dan menabung Rp5.000 setiap minggu." |
| Jelajah | Lengkapi tabel minggu 0–4 → plot di grid (F-06, snap) → garis muncul → "Apa yang kamu perhatikan dari letak titik-titiknya?" |
| Contoh | Dari persamaan $y = 2x + 1$ membuat tabel dan grafik, langkah demi langkah. |
| Coba sendiri | Plot dari tabel yang diberikan; satu tabel dengan nilai negatif (melatih tanda — IL05). |
| Masalah kontekstual | "Titik (6, 50.000) ada di grafik tabungan Dina. Apa artinya?" + "Apakah titik (−1, 15.000) masuk akal dalam situasi ini?" |
| Dasar | GL01, EL02, R-11, R-15. |

### U2 — Gradien sebagai Laju Perubahan

| Aspek | Isi |
|---|---|
| Tujuan belajar | Siswa memahami gradien sebagai perbandingan perubahan $y$ terhadap perubahan $x$, menghitungnya dari dua titik, dan mengenali arti tanda gradien. |
| Tujuan literasi | **Employ**: menghitung $m$. **Interpret**: menafsirkan $m$ sebagai "bertambah/berkurang sekian per satuan". |
| Konteks | Isi tangki air yang berkurang; tarif per km. |
| Jelajah | Penjelajah Gradien (F-05) mode satu garis + segitiga naik/jalan. Pertanyaan: (1) "Apa yang terjadi saat $m$ diperbesar?" (2) "…saat $m$ negatif?" (3) "…saat $m = 0$?" |
| Contoh | Menghitung $m$ dari $(2, 3)$ dan $(4, 7)$: Langkah 1 tulis rumus → Langkah 2 substitusi (sorot angka) → Langkah 3 hitung pembilang & penyebut → Langkah 4 sederhanakan. |
| Coba bersama | Titik $(−1, 4)$ dan $(3, −4)$; langkah 3 dikosongkan (fokus tanda — IL05). |
| Coba sendiri | 3 soal, termasuk satu dengan hasil pecahan dan satu bertanda negatif. |
| Masalah kontekstual | Tangki air: "Pukul 07.00 berisi 120 liter, pukul 10.00 berisi 75 liter. Berapa perubahan per jam? Apa arti tanda negatifnya?" |
| Glosarium | gradien, laju perubahan, sumbu. |
| Dasar | DS01, K03, R-03, R-20. |

### U3 — Persamaan $y = mx + c$ dan Makna $c$

| Aspek | Isi |
|---|---|
| Tujuan belajar | Siswa mengenali $c$ sebagai titik potong sumbu-$y$ / nilai awal, dan menghubungkan $m$, $c$ dengan grafik. |
| Tujuan literasi | **Formulate**: menentukan $m$ dan $c$ dari situasi. **Interpret**: membedakan "nilai awal" dan "nilai per satuan". |
| Konteks | Tarif ojek ilustratif: "Biaya awal Rp5.000 ditambah Rp2.500 per km." |
| Jelajah | Penjelajah: ubah $c$ saja → "Apa yang berubah dan apa yang tetap?" |
| Contoh | Dari situasi tarif ke model $y = 2.500x + 5.000$; label variabel eksplisit. |
| Coba sendiri | Mencocokkan 3 situasi dengan 3 persamaan; menyusun model terstruktur $y = [m]x + [c]$. |
| Masalah kontekstual | Tarif ojek: berapa biaya 8 km? Jika biaya Rp30.000, berapa km? Apakah jarak 0 km dengan biaya Rp5.000 masuk akal? |
| Umpan balik khusus | `M_C_SWAP`. |
| Dasar | K01, K03, R-01, R-03. |

### U4 — Menyusun Persamaan Garis

| Aspek | Isi |
|---|---|
| Tujuan belajar | Siswa menyusun persamaan garis dari (a) dua titik, (b) satu titik dan gradien, (c) grafik; lalu memeriksa dengan substitusi. |
| Tujuan literasi | **Employ**: prosedur multi-langkah. **Evaluate**: cek balik. |
| Jelajah | Mode baca titik (F-06) dengan fading level 1 → 3. |
| Contoh | Dari dua titik: Langkah 1 cari $m$ → Langkah 2 pilih titik $(x_1, y_1)$ → Langkah 3 substitusi ke $y - y_1 = m(x - x_1)$ → Langkah 4 sederhanakan menjadi $y = mx + c$ (satu transformasi per tampilan, sorot perubahan) → Langkah 5 cek balik. |
| Coba bersama | Langkah 4 dikosongkan; lalu langkah 1 & 4 dikosongkan. |
| Coba sendiri | 3 soal: dari dua titik, dari titik + gradien, dari grafik tanpa label koordinat (IL01). |
| Masalah kontekstual | "Biaya cetak 20 lembar Rp7.000, 50 lembar Rp13.000. Tentukan modelnya, arti $m$ dan $c$, dan apakah model ini masuk akal untuk 0 lembar." |
| Umpan balik khusus | `SIGN_FLIP`, `ORDER_MISMATCH`, `XY_SWAP`. |
| Dasar | IL01, IL02, IL05, GL02, GL03, R-05, R-06, R-09, R-14, R-16. |

> **Catatan konten (TBD-09):** Apakah rumus $y - y_1 = m(x - x_1)$ dipakai, atau substitusi langsung ke $y = mx + c$ untuk mencari $c$? Kutipan IL02 ("masukin ke rumus") menunjukkan siswa memakai rumus. Disarankan mengikuti cara di buku paket siswa/guru agar konsisten. Perlu dicek di buku *Berlogika dengan Matematika*.

### U5 — Garis Sejajar dan Tegak Lurus

| Aspek | Isi |
|---|---|
| Tujuan belajar | Siswa memahami bahwa garis sejajar memiliki gradien sama dan garis tegak lurus memiliki hasil kali gradien $-1$; menentukan gradien garis sejajar/tegak lurus. |
| Tujuan literasi | **Reasoning**: menjelaskan mengapa. **Employ**: menentukan gradien. |
| Konteks | Denah jalan pada peta bergrid: jalan baru yang sejajar/tegak lurus dengan jalan lama. |
| Jelajah | Penjelajah dua garis (F-05): (1) Buat dua garis yang tidak pernah bertemu — apa yang sama? (2) Putar garis kedua hingga membentuk sudut siku-siku — perhatikan $m_1 \times m_2$. (3) Coba beberapa pasangan; apa polanya? |
| Contoh | Garis $y = 2x + 1$; gradien garis tegak lurus: Langkah 1 tulis $m_1 = 2$ → Langkah 2 $m_1 \times m_2 = -1$ → Langkah 3 $m_2 = -\frac{1}{2}$ → Langkah 4 visual konfirmasi di grafik. |
| Coba sendiri | 4 soal; termasuk gradien pecahan negatif. |
| Masalah kontekstual | "Jalan A melalui (0, 2) dan (4, 4). Jalan B akan dibangun tegak lurus Jalan A melalui (2, 3). Tentukan persamaan Jalan B dan periksa di grafik." |
| Umpan balik khusus | `RECIPROCAL`, `SIGN_FLIP`. |
| Dasar | IL01, DS02, R-04. |

### U6 — Proyek: Membandingkan Dua Tarif

| Aspek | Isi |
|---|---|
| Tujuan belajar | Siswa memodelkan dua situasi linear, menemukan titik potong (secara grafik dan/atau tabel), dan membuat keputusan berdasarkan konteks. |
| Tujuan literasi | Seluruh F–E–I, dengan penekanan **Interpret & Evaluate** (mengambil keputusan). |
| Konteks | Sewa sepeda: Tempat A Rp10.000 + Rp2.000/jam; Tempat B Rp4.000/jam. "Mana yang lebih hemat untuk 3 jam? 8 jam? Kapan biayanya sama?" |
| Struktur | Scaffolding dikurangi: hanya tiga tahap besar (Rumuskan → Selesaikan → Putuskan). Petunjuk tetap tersedia. |
| Employ | Siswa menggambar kedua garis di Penjelajah kontekstual, membaca titik potong, lalu memverifikasi dengan tabel. |
| Interpret & Evaluate | "Untuk berapa jam Tempat A lebih hemat?", "Faktor apa selain harga yang perlu dipertimbangkan?", "Apakah model berlaku untuk 0,5 jam bila sewa dihitung per jam penuh?" |
| Batas materi | Penyelesaian aljabar titik potong termasuk SPLDV; di MVP diselesaikan **secara grafik dan tabel** agar tetap dalam lingkup PGL (TBD-10: konfirmasi dengan dosen/guru). |
| Dasar | IL04, EL05, R-08, R-12. |

---

## 4. Contoh Lengkap Satu Masalah Kontekstual (U3)

Contoh ini menunjukkan bentuk konkret struktur F–E–I. Data konten JSON-nya ada di [../technical/DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md) §5.

**Situasi (≤ 80 kata):**
> Raka memesan ojek daring untuk pergi ke perpustakaan. Aplikasi menampilkan aturan tarif: biaya awal Rp5.000, lalu Rp2.500 untuk setiap kilometer. Jarak rumah Raka ke perpustakaan 8 km. Raka membawa uang Rp30.000 dan ingin tahu apakah uangnya cukup.

| Langkah | Tampilan | Respons siswa | Bukti literasi |
|---|---|---|---|
| 1 Tandai | Frasa yang dapat ditandai: "biaya awal Rp5.000", "Rp2.500 untuk setiap kilometer", "8 km", "Rp30.000", "perpustakaan". | Menandai 4 frasa penting; "perpustakaan" tidak relevan. | F: memahami informasi |
| 2 Diketahui–Ditanya | Tabel isian. | Diketahui: awal 5.000; per km 2.500; jarak 8; uang 30.000. Ditanya: cukup atau tidak. | F: mengidentifikasi masalah |
| 3 Variabel | "$x$ menyatakan … ; $y$ menyatakan …" | $x$ = jarak (km); $y$ = biaya (Rp). | F: merumuskan |
| 4 Model | $y = [\ ]x + [\ ]$ | $y = 2.500x + 5.000$ | F: merumuskan model |
| 5 Hitung | "Berapa biaya untuk 8 km?" | 25.000 | E: prosedur |
| 6 Cek balik | "Hitung biaya untuk 0 km dengan modelmu. Apakah sama dengan biaya awal?" | 5.000 ✔ | E/Ev: verifikasi |
| 7 Tafsirkan | "Apa arti 2.500 dalam situasi ini?" | "Setiap tambah 1 km, biayanya naik 2.500." | I: menafsirkan |
| 8 Evaluasi | "Apakah uang Raka cukup? Bila jalan macet dan rute menjadi 11 km, apakah masih cukup? Jelaskan." | "Cukup, sisa 5.000. Kalau 11 km jadi 32.500, tidak cukup." | Ev: kewajaran & keputusan |

---

## 5. Strategi Penulisan Konten

| Aturan | Alasan |
|---|---|
| Teks situasi ≤ 80 kata, satu paragraf, kalimat aktif. | EL05 |
| Hanya **satu** informasi pengecoh per soal pada U1–U5; boleh dua di U6. | EL05 — melatih memilah tanpa membanjiri. |
| Angka mudah dihitung (kelipatan 500/1.000) pada soal konteks awal. | Menurunkan ICL aritmetika agar fokus pada pemodelan (IL05). |
| Istilah baru ditandai `[[istilah]]` dan didefinisikan di glosarium. | EL01 |
| Nama tokoh netral & beragam, konteks dekat siswa (sekolah, rumah, transportasi, belanja). | Relevansi konteks. |
| Setiap aktivitas memiliki metadata `literacy_process` dan `indicators`. | Pelacakan bukti (PP-01). |

---

## 6. Peran Guru/Peneliti

- Membagikan kode siswa dan PIN.
- Membuka asesmen pretes/postes pada waktunya.
- (Opsional, TBD-07) Memfasilitasi diskusi kelas setelah U5/U6, misalnya meminta siswa saling menjelaskan (memanfaatkan GL04 di luar aplikasi).
