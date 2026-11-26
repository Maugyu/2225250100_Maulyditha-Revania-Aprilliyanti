# Assessment Rubric

> **Dokumen terkait:** [PEDAGOGICAL_FRAMEWORK.md](PEDAGOGICAL_FRAMEWORK.md) §7 · [MATHEMATICS_CONTENT_MAP.md](MATHEMATICS_CONTENT_MAP.md) · [../technical/DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md) · [../testing/EVALUATION_PLAN.md](../testing/EVALUATION_PLAN.md)

---

## 1. Tujuan Sistem Penilaian

1. Memberi informasi formatif kepada siswa selama latihan.
2. Mengumpulkan **bukti proses** literasi matematika (F–E–I) untuk penelitian.
3. Menyediakan data pretes–postes yang dinilai dengan rubrik analitik.

Sistem penilaian **tidak** dimaksudkan untuk menilai rapor siswa.

## 2. Tiga Jenis Data yang Harus Dibedakan

| Jenis | Definisi | Sumber di aplikasi | Dipakai untuk | Tidak boleh dipakai untuk |
|---|---|---|---|---|
| **Skor latihan** | Ketepatan jawaban pada langkah latihan (dengan petunjuk dan umpan balik tersedia). | `step_responses` dalam `attempts` | Umpan balik ke siswa; status progres; melihat langkah yang sulit. | Menyimpulkan kemampuan literasi, karena dipengaruhi petunjuk & percobaan ulang. |
| **Hasil evaluasi** | Skor rubrik pada asesmen pretes/postes tanpa bantuan. | `assessment_submissions`, `item_responses`, `rubric_scores` | Gambaran kemampuan pada titik waktu tertentu (deskriptif). | Klaim kausal "aplikasi meningkatkan literasi" tanpa desain penelitian yang sesuai. |
| **Bukti kemampuan literasi** | Kumpulan artefak proses: penandaan informasi, model yang dirumuskan, cek balik, tafsiran, evaluasi, penjelasan, refleksi. | Langkah F–E–I di masalah kontekstual + `reflections` | Analisis kualitatif perkembangan proses berpikir (portofolio). | Diubah menjadi satu angka tunggal tanpa konteks. |

## 3. Indikator Literasi Matematika

| Kode | Indikator | Proses PISA | Deskripsi operasional | Bukti di aplikasi |
|---|---|---|---|---|
| F1 | Memahami informasi | Formulate | Mengenali informasi relevan dan mengabaikan yang tidak relevan. | Langkah `identify_info` |
| F2 | Mengidentifikasi masalah | Formulate | Menyatakan apa yang diketahui dan ditanyakan dengan tepat. | Langkah `known_asked` |
| F3 | Merumuskan model matematika | Formulate | Mendefinisikan variabel dan menyusun model linear yang sesuai situasi. | `define_variables`, `linear_model` |
| E1 | Memilih strategi | Employ | Memilih cara penyelesaian yang sesuai (rumus gradien, tabel, grafik, substitusi). | `choice` strategi, jawaban terbuka |
| E2 | Menggunakan konsep & prosedur | Employ | Melakukan perhitungan dan prosedur dengan benar. | `numeric`, `linear_model` |
| E3 | Melakukan penalaran | Employ (Reasoning) | Memberi alasan matematis yang logis (misal mengapa garis tegak lurus). | `explain`, butir esai |
| I1 | Menginterpretasikan hasil | Interpret | Menjelaskan arti hasil/parameter dalam konteks dengan satuan yang tepat. | `interpret` |
| I2 | Mengevaluasi jawaban dalam konteks | Evaluate | Menilai kewajaran hasil, batas berlaku model, dan memverifikasi (cek balik). | `check_back`, `evaluate` |

## 4. Rubrik Analitik (Skor 0–3 per Indikator)

