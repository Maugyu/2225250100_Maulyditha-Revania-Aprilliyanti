# Pedagogical Framework

> **Dokumen terkait:** [INTERVIEW_ANALYSIS.md](INTERVIEW_ANALYSIS.md) · [LEARNING_DESIGN.md](LEARNING_DESIGN.md) · [ASSESSMENT_RUBRIC.md](ASSESSMENT_RUBRIC.md) · [../PRD.md](../PRD.md)
>
> Dokumen ini menjelaskan landasan teoretis aplikasi dan **mengapa** setiap prinsip dipilih. Prinsip yang tidak memiliki dasar kebutuhan dari wawancara tidak diterapkan secara otomatis.

---

## 1. Literasi Matematika

### 1.1 Definisi kerja

Kerangka PISA 2022 mendefinisikan literasi matematika sebagai kapasitas individu untuk bernalar secara matematis serta merumuskan, menggunakan, dan menafsirkan matematika untuk memecahkan masalah dalam beragam konteks dunia nyata, termasuk konsep, prosedur, fakta, dan alat untuk mendeskripsikan, menjelaskan, dan memprediksi fenomena (OECD, 2023).

Untuk proyek ini, definisi kerja yang dipakai:

> **Literasi matematika** adalah kemampuan siswa untuk (1) mengenali dan merumuskan situasi sehari-hari sebagai masalah matematika, (2) menggunakan konsep dan prosedur matematika secara tepat, serta (3) menafsirkan dan menilai kewajaran hasilnya dalam situasi semula — dengan penalaran matematis sebagai inti ketiganya.

### 1.2 Kerangka PISA yang digunakan

| Komponen PISA | Penerapan di aplikasi |
|---|---|
| **Penalaran matematis** (*mathematical reasoning*) | Ditempatkan sebagai inti; muncul pada pertanyaan "mengapa" di setiap unit dan pada langkah evaluasi. |
| **Formulate** — merumuskan situasi secara matematis | Langkah tandai informasi, Diketahui–Ditanya, mendefinisikan variabel, menyusun model $y = mx + c$. |
| **Employ** — menggunakan konsep, fakta, prosedur, dan penalaran | Menghitung gradien, menyusun persamaan, mencari titik potong, cek balik. |
| **Interpret & Evaluate** — menafsirkan dan mengevaluasi | Menjelaskan arti $m$, $c$, dan hasil dalam konteks; menilai kewajaran & batasan model. |
| **Kategori konten** | MVP berfokus pada **Perubahan dan Hubungan** (*change and relationships*) melalui PGL. Kategori lain (Kuantitas, Ruang dan Bentuk, Ketidakpastian dan Data) dipetakan untuk pengembangan lanjutan di [MATHEMATICS_CONTENT_MAP.md](MATHEMATICS_CONTENT_MAP.md). |
| **Konteks** | Personal, Pekerjaan (*occupational*), Sosial (*societal*), Ilmiah (*scientific*). MVP memprioritaskan konteks personal dan sosial yang dekat dengan siswa SMP. |

### 1.3 Mengapa PGL cocok untuk literasi matematika

PGL adalah model paling sederhana dari hubungan dua besaran yang berubah secara konstan (misal tarif per kilometer, tabungan mingguan). Konsep **gradien sebagai laju perubahan** dan **konstanta sebagai nilai awal** dapat langsung ditafsirkan dalam konteks — sehingga ketiga proses F–E–I dapat dilatih tanpa menambah konsep baru di luar kurikulum.

Temuan K03 (rumus sudah dikuasai) dan IL04/EL05 (kesulitan pada soal cerita) menunjukkan bahwa yang dibutuhkan bukan rumus baru, melainkan **jembatan dari rumus ke situasi**.

---

## 2. Cognitive Load Theory (CLT)

### 2.1 Ringkasan teori

CLT berangkat dari arsitektur kognitif manusia: memori kerja terbatas kapasitas dan durasinya saat memproses informasi baru, sementara memori jangka panjang menyimpan skema yang dapat mengurangi beban memori kerja (Sweller, 1988; Sweller dkk., 1998, 2019).

| Jenis beban | Pengertian | Strategi umum |
|---|---|---|
| **Intrinsik (ICL)** | Bersumber dari kompleksitas materi, khususnya interaktivitas elemen, relatif terhadap pengetahuan awal siswa. | Dikelola: urutan sederhana → kompleks, segmenting, prasyarat. |
| **Ekstraneous (ECL)** | Bersumber dari cara penyajian yang tidak membantu belajar. | Dikurangi: coherence, signaling, hindari informasi transien dan teks berlebih. |
| **Germane (GCL)** | Sumber daya memori kerja yang dicurahkan untuk menangani beban intrinsik/membangun skema. | Dialokasikan: aktivitas konstruksi, penjelasan diri, variasi konteks. |

