# Analisis Hasil Wawancara Siswa

> **Status dokumen:** Draf v0.1 · **Fase:** 1 — Analisis Awal
> **Sumber data:** `Laporan Hasil Wawancara.pdf` (8 halaman) di root proyek.
> **Dokumen terkait:** [PEDAGOGICAL_FRAMEWORK.md](PEDAGOGICAL_FRAMEWORK.md) · [LEARNING_DESIGN.md](LEARNING_DESIGN.md) · [../PRD.md](../PRD.md) · [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md)

---

## 1. Tujuan dan Batasan Analisis

Dokumen ini menganalisis satu wawancara siswa sebagai **studi kebutuhan awal (eksploratif)**. Tujuannya adalah merumuskan kebutuhan belajar dan implikasi desain aplikasi, **bukan** menggeneralisasi kondisi seluruh siswa SMP.

Batasan yang harus selalu diingat:

| Batasan | Konsekuensi terhadap penggunaan temuan |
|---|---|
| Hanya **satu** narasumber (S01). | Temuan diperlakukan sebagai *hipotesis kebutuhan* yang perlu dikonfirmasi lewat uji coba (lihat [../testing/EVALUATION_PLAN.md](../testing/EVALUATION_PLAN.md)). |
| Hanya **satu materi**: Persamaan Garis Lurus (PGL). | Implikasi desain paling kuat berlaku untuk modul PGL. Penerapan pada materi lain bersifat dugaan. |
| Daftar pertanyaan wawancara **tidak dilampirkan** — hanya kode pertanyaan (K, IL, EL, GL, DS). | Konteks pertanyaan disimpulkan dari jawaban. Hal ini ditandai sebagai keterbatasan. |
| Wawancara dilakukan daring (dokumentasi berupa tangkapan layar panggilan video), 35 menit, dengan persetujuan rekaman. | Bukti artefak berupa foto buku catatan, buku paket, dan buku berpetak. |
| Pengodean awal (IL/EL/GL) dan catatan interpretasi dibuat oleh pewawancara. | Dokumen ini menelaah ulang pengodean tersebut dan memberi catatan bila ada interpretasi yang perlu ditinjau. |

### 1.1 Inkonsistensi data yang perlu dikonfirmasi (TBD)

| No | Inkonsistensi | Lokasi | Keputusan sementara |
|---|---|---|---|
| D-01 | Bagian identitas menulis "Persamaan Garis Lurus (Dipelajari di **kelas VII**)", sedangkan kutipan K01 menyatakan "**kelas 8** semester 2", dan artefak buku paket adalah buku **kelas 8**. Catatan interpretasi EL01 juga menyebut "SMP kelas VII". | Hal. 1, K01, EL01 | Dokumen perencanaan menganggap PGL dipelajari di **kelas VIII**. **TBD:** pewawancara perlu mengoreksi laporan. |
| D-02 | Daftar pertanyaan wawancara tidak tersedia. | Seluruh tabel | **TBD:** lampirkan protokol wawancara sebagai lampiran laporan penelitian. |

---

## 2. Profil Narasumber (sesuai laporan)

| Aspek | Isi |
|---|---|
| Kode siswa | S01 |
| Kelas saat wawancara | IX |
| Tanggal | Minggu, 08 November 2026 |
| Materi yang dibahas | Persamaan Garis Lurus (lihat D-01) |
| Bukti pernah belajar | Buku tulis berisi catatan materi |
| Artefak pemicu | Buku *Berlogika dengan Matematika* kelas 8 (Umi Salamah) dan buku catatan siswa |
| Durasi | 35 menit, dengan persetujuan narasumber |

> Catatan privasi: identitas siswa disamarkan sebagai S01. Dokumen proyek **tidak** boleh memuat nama asli maupun foto siswa (lihat [../technical/SECURITY_AND_PRIVACY.md](../technical/SECURITY_AND_PRIVACY.md)).

---

## 3. Tiga Lapisan Analisis