| Kode | 0 — Belum tampak | 1 — Mulai berkembang | 2 — Berkembang | 3 — Mahir |
|---|---|---|---|---|
| **F1** | Tidak menandai/menandai sebagian besar informasi yang tidak relevan. | Menandai sebagian informasi penting; ada informasi tidak relevan. | Menandai semua informasi penting; ada ≤ 1 informasi tidak relevan. | Menandai semua informasi penting dan hanya yang relevan. |
| **F2** | Diketahui/Ditanya kosong atau keliru. | Diketahui sebagian benar; Ditanya keliru atau tidak lengkap. | Diketahui & Ditanya benar dengan sedikit ketidaktepatan (misal tanpa satuan). | Diketahui & Ditanya lengkap, tepat, dengan satuan. |
| **F3** | Tidak menyusun model / model tidak berkaitan. | Variabel didefinisikan, tetapi model salah (misal $m$ dan $c$ tertukar). | Model benar, definisi variabel kurang lengkap (tanpa satuan). | Variabel terdefinisi dengan satuan dan model benar. |
| **E1** | Tidak ada strategi yang tampak. | Strategi kurang sesuai, tetapi ada upaya. | Strategi sesuai, tetapi tidak efisien/kurang lengkap. | Strategi sesuai dan efisien, dapat disebutkan alasannya. |
| **E2** | Prosedur/perhitungan salah total. | Prosedur benar sebagian; kesalahan konsep. | Prosedur benar; ada kesalahan hitung kecil (misal tanda). | Prosedur dan perhitungan benar. |
| **E3** | Tidak ada alasan atau alasan tidak matematis. | Alasan berupa pengulangan prosedur tanpa penjelasan "mengapa". | Alasan matematis benar tetapi tidak lengkap. | Alasan matematis benar, runtut, dan lengkap. |
| **I1** | Tidak menafsirkan / tafsiran salah. | Menyebut angka tanpa makna konteks. | Menafsirkan dalam konteks, satuan/arah kurang tepat. | Tafsiran tepat dalam konteks, dengan satuan dan arah perubahan. |
| **I2** | Tidak mengevaluasi. | Menyatakan "masuk akal/tidak" tanpa alasan. | Mengevaluasi dengan alasan, belum mempertimbangkan batas model. | Mengevaluasi dengan alasan dan menyebut batas berlaku model atau memverifikasi. |

### 4.1 Contoh penerapan (masalah tarif ojek U3)

| Indikator | Jawaban siswa (contoh hipotetis) | Skor | Alasan |
|---|---|---|---|
| I1 | "2.500 itu biayanya." | 1 | Angka disebut tanpa makna "per km". |
| I1 | "Tiap 1 km biayanya nambah Rp2.500." | 3 | Makna, satuan, dan arah perubahan tepat. |
| I2 | "Cukup." | 1 | Tanpa alasan. |
| I2 | "Cukup, karena 8 km = Rp25.000 < Rp30.000. Tapi kalau rutenya jadi lebih jauh bisa nggak cukup." | 3 | Alasan + mempertimbangkan batas situasi. |

## 5. Rancangan Asesmen Pretes–Postes

| Aspek | Rancangan |
|---|---|
| Bentuk | 2 paket paralel (A = pretes, B = postes), masing-masing **3 masalah kontekstual** dengan sub-butir F–E–I. |
| Durasi | ±40 menit (**TBD**, diuji saat uji coba perorangan). |
| Cakupan | Masalah 1: makna $m$ & $c$ (U2–U3). Masalah 2: menyusun persamaan dari data/grafik (U4). Masalah 3: dua garis & keputusan (U5–U6). |
| Jenis sub-butir | Penandaan informasi, isian terstruktur, numerik, pilihan strategi, uraian singkat (tafsiran, evaluasi, alasan). |
| Kesetaraan paket | Struktur matematika sama, konteks & angka berbeda. Kesetaraan dinilai ahli (TBD). |
| Penskoran otomatis | F1 (penandaan), F3 & E2 (isian terstruktur/numerik) diberi skor awal otomatis sesuai aturan; **peneliti dapat mengoreksi**. |
| Penskoran manual | E1, E3, I1, I2 (uraian) dinilai peneliti dengan rubrik §4. |
| Skor maksimum | 8 indikator × 3 poin × 3 masalah = 72 (bila semua indikator muncul di setiap masalah; jumlah final mengikuti kisi-kisi — TBD). |

### 5.1 Aturan skor otomatis awal