> Catatan teoretis: dalam rumusan CLT yang lebih baru (Sweller dkk., 2019), beban germane dipandang sebagai alokasi sumber daya memori kerja untuk beban intrinsik, bukan jenis beban ketiga yang berdiri sendiri. Dokumen ini tetap memakai label GL sesuai pengodean wawancara, dengan pemahaman tersebut.

### 2.2 Efek *expertise reversal*

Bantuan yang efektif untuk pemula dapat menjadi beban tambahan bagi siswa yang lebih mahir (Kalyuga dkk., 2003). Karena itu, bantuan di aplikasi **dikurangi bertahap** (fading) dan **petunjuk bersifat opsional**, bukan ditampilkan sekaligus.

---

## 3. Prinsip Desain yang Dipilih

Prinsip dipilih berdasarkan temuan wawancara. Kolom "Status" menunjukkan apakah prinsip diterapkan.

| Prinsip | Status | Dasar temuan | Bentuk penerapan |
|---|---|---|---|
| **Segmenting** — materi dipecah menjadi bagian yang dikendalikan siswa (Mayer, 2020) | ✅ Diterapkan | IL02, EL04, DS02 | Satu langkah per layar; tombol "Lanjut" oleh siswa. |
| **Signaling** — penanda elemen penting (Mayer, 2020) | ✅ Diterapkan | EL04, EL05 | Sorotan bagian persamaan yang berubah; penandaan informasi penting dalam soal. |
| **Coherence** — buang materi yang tidak relevan (Mayer, 2020; Rey, 2012) | ✅ Diterapkan | EL03, DS03 | Tanpa dekorasi, iklan, atau animasi yang tidak membawa informasi. |
| **Worked examples** dan **completion problems** (Sweller dkk., 1998; Renkl & Atkinson, 2003) | ✅ Diterapkan | IL02, GL03, GL05 | Contoh penuh → contoh sebagian → soal mandiri. |
| **Gradual Release of Responsibility** (Pearson & Gallagher, 1983) | ✅ Diterapkan | GL03 | Pola "Saya lakukan → Kita lakukan → Kamu lakukan" di setiap unit. |
| **Scaffolding** (Wood dkk., 1976) | ✅ Diterapkan | GL03, EL05 | Petunjuk 3 level; tabel Diketahui–Ditanya; grid dengan snap. |
| **Progressive disclosure** | ✅ Diterapkan | DS03, EL05 | Petunjuk, glosarium, dan pembahasan hanya muncul atas permintaan. |
| **Multiple representations / dynamic linking** | ✅ Diterapkan | DS01, IL01, GL01 | Grafik, persamaan, dan tabel diperbarui bersamaan. |
| **Self-explanation / learning by teaching** (Chi dkk., 1994; Fiorella & Mayer, 2013) | ✅ Diterapkan | GL04 | Prompt "Jelaskan ke temanmu". |
| **Modality** — kata disampaikan sebagai narasi audio, bukan teks (Mayer, 2020) | ❌ Tidak diterapkan di MVP | Tidak ada data preferensi audio; perangkat siswa di kelas mungkin tanpa headset; audio bersifat transien (bertentangan dengan EL04). | Dapat dipertimbangkan setelah uji coba. |
| **Pretraining** — kenalkan istilah sebelum materi (Mayer, 2020) | ⚠️ Sebagian | EL01, IL03 | Glosarium inline dan cek prasyarat opsional (U0). |
| **Learner control** penuh atas urutan unit | ⚠️ Terbatas | — | Unit tidak dikunci, tetapi urutan disarankan (TBD-08). Pemula cenderung terbantu oleh urutan terstruktur. |

---

## 4. Pendekatan Pembelajaran

### 4.1 Pilihan: Contextual Teaching and Learning (CTL) dengan struktur terbimbing

**Keputusan:** Aplikasi memakai **pendekatan kontekstual yang terbimbing (guided contextual problem solving)** — masalah kontekstual menjadi titik awal dan tujuan, tetapi siswa dibekali eksplorasi dan contoh terbimbing sebelum memecahkan masalah secara mandiri.

Unsur yang diambil:

| Sumber | Unsur yang diambil | Alasan |
|---|---|---|
| **CTL** (Johnson, 2002) | Konteks kehidupan nyata sebagai jembatan makna; mengaitkan materi dengan pengalaman siswa. | Tujuan literasi matematika; K01 menunjukkan tujuan belajar yang diingat masih prosedural. |
| **Inquiry terbimbing** | Eksplorasi Penjelajah Gradien dengan pertanyaan pengamatan ("Apa yang terjadi bila $m$ negatif?"). | DS01; eksplorasi terbimbing lebih aman bagi pemula dibanding penemuan bebas. |
| **Pemecahan masalah Polya** (Polya, 1945) | Memahami masalah → merencanakan → melaksanakan → memeriksa kembali. Selaras dengan F–E–I. | GL02 (cek balik) sudah menjadi kebiasaan siswa. |
| **Realistic Mathematics Education (RME)** (Gravemeijer, 1994) | Konteks sebagai titik awal matematisasi (opsional sebagai rujukan tambahan). | Sejalan dengan proses *formulate*; populer di pendidikan matematika Indonesia. |

### 4.2 Mengapa bukan PBL murni

Problem-Based Learning murni menempatkan masalah kompleks di awal dengan bimbingan minimal. Untuk siswa yang mengalami beban intrinsik tinggi (IL01, IL02, IL04), penyajian masalah kompleks tanpa contoh terbimbing berisiko membebani memori kerja (Kirschner dkk., 2006). Di sisi lain, PBL umumnya dirancang untuk kerja kelompok dan fasilitasi guru (Hmelo-Silver, 2004), yang tidak dapat difasilitasi penuh oleh aplikasi mandiri.

Karena itu, **unsur PBL hanya dipakai di unit proyek (U6)** — setelah siswa memiliki prasyarat dari U1–U5.

---

## 5. Scaffolding

### 5.1 Jenis scaffolding

| Jenis | Bentuk di aplikasi | Fading |
|---|---|---|
| **Prosedural** | Label langkah, struktur F–E–I tetap. | Di U6, label langkah disingkat menjadi tiga tahap F–E–I saja. |
| **Konseptual** | Glosarium inline, pertanyaan pemantik. | Tetap tersedia (atas permintaan). |
| **Representasional** | Snap-to-grid, sorotan titik, segitiga naik/jalan. | Sorotan titik dihilangkan bertahap (F-06 level 1→3). |
| **Strategis** | Petunjuk level 2. | Opsional. |
| **Metakognitif** | Cek balik, evaluasi kewajaran, refleksi. | Tetap; menjadi kebiasaan. |

### 5.2 Pola rilis tanggung jawab per unit

```
Saya lakukan         Kita lakukan              Kamu lakukan
(contoh penuh)  →  (completion problem)  →  (soal mandiri + masalah kontekstual)
   ↑ bantuan tinggi                                   bantuan rendah ↑ petunjuk opsional
```

---

## 6. Prinsip Umpan Balik

Mengacu pada Hattie & Timperley (2007) dan Shute (2008):

1. **Spesifik dan berorientasi tugas** — menyebut jenis kesalahan (katalog di [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md) F-10), bukan sekadar "salah".
2. **Segera pada latihan** — untuk mendukung perbaikan saat itu juga.
3. **Ditunda pada asesmen** — asesmen tidak memberi umpan balik selama pengerjaan agar menangkap kemampuan apa adanya.
4. **Tidak berfokus pada diri siswa** — hindari pujian/kritik personal ("Kamu pintar!"); fokus pada proses ("Langkah cek balikmu tepat").
5. **Elaboratif secukupnya** — maksimal 2 kalimat, sesuai prinsip coherence.

---

## 7. Prinsip Evaluasi

1. **Formatif sebagai data proses** — skor latihan dipakai untuk membantu siswa, bukan menghakimi (Black & Wiliam, 1998).
2. **Penilaian per proses F–E–I** — bukan total benar/salah. Rubrik di [ASSESSMENT_RUBRIC.md](ASSESSMENT_RUBRIC.md).
3. **Triangulasi bukti** — hasil asesmen, data proses (petunjuk, kesalahan), dan refleksi tertulis.
4. **Kehati-hatian klaim** — aplikasi tidak mengklaim meningkatkan literasi matematika sebelum diuji secara empiris dengan desain yang sesuai.

---

## 7b. Rigorous Mathematical Thinking (RMT)

> Sumber: ringkasan bab 1–6 buku Kinard & Kozulin (2008) yang diberikan pemilik proyek. Rujukan langsung ke buku asli tetap diperlukan sebelum dikutip di laporan.