Untuk mematuhi prinsip "jangan mencampur data dengan tafsiran", setiap temuan dibedakan menjadi tiga lapisan:

1. **Temuan eksplisit (E)** — apa yang secara langsung dikatakan siswa (parafrase setia kutipan verbatim).
2. **Interpretasi teoretis (T)** — tafsiran berdasarkan Cognitive Load Theory (CLT) dan literatur pendidikan matematika.
3. **Rekomendasi desain (R)** — keputusan desain aplikasi yang diturunkan dari E dan T.

Kode rekomendasi (R-xx) dipakai sebagai rujukan lintas dokumen, misalnya di [../FEATURE_SPECIFICATION.md](../FEATURE_SPECIFICATION.md) dan [../USER_STORIES.md](../USER_STORIES.md).

---

## 4. Analisis per Kode Wawancara

### 4.1 Konteks belajar (K)

| Kode | Temuan eksplisit (E) | Interpretasi teoretis (T) | Rekomendasi (R) |
|---|---|---|---|
| K01 | Pertama belajar PGL di kelas 8 semester 2. Tujuan yang disampaikan guru: membuat grafik dari persamaan dan mencari kemiringan garis (gradien). | Siswa mengingat tujuan pembelajaran pada level prosedural (membuat grafik, mencari gradien). Tidak ada penyebutan tujuan yang terkait konteks kehidupan nyata. | **R-01:** Setiap unit dibuka dengan tujuan belajar singkat yang menyebut *kegunaan* konsep dalam situasi nyata, bukan hanya prosedur. |
| K02 | Guru menjelaskan di papan tulis dengan penggaris panjang untuk membuat sumbu X dan Y; siswa diminta mencatat rumus dari buku paket. | Pembelajaran cenderung ekspositori. Klaim laporan bahwa hal ini "berpotensi meningkatkan *extraneous load*" adalah **dugaan** — siswa tidak menyatakan bahwa cara ini menyulitkan. | **R-02:** Aplikasi melengkapi (bukan menggantikan) pembelajaran kelas dengan aktivitas eksplorasi yang tidak bisa dilakukan di papan tulis, misalnya grafik yang berubah langsung. |
| K03 | Rumus gradien $m = \frac{y_2-y_1}{x_2-x_1}$ dan bentuk $y = mx + c$ langsung dikenali dan "lumayan gampang diinget". | Pengetahuan awal kuat pada **representasi simbolik**. Belum ada bukti tentang pemahaman makna gradien sebagai laju perubahan atau makna $c$ dalam konteks. | **R-03:** Bangun dari rumus yang sudah dikenal menuju *makna* (gradien = laju perubahan; $c$ = nilai awal) melalui konteks dan visual. Jangan mengulang hafalan rumus secara panjang. |

### 4.2 Beban kognitif intrinsik (IL)