| Indikator | Aturan |
|---|---|
| F1 | 3 = semua frasa penting & 0 pengecoh; 2 = semua penting & 1 pengecoh; 1 = ≥ 50% penting; 0 = < 50% penting. |
| F3 | 3 = $m$ & $c$ benar + variabel benar; 2 = model benar, variabel tidak lengkap; 1 = salah satu $m$/$c$ benar; 0 = keduanya salah. |
| E2 | 3 = nilai benar; 2 = nilai benar kecuali tanda (`SIGN_FLIP`); 1 = prosedur terlihat benar tetapi nilai salah (tidak dapat dideteksi otomatis → manual); 0 = salah. |

## 6. Prosedur Penilaian dan Keandalan

1. Jawaban uraian dinilai **buta** (tanpa kode siswa dan tanpa label pretes/postes) bila memungkinkan.
2. Minimal 20% jawaban dinilai ulang oleh penilai kedua (dosen/rekan) — **TBD**. Kesepakatan antarpenilai dilaporkan (misal persentase kesepakatan atau Cohen's kappa).
3. Rubrik diuji coba pada 3–5 jawaban contoh sebelum penilaian penuh; deskriptor direvisi bila ambigu.
4. Instrumen (kisi-kisi, butir, rubrik) divalidasi oleh ahli materi sebelum dipakai (lihat [../testing/EVALUATION_PLAN.md](../testing/EVALUATION_PLAN.md)).

## 7. Batasan Klaim

- Data dari uji coba terbatas hanya boleh disajikan secara **deskriptif** (misal: "skor rata-rata indikator I2 pada postes lebih tinggi daripada pretes pada kelompok uji coba").
- Pernyataan seperti "aplikasi **terbukti** meningkatkan literasi matematika" **tidak boleh** dibuat tanpa desain penelitian yang sesuai (misal kelompok pembanding, sampel memadai, instrumen tervalidasi dan reliabel).
- Kenaikan skor dapat dipengaruhi faktor lain (efek pretes, pembelajaran di kelas, motivasi uji coba). Hal ini dicatat sebagai keterbatasan.

## 7b. Diagnostik RMT (Data Proses)

Selain rubrik, Area Peneliti menyajikan **Diagnostik RMT** dari data latihan:

| Fase kognitif (Feuerstein) | Kode kesalahan yang dipetakan |
|---|---|
| Input — mengumpulkan informasi | `MISSED_INFO`, `IRRELEVANT_SELECTED`, `XY_SWAP`, `NOT_ON_LINE` |
| Elaborasi — mengolah & merelasikan | `M_C_SWAP`, `ORDER_MISMATCH`, `RECIPROCAL`, `PLAN_ORDER` |
| Output — presisi ekspresi | `SIGN_FLIP`, `ARITH`, `EXTRA_POINT` |

Asesmen dinamis per langkah bernilai: **mandiri** (benar tanpa petunjuk), **dimediasi** (benar setelah petunjuk/mediasi), **dibuka** (pembahasan dibuka) — gambaran *potensi belajar* (Feuerstein; ZPD Vygotsky).

> Batasan: pemetaan kode → fase adalah hipotesis kerja peneliti dan **belum divalidasi**. Gunakan untuk memilih siswa yang perlu diobservasi/diwawancarai, bukan untuk menyimpulkan kemampuan individu.

## 8. Cara Aplikasi Mengumpulkan Bukti Perkembangan

| Bukti | Data tersimpan | Analisis yang mungkin |
|---|---|---|
| Penandaan informasi | Frasa yang dipilih per percobaan | Ketepatan F1 dari U1 ke U6 |
| Model yang dirumuskan | Nilai $m$, $c$, definisi variabel | Pola kesalahan `M_C_SWAP` berkurang/tidak |
| Penggunaan petunjuk | `hint_level_max` per langkah | Kebutuhan bantuan menurun seiring unit? |
| Pola kesalahan | `feedback_code` per respons | Frekuensi `SIGN_FLIP` per unit |
| Tafsiran & evaluasi | Teks jawaban | Analisis kualitatif + skor rubrik I1/I2 |
| Penjelasan & refleksi | Teks + tingkat keyakinan 1–4 | Kesesuaian keyakinan dengan ketepatan (kalibrasi) |
| Pretes–postes | Skor rubrik per indikator | Perbandingan deskriptif per indikator |