### 7b.1 Inti teori

RMT memadukan dua teori:

| Teori | Gagasan pokok | Arti bagi aplikasi |
|---|---|---|
| **Sosiokultural Vygotsky** | Fungsi mental tinggi berkembang lewat **alat psikologis** (simbol, tabel, garis bilangan, bidang koordinat, rumus, bahasa matematika) yang diinternalisasi; ZPD; konsep sehari-hari → konsep ilmiah; *Learning Activity* (analisis tugas → perencanaan → refleksi). | Penjelajah Gradien, tabel → titik → garis, dan glosarium adalah alat psikologis yang dimanipulasi siswa. Konteks sehari-hari (ojek, tabungan) dijembatani ke konsep ilmiah (gradien = laju perubahan). |
| **Feuerstein (SCM & MLE)** | Kognisi dapat dimodifikasi; **Mediated Learning Experience** dengan kriteria intensionalitas–resiprositas, transendensi, makna; **fungsi kognitif** fase Input–Elaborasi–Output; asesmen dinamis (uji–mediasi–uji ulang). | Petunjuk bertingkat & "Tanya Gari" berperan sebagai mediator; refleksi memuat pertanyaan transendensi; kesalahan dipetakan ke fase kognitif; pretes–intervensi–postes = format *sandwich*, petunjuk bertahap = format *cake*. |

### 7b.2 Pemetaan RMT ke rancangan

| Unsur RMT | Wujud di aplikasi | Status |
|---|---|---|
| Alat psikologis: tabel, bidang koordinat, persamaan | U1 (tabel → titik), Penjelajah Gradien, input $y = [m]x + [c]$ | Sudah ada |
| Bahasa matematika & presisi | Glosarium inline, langkah tafsir/evaluasi, Gari mendorong istilah tepat | Sudah ada / diperkuat |
| LA: Analisis tugas | Tandai informasi + Diketahui–Ditanya | Sudah ada |
| LA: **Perencanaan tindakan** | Langkah **"Rencanakan"** (`plan`) sebelum menghitung di masalah kontekstual U2–U6; mencegah coba-coba | **Baru** |
| LA: Refleksi | "Jelaskan ke temanmu" + tingkat keyakinan | Sudah ada |
| MLE: Intensionalitas & makna | Tujuan unit di Pemantik; Gari menyebut tujuan langkah & alasannya | Diperkuat (instruksi Gari) |
| MLE: **Transendensi** | Pertanyaan "Di mana lagi pola ini bisa dipakai?" di refleksi + ringkasan pola langkah | **Baru** |
| Mediated questioning | Petunjuk level 1–3; "Tanya Gari" bertanya sesuai fase Input/Elaborasi/Output | Diperkuat |
| Fungsi kognitif Input–Elaborasi–Output | **Diagnostik RMT** di Area Peneliti (kode kesalahan → fase) | **Baru** |
| Asesmen dinamis | Pretes–postes (*sandwich*); hasil langkah mandiri/dimediasi/dibuka (*cake*) | **Baru** (laporan) |
| Siklus Representasi–Manipulasi–Validasi | Model (representasi) → hitung/jelajah (manipulasi) → cek balik & evaluasi (validasi) | Sudah ada |

### 7b.3 Hubungan RMT dengan PISA dan CLT

- Fase **Input–Elaborasi–Output** sejalan dengan **Formulate–Employ–Interpret/Evaluate**, tetapi tidak identik: RMT memandang fungsi kognitif, PISA memandang proses pemodelan.
- **Perencanaan** menambah satu langkah (beban intrinsik), tetapi mengurangi coba-coba yang menghabiskan memori kerja; karena itu ditempatkan setelah informasi terkumpul dan sebelum perhitungan.
- **Mediasi manusia tetap utama.** Aplikasi bukan pengganti guru/orang tua sebagai mediator; Gari hanya mediator pendamping (lihat ADR-018 tentang pendampingan orang tua).

## 8. Prinsip Pedagogis yang Tidak Boleh Dilanggar

Prinsip ini juga dicantumkan di [../development/CLAUDE.md](../development/CLAUDE.md) sebagai aturan pengembangan.