| Kode | Temuan eksplisit (E) | Interpretasi teoretis (T) | Rekomendasi (R) |
|---|---|---|---|
| IL01 | Paling pusing pada (a) gradien garis yang tegak lurus dan (b) mencari persamaan garis dari grafik yang tidak menampilkan angka titik dengan jelas. | (a) Hubungan $m_1 \times m_2 = -1$ menuntut pemrosesan dua garis sekaligus → interaktivitas elemen tinggi. (b) Membaca koordinat dari grafik menuntut transisi representasi grafik → simbolik (lihat Leinhardt dkk., 1990; Duval, 2006). | **R-04:** Unit khusus hubungan dua garis dengan visual dua garis yang dapat dimanipulasi. **R-05:** Latihan membaca titik dari grafik dengan bantuan *snap-to-grid* dan penanda titik yang dapat dipilih, diberi fading bertahap hingga tanpa bantuan. |
| IL02 | Menyelesaikan soal persamaan garis harus memikirkan beberapa langkah: cari gradien → tentukan titik $(x_1, y_1)$ → substitusi ke rumus → sederhanakan. | Prosedur multi-langkah yang dipegang bersamaan dalam memori kerja. Bagi pemula, interaktivitas elemen tinggi. Penyajian per langkah (*segmenting*) dan contoh berlatih (*worked example*) relevan. | **R-06:** Contoh terbimbing yang dipecah per langkah dengan label langkah yang konsisten, diikuti *completion problems* (sebagian langkah sudah terisi) yang dikurangi bertahap (*fading*). |
| IL03 | Materi prasyarat yang disebut: operasi aljabar, koordinat Kartesius, hitung pecahan, tanda positif-negatif. | Penguasaan prasyarat yang belum otomatis menambah beban intrinsik saat mengerjakan PGL. Bila prasyarat sudah otomatis, beban berkurang. | **R-07:** Cek prasyarat singkat dan opsional di awal modul, dengan "penyegar" singkat hanya untuk bagian yang belum dikuasai (bukan seluruh materi prasyarat). |
| IL04 | Kesulitan meningkat saat beralih dari soal hitungan biasa ke soal cerita atau soal gabungan dua garis (perpotongan). | Soal cerita menambah langkah *formulate* (mengubah situasi menjadi model matematika). Soal perpotongan menambah jumlah elemen yang berinteraksi. | **R-08:** Urutan kesulitan bertahap: hitungan → konteks sederhana → konteks dua garis. Langkah *formulate* didukung secara eksplisit (lihat R-12). |
| IL05 | Kesalahan biasanya pada perhitungan tanda plus-minus. Rumus hafal, tetapi kurang teliti saat menjalankan hitungan. | Kesalahan eksekusi aritmetika, bukan miskonsepsi rumus. Pengodean sebagai IL dapat dipertanyakan; kesalahan ini juga bisa dilihat sebagai prasyarat (IL03) yang belum otomatis. Tetap bermakna untuk desain umpan balik. | **R-09:** Umpan balik yang mendeteksi pola kesalahan tanda (misalnya jawaban benar nilainya tetapi berlawanan tanda) dan memberi pesan spesifik "periksa tanda", bukan sekadar "salah". |

### 4.3 Beban kognitif ekstraneous (EL)

| Kode | Temuan eksplisit (E) | Interpretasi teoretis (T) | Rekomendasi (R) |
|---|---|---|---|
| EL01 | Penjelasan guru kadang sulit dimengerti; guru sering langsung memakai istilah "tinggi" tanpa menjelaskan maksudnya. | Istilah teknis tanpa penjelasan memaksa siswa memproses bahasa yang belum dipahami → beban ekstraneous. | **R-10:** Istilah teknis selalu disertai penjelasan bahasa sehari-hari yang muncul di tempat (*inline glossary*), tidak di halaman terpisah. |
| EL02 | Masih sangat kesulitan menggambar grafik sendiri. | Laporan mengodekan ini sebagai EL. **Catatan telaah:** kesulitan menggambar grafik bisa juga bersifat intrinsik (keterampilan belum terbentuk). Bagian yang benar-benar ekstraneous adalah beban teknis menggambar presisi (menggaris, mengukur skala), bukan konsepnya. | **R-11:** Aktivitas plot titik di grid digital dengan *snap-to-grid* sehingga siswa fokus pada makna koordinat, bukan ketelitian menggaris. Dikaitkan dengan GL01. |
| EL03 | Pada slide guru atau aplikasi yang gambarnya "rame", siswa malah fokus ke hiasan daripada grafiknya. | Sesuai prinsip *coherence* dan efek *seductive details* (Mayer, 2020; Rey, 2012). **Catatan telaah:** laporan menyebut *split-attention effect*, tetapi efek itu mengacu pada pemisahan informasi yang saling terkait; temuan ini lebih tepat dilabeli *seductive detail / coherence*. | **R-13:** Antarmuka minim dekorasi; tidak ada animasi atau ilustrasi yang tidak membawa informasi matematika. |
| EL04 | Guru terkadang terlalu cepat saat mengubah-ubah bentuk persamaan di papan tulis. | Transient information: langkah transformasi hilang sebelum diproses. Kendali tempo di tangan siswa (*learner pacing*) dan *signaling* perubahan antarlangkah relevan. | **R-14:** Transformasi aljabar ditampilkan satu langkah per tampilan; bagian yang berubah disorot; siswa yang menekan "langkah berikutnya"; langkah sebelumnya tetap terlihat. |
| EL05 | Soal terlalu panjang dan banyak kata, sehingga bingung mana angka penting dan mana yang "cuma cerita". | Beban pemrosesan bahasa sebelum siswa bisa mengekstrak informasi matematis. Ini sekaligus inti proses *formulate* dalam literasi matematika — tidak boleh dihilangkan, tetapi perlu didukung. | **R-12:** Soal kontekstual ditulis ringkas; disediakan aktivitas "tandai informasi penting" dan tabel *Diketahui–Ditanya* yang diisi siswa. Dukungan ini dikurangi bertahap. |