| Kode | Prinsip |
|---|---|
| PP-01 | Setiap aktivitas memiliki tujuan literasi (F, E, atau I) yang tertulis di data konten. |
| PP-02 | Satu langkah dan satu aksi utama per layar. |
| PP-03 | Tidak ada elemen visual dekoratif yang tidak membawa informasi matematika. |
| PP-04 | Petunjuk tidak pernah langsung berisi jawaban akhir. |
| PP-05 | Istilah teknis baru selalu memiliki entri glosarium. |
| PP-06 | Transformasi aljabar ditampilkan satu langkah per tampilan dengan sorotan perubahan. |
| PP-07 | Setiap masalah kontekstual memiliki langkah interpretasi dan evaluasi, bukan berhenti pada angka. |
| PP-08 | Teks soal kontekstual ≤ 80 kata; blok penjelas ≤ 3 kalimat. |
| PP-09 | Asesmen tidak memberi umpan balik benar/salah selama dikerjakan. |
| PP-10 | Tidak ada poin, peringkat, atau iklan. |
| PP-11 | Masalah kontekstual U2–U6 memuat langkah **Rencanakan** sebelum perhitungan (RMT — perencanaan tindakan). |
| PP-12 | Refleksi unit memuat pertanyaan **transendensi** (RMT/MLE). |
| PP-13 | Mediasi (petunjuk, Gari) **bertanya dan mengarahkan**, tidak mengambil alih berpikir siswa. |

---

## 9. Referensi

> Referensi di bawah adalah publikasi yang dikenal luas dalam bidangnya. **Penulis wajib memverifikasi** detail (tahun edisi, halaman, DOI) langsung dari sumber aslinya sebelum dikutip dalam laporan. Dokumen ini sengaja tidak mencantumkan DOI untuk menghindari kesalahan pengutipan.

- Black, P., & Wiliam, D. (1998). Assessment and classroom learning. *Assessment in Education: Principles, Policy & Practice, 5*(1), 7–74.
- Chi, M. T. H., de Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science, 18*(3), 439–477.
- Duval, R. (2006). A cognitive analysis of problems of comprehension in a learning of mathematics. *Educational Studies in Mathematics, 61*(1–2), 103–131.
- Fiorella, L., & Mayer, R. E. (2013). The relative benefits of learning by teaching and teaching expectancy. *Contemporary Educational Psychology, 38*(4), 281–288.
- Gravemeijer, K. (1994). *Developing Realistic Mathematics Education*. CD-β Press / Freudenthal Institute.
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112.
- Hmelo-Silver, C. E. (2004). Problem-based learning: What and how do students learn? *Educational Psychology Review, 16*(3), 235–266.
- Johnson, E. B. (2002). *Contextual Teaching and Learning: What It Is and Why It's Here to Stay*. Corwin Press.
- Feuerstein, R., Rand, Y., Hoffman, M. B., & Miller, R. (1980). *Instrumental Enrichment: An Intervention Program for Cognitive Modifiability*. University Park Press.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.
- Kinard, J. T., & Kozulin, A. (2008). *Rigorous Mathematical Thinking: Conceptual Formation in the Mathematics Classroom*. Cambridge University Press.
- Kirschner, P. A., Sweller, J., & Clark, R. E. (2006). Why minimal guidance during instruction does not work. *Educational Psychologist, 41*(2), 75–86.
- Kozulin, A. (1998). *Psychological Tools: A Sociocultural Approach to Education*. Harvard University Press.
- Leinhardt, G., Zaslavsky, O., & Stein, M. K. (1990). Functions, graphs, and graphing: Tasks, learning, and teaching. *Review of Educational Research, 60*(1), 1–64.
- Mayer, R. E. (2020). *Multimedia Learning* (3rd ed.). Cambridge University Press.
- OECD. (2019). *PISA 2018 Assessment and Analytical Framework*. OECD Publishing.
- OECD. (2023). *PISA 2022 Assessment and Analytical Framework*. OECD Publishing.
- Pearson, P. D., & Gallagher, M. C. (1983). The instruction of reading comprehension. *Contemporary Educational Psychology, 8*(3), 317–344.
- Polya, G. (1945). *How to Solve It*. Princeton University Press.
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition: A cognitive load perspective. *Educational Psychologist, 38*(1), 15–22.
- Rey, G. D. (2012). A review of research and a meta-analysis of the seductive detail effect. *Educational Research Review, 7*(3), 216–237.
- Shute, V. J. (2008). Focus on formative feedback. *Review of Educational Research, 78*(1), 153–189.
- Stacey, K., & Turner, R. (Eds.). (2015). *Assessing Mathematical Literacy: The PISA Experience*. Springer.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.
- Sweller, J., Ayres, P., & Kalyuga, S. (2011). *Cognitive Load Theory*. Springer.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251–296.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*(2), 261–292.
- Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*. Harvard University Press.
- Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.