### 4.4 Beban kognitif germane / aktivitas yang membantu (GL)

| Kode | Temuan eksplisit (E) | Interpretasi teoretis (T) | Rekomendasi (R) |
|---|---|---|---|
| GL01 | Paling paham saat diajak menggambar sendiri grafik di kertas berpetak dari tabel titik. | Konstruksi aktif dan hubungan representasi tabel → titik → grafik membantu pembentukan skema. | **R-15:** Alur "tabel → titik → garis" sebagai aktivitas inti unit grafik (bersama R-11). |
| GL02 | Mengecek jawaban dengan memasukkan kembali titik yang diketahui ke persamaan yang diperoleh. | Strategi monitoring diri (metakognitif) yang sudah dimiliki siswa; selaras dengan proses *interpret & evaluate*. | **R-16:** Langkah "Cek balik" (substitusi titik) menjadi bagian tetap pada setiap soal menyusun persamaan, sebelum umpan balik akhir. |
| GL03 | Bantuan berupa langkah-langkah pengerjaan membuat siswa "mikir sendiri tapi nggak macet". | Scaffolding bergradasi (Wood dkk., 1976) menjaga siswa tetap aktif tanpa kebuntuan. | **R-17:** Petunjuk bertingkat (3 level: arahan → strategi → langkah contoh) yang dibuka atas permintaan siswa, bukan ditampilkan sekaligus. |
| GL04 | Mengajari teman membuat siswa sadar bagian yang belum lancar; menjelaskan dengan bahasa sendiri membuat materi "makin nempel". | Efek *learning by teaching* / penjelasan diri (Chi dkk., 1994; Fiorella & Mayer, 2013). | **R-18:** Prompt "Jelaskan dengan bahasamu" di akhir unit (teks singkat), disimpan sebagai bukti refleksi. |
| GL05 | Yang diingat dari berbagai bentuk soal adalah "pola atau langkah dasarnya". | Siswa mulai membentuk skema prosedur yang dapat ditransfer. | **R-19:** Variasi konteks dengan struktur matematika yang sama, dan ringkasan "pola langkah" di akhir unit. |

### 4.5 Kebutuhan desain yang disampaikan siswa (DS)

| Kode | Temuan eksplisit (E) | Interpretasi teoretis (T) | Rekomendasi (R) |
|---|---|---|---|
| DS01 | Ingin visualisasi grafik interaktif: saat nilai $m$ diubah, kemiringan garis langsung berubah *real-time*. | Manipulasi langsung menghubungkan representasi simbolik dan grafik secara simultan (mengurangi pencarian/penggabungan mental). | **R-20:** Komponen *Penjelajah Gradien* dengan slider $m$ dan $c$, grafik dan persamaan diperbarui bersamaan. |
| DS02 | Konsep dasar (cara menentukan gradien dan hubungan dua garis) perlu dijelaskan perlahan dengan visual. | Segmenting dan learner pacing untuk konsep dengan interaktivitas elemen tinggi. | Diperkuat oleh **R-04, R-06, R-14**. |
| DS03 | Jangan banyak tombol yang tidak penting, teks penjelas terlalu panjang seperti buku paket, atau iklan. | Prinsip *coherence* dan minimalisme antarmuka. | **R-21:** Aturan antarmuka: maksimal satu aksi utama per layar, teks penjelas pendek (target ≤ 3 kalimat per blok), tanpa iklan. Diperkuat **R-13**. |

---

## 5. Tabel Analisis Utama

Tabel berikut adalah format ringkas yang diminta. Kolom "Aspek Beban Kognitif" memakai label: **ICL** (intrinsik), **ECL** (ekstraneous), **GCL** (germane).

| Temuan Wawancara | Indikasi Kebutuhan | Aspek Beban Kognitif | Implikasi terhadap Desain Aplikasi |
|---|---|---|---|
| Rumus gradien dan $y = mx + c$ mudah diingat (K03). | Menghubungkan rumus yang sudah dikuasai dengan makna dan konteks. | ICL (skema simbolik sudah ada → dapat dimanfaatkan) | R-03: mulai dari rumus yang dikenal, beralih ke makna gradien sebagai laju perubahan dan $c$ sebagai nilai awal. |
| Pusing pada gradien garis tegak lurus (IL01). | Penjelasan bertahap dan visual tentang hubungan dua garis. | ICL tinggi (dua garis, interaktivitas elemen tinggi) | R-04: unit "Sejajar & Tegak Lurus" dengan dua garis yang dapat diputar/diubah. |
| Sulit mencari persamaan dari grafik tanpa angka titik jelas (IL01). | Latihan membaca koordinat dari grafik. | ICL (transisi representasi) | R-05: grid dengan penanda titik yang dapat dipilih, fading bantuan. |
| Banyak langkah dalam menyusun persamaan garis (IL02). | Dukungan prosedur multi-langkah. | ICL tinggi | R-06: contoh terbimbing per langkah + completion problems + fading. |
| Prasyarat: aljabar, Kartesius, pecahan, tanda (IL03). | Penyegaran prasyarat sesuai kebutuhan. | ICL (prasyarat belum otomatis) | R-07: cek prasyarat singkat & penyegar terarah. |
| Soal cerita dan perpotongan dua garis lebih sulit (IL04). | Urutan kesulitan bertahap dan dukungan merumuskan model. | ICL + ECL | R-08, R-12: progres hitungan → konteks → dua garis; tabel Diketahui–Ditanya. |
| Salah tanda plus-minus walau rumus hafal (IL05). | Umpan balik spesifik pada kesalahan eksekusi. | ICL (eksekusi belum otomatis) | R-09: deteksi pola kesalahan tanda + pesan "periksa tanda". |
| Istilah tinggi tanpa penjelasan (EL01). | Penjelasan istilah dalam bahasa sehari-hari. | ECL | R-10: glosarium inline di tempat istilah muncul. |
| Sulit menggambar grafik sendiri (EL02). | Mengurangi beban teknis menggambar tanpa menghilangkan aktivitas konstruksi. | ECL (teknis) + ICL (keterampilan) | R-11: plot titik digital dengan snap-to-grid. |
| Terdistraksi gambar/hiasan di slide/aplikasi (EL03). | Tampilan bersih dan fokus pada matematika. | ECL | R-13: minim dekorasi; visual hanya yang membawa informasi. |
| Guru terlalu cepat mengubah bentuk persamaan (EL04). | Kendali tempo oleh siswa dan penanda perubahan. | ECL (informasi sementara/transien) | R-14: transformasi satu langkah per tampilan, sorot perubahan, siswa mengatur tempo. |
| Soal terlalu panjang, sulit memilah informasi penting (EL05). | Dukungan memilah informasi dalam soal kontekstual. | ECL (bahasa) — sekaligus inti proses *formulate* | R-12: teks ringkas + aktivitas tandai informasi + tabel Diketahui–Ditanya, di-fading. |
| Paham saat menggambar sendiri dari tabel titik (GL01). | Aktivitas konstruksi representasi. | GCL | R-15: alur tabel → titik → garis. |
| Mengecek jawaban dengan substitusi balik (GL02). | Memperkuat strategi evaluasi diri. | GCL | R-16: langkah "Cek balik" wajib di soal menyusun persamaan. |
| Bantuan langkah-langkah membuat berpikir tanpa macet (GL03). | Scaffolding yang diminta sendiri. | GCL (menjaga beban terkelola) | R-17: petunjuk bertingkat 3 level. |
| Mengajari teman memperkuat pemahaman (GL04). | Kesempatan menjelaskan dengan bahasa sendiri. | GCL | R-18: prompt "Jelaskan dengan bahasamu". |
| Mengingat pola langkah dasar (GL05). | Transfer pola ke soal berbeda. | GCL | R-19: variasi konteks + ringkasan pola langkah. |
| Ingin grafik interaktif real-time (DS01). | Manipulasi langsung $m$ dan $c$. | Mengurangi ECL, mendukung GCL | R-20: Penjelajah Gradien. |
| Konsep dasar dijelaskan perlahan dengan visual (DS02). | Segmenting + visual. | ICL dikelola | R-04, R-06, R-14. |
| Jangan banyak tombol, teks panjang, iklan (DS03). | Antarmuka minimal. | ECL | R-21: satu aksi utama per layar, teks pendek, tanpa iklan. |

---

## 6. Pemetaan ke Sepuluh Aspek Analisis yang Diminta

| No | Aspek | Ringkasan temuan | Kode bukti |
|---|---|---|---|
| 1 | Kesulitan siswa ketika belajar matematika | Prosedur multi-langkah, ketelitian tanda, menggambar grafik sendiri. | IL02, IL05, EL02 |
| 2 | Materi/konsep yang dianggap sulit | Gradien garis tegak lurus; persamaan dari grafik tanpa angka jelas; perpotongan dua garis; soal cerita. | IL01, IL04 |
| 3 | Cara siswa memahami penjelasan guru | Penjelasan papan tulis + mencatat rumus; sulit jika istilah tidak dijelaskan dan tempo terlalu cepat. | K02, EL01, EL04 |
| 4 | Kesulitan membaca dan memahami soal | Soal panjang, sulit memilah angka penting. | EL05 |
| 5 | Kesulitan menghubungkan matematika dengan kehidupan sehari-hari | **Tidak dinyatakan secara eksplisit.** Yang ada: kesulitan meningkat pada soal cerita (IL04, EL05) dan tujuan belajar yang diingat bersifat prosedural (K01). Kesimpulan bahwa siswa "kesulitan mengaitkan dengan kehidupan nyata" **tidak boleh** diklaim dari data ini. | IL04, EL05, K01 (tidak langsung) |
| 6 | Preferensi media pembelajaran | Kertas berpetak & menggambar sendiri; grafik interaktif real-time; visual untuk konsep dasar. | GL01, DS01, DS02 |
| 7 | Faktor pengganggu konsentrasi | Hiasan visual yang ramai; tombol tidak penting; iklan; teks panjang. | EL03, DS03 |
| 8 | Respons terhadap informasi terlalu banyak | Bingung memilah informasi penting; terdistraksi; kesulitan mengikuti perubahan cepat. | EL03, EL04, EL05 |
| 9 | Kebutuhan bantuan, petunjuk, umpan balik | Bantuan langkah-langkah yang tetap membuat berpikir sendiri; strategi cek balik mandiri. Kebutuhan umpan balik dari sistem **tidak dibahas eksplisit**, tetapi IL05 mengindikasikan manfaat umpan balik yang spesifik. | GL03, GL02, IL05 |
| 10 | Indikasi ICL, ECL, GCL | Lihat Bagian 5. | Semua |

---

## 7. Sintesis: Kebutuhan Utama

Dari 18 kutipan, kebutuhan dapat dikelompokkan menjadi lima tema. Tema ini menjadi dasar fitur prioritas di [../PRD.md](../PRD.md).

| Tema | Deskripsi | Rekomendasi terkait |
|---|---|---|
| **T1. Jembatan representasi** | Menghubungkan tabel, grafik, dan persamaan secara langsung dan visual. | R-05, R-11, R-15, R-20 |
| **T2. Prosedur bertahap dengan tempo siswa** | Langkah-langkah dipecah, siswa mengatur kecepatan, bantuan dikurangi bertahap. | R-06, R-14, R-17, R-19 |
| **T3. Dukungan memahami soal kontekstual** | Memilah informasi, merumuskan model, bahasa yang ramah. | R-08, R-10, R-12 |
| **T4. Evaluasi diri dan umpan balik spesifik** | Cek balik, deteksi kesalahan tanda, menjelaskan dengan bahasa sendiri. | R-09, R-16, R-18 |
| **T5. Antarmuka bersih** | Minim dekorasi, sedikit tombol, teks pendek, tanpa iklan. | R-13, R-21 |

---

## 8. Hal yang Tidak Ditemukan dalam Data

Agar tidak mengarang, berikut topik yang **tidak** muncul dalam wawancara sehingga keputusan desainnya didasarkan pada literatur atau ditandai sebagai asumsi:

- Perangkat dan akses internet yang dimiliki siswa (laptop/HP, kuota, kestabilan sinyal) → **Asumsi A-01** di PRD; dukungan offline dirancang sebagai mitigasi.
- Preferensi gamifikasi (poin, lencana, peringkat) → tidak ada data; **tidak** dimasukkan ke MVP.
- Preferensi audio/video/narasi suara → tidak ada data; prinsip *modality* **tidak** diterapkan di MVP (lihat [PEDAGOGICAL_FRAMEWORK.md](PEDAGOGICAL_FRAMEWORK.md) §4.3).
- Pengalaman siswa dengan aplikasi belajar tertentu (EL03 hanya menyebut "aplikasi yang rame") → tidak dinamai.
- Kebiasaan belajar mandiri di rumah vs. di kelas → tidak ada data; **TBD** apakah aplikasi dipakai di kelas, di rumah, atau keduanya.

---

## 9. Rekomendasi Pengumpulan Data Lanjutan

1. Wawancara/angket kebutuhan pada lebih banyak siswa (target **TBD**, misal 5–10 siswa) dengan pertanyaan yang sama, ditambah pertanyaan perangkat & akses internet.
2. Wawancara singkat dengan guru matematika untuk konfirmasi kurikulum, urutan materi, dan waktu pemakaian aplikasi.
3. Analisis dokumen: buku paket dan Capaian Pembelajaran yang berlaku.

---

## 10. Referensi

> Seluruh referensi di bawah adalah publikasi yang dikenal luas. Penulis tetap perlu memverifikasi detail bibliografis (halaman, edisi, DOI) langsung dari sumber sebelum dikutip di laporan akademik.

- Chi, M. T. H., de Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science, 18*(3), 439–477.
- Duval, R. (2006). A cognitive analysis of problems of comprehension in a learning of mathematics. *Educational Studies in Mathematics, 61*(1–2), 103–131.
- Fiorella, L., & Mayer, R. E. (2013). The relative benefits of learning by teaching and teaching expectancy. *Contemporary Educational Psychology, 38*(4), 281–288.
- Leinhardt, G., Zaslavsky, O., & Stein, M. K. (1990). Functions, graphs, and graphing: Tasks, learning, and teaching. *Review of Educational Research, 60*(1), 1–64.
- Mayer, R. E. (2020). *Multimedia Learning* (3rd ed.). Cambridge University Press.
- Rey, G. D. (2012). A review of research and a meta-analysis of the seductive detail effect. *Educational Research Review, 7*(3), 216–237.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*(2), 261–292.
- Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.
