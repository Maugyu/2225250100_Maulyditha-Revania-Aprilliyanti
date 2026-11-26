# Product Requirements Document (PRD)

> **Produk:** Aplikasi Literasi Matematika SMP — nama kerja **"JelajahGaris"** (nama final **TBD**)
> **Versi dokumen:** 0.1 (draf) · **Pemilik:** Maulyditha Revania Aprilliyanti (pengembang & peneliti)
> **Dokumen terkait:** [PRODUCT_VISION.md](PRODUCT_VISION.md) · [USER_STORIES.md](USER_STORIES.md) · [FEATURE_SPECIFICATION.md](FEATURE_SPECIFICATION.md) · [education/INTERVIEW_ANALYSIS.md](education/INTERVIEW_ANALYSIS.md)

---

## 1. Latar Belakang

Literasi matematika menurut kerangka PISA adalah kapasitas individu untuk bernalar secara matematis serta merumuskan, menggunakan, dan menafsirkan matematika untuk menyelesaikan masalah dalam berbagai konteks dunia nyata (OECD, 2023). Pembelajaran yang hanya berfokus pada hafalan rumus dan latihan prosedural belum tentu mengembangkan kemampuan tersebut.

Wawancara eksploratif dengan satu siswa kelas IX (S01) tentang materi **Persamaan Garis Lurus (PGL)** menunjukkan pola berikut (detail di [education/INTERVIEW_ANALYSIS.md](education/INTERVIEW_ANALYSIS.md)):

- Rumus gradien dan bentuk $y = mx + c$ mudah diingat (K03), tetapi siswa kesulitan pada gradien garis tegak lurus, membaca persamaan dari grafik (IL01), soal cerita, dan perpotongan dua garis (IL04).
- Kesalahan sering terjadi pada tanda plus-minus walau rumus dihafal (IL05).
- Beban ekstraneous muncul dari istilah yang tidak dijelaskan (EL01), tempo penjelasan yang terlalu cepat (EL04), soal yang terlalu panjang (EL05), dan tampilan yang terlalu ramai (EL03).
- Siswa merasa terbantu oleh menggambar grafik sendiri dari tabel titik (GL01), cek balik dengan substitusi (GL02), bantuan langkah demi langkah (GL03), dan menjelaskan ke teman (GL04).
- Siswa secara langsung meminta grafik interaktif real-time (DS01), penjelasan konsep dasar yang perlahan dan visual (DS02), serta tampilan tanpa tombol berlebih, teks panjang, atau iklan (DS03).

Karena data berasal dari satu siswa, temuan ini diperlakukan sebagai **hipotesis kebutuhan** yang akan diuji dalam evaluasi produk.

## 2. Permasalahan yang Ingin Diselesaikan

| ID | Pernyataan masalah | Bukti |
|---|---|---|
| P-01 | Siswa menguasai rumus PGL secara simbolik, tetapi belum tentu memahami makna gradien dan konstanta dalam situasi nyata. | K01, K03 |
| P-02 | Siswa kesulitan berpindah antara representasi grafik dan persamaan, terutama membaca titik dari grafik dan menggambar grafik sendiri. | IL01, EL02 |
| P-03 | Prosedur menyusun persamaan garis bersifat multi-langkah dan rawan kesalahan tanda. | IL02, IL05 |
| P-04 | Soal kontekstual terasa panjang; siswa kesulitan memilah informasi penting sebelum dapat merumuskan model matematika. | IL04, EL05 |
| P-05 | Media yang ada (penjelasan cepat, istilah tanpa penjelasan, tampilan ramai) menambah beban kognitif yang tidak perlu. | EL01, EL03, EL04, DS03 |

## 3. Tujuan Produk

### 3.1 Tujuan pedagogis

1. Menyediakan aktivitas yang melatih tiga proses literasi matematika PISA — **Formulate, Employ, Interpret & Evaluate** — pada materi PGL dengan konteks kehidupan sehari-hari.
2. Mengelola beban kognitif: menurunkan beban ekstraneous, mengelola beban intrinsik dengan penyajian bertahap, dan mendorong aktivitas yang mendukung pembentukan skema.
3. Mengumpulkan **bukti proses** literasi matematika siswa (bukan hanya skor benar/salah) untuk keperluan penelitian.

### 3.2 Tujuan produk/teknis

1. Berjalan di browser laptop dan smartphone Android, dapat diinstal sebagai PWA tanpa toko aplikasi.
2. Ringan, responsif, dan tetap dapat membuka materi serta eksplorasi saat koneksi terputus.
3. Arsitektur sederhana yang dapat dikembangkan dan dipelihara oleh satu mahasiswa S1.

### 3.3 Indikator keberhasilan (sementara)

> Indikator ini adalah target **evaluasi produk**, bukan klaim efektivitas. Lihat [testing/EVALUATION_PLAN.md](testing/EVALUATION_PLAN.md).

| Indikator | Target | Status |
|---|---|---|
| Validasi ahli materi & ahli media | Kategori minimal "layak" | Instrumen **TBD** |
| Skor System Usability Scale (SUS) uji coba terbatas | ≥ 68 (rata-rata acuan SUS) | Target sementara |
| Siswa dapat menyelesaikan satu unit tanpa bantuan peneliti | ≥ 80% peserta uji coba | Target sementara |
| Lighthouse PWA installable + performa mobile | Lolos kriteria installable; skor performa ≥ 80 | Target sementara |

## 4. Target Pengguna

| Pengguna | Peran | Prioritas |
|---|---|---|
| **Siswa SMP** (fokus kelas VIII yang sedang/telah belajar PGL) | Pengguna utama: belajar, berlatih, refleksi, mengerjakan asesmen. | Primer |
| **Peneliti** (pengembang sebagai peneliti; dapat juga guru pendamping) | Menyiapkan akun siswa, melihat progres, mengekspor data, menilai jawaban terbuka dengan rubrik. | Sekunder |
| Guru matematika | Dapat memakai aplikasi di kelas. Dasbor guru penuh **di luar MVP**. | Tersier (TBD) |

## 5. User Needs

| ID | Kebutuhan | Sumber |
|---|---|---|
| UN-01 | Melihat langsung bagaimana perubahan $m$ dan $c$ mengubah garis. | DS01 |
| UN-02 | Belajar konsep gradien & hubungan dua garis secara perlahan dan visual. | DS02, IL01 |
| UN-03 | Menggambar grafik dari tabel titik tanpa terbebani ketelitian menggaris. | GL01, EL02 |
| UN-04 | Mengikuti langkah penyelesaian dengan tempo sendiri. | EL04, IL02 |
| UN-05 | Mendapat bantuan bertahap yang tidak langsung memberi jawaban. | GL03 |
| UN-06 | Mengetahui kesalahan spesifik (misal kesalahan tanda). | IL05 |
| UN-07 | Memahami istilah matematika dalam bahasa sehari-hari. | EL01 |
| UN-08 | Dibantu memilah informasi penting dalam soal cerita. | EL05, IL04 |
| UN-09 | Mengecek sendiri kebenaran jawaban. | GL02 |
| UN-10 | Kesempatan menjelaskan dengan bahasa sendiri. | GL04 |
| UN-11 | Tampilan bersih, sedikit tombol, teks pendek, tanpa iklan. | DS03, EL03 |
| UN-12 | Dapat dipakai di HP dan laptop, termasuk saat sinyal lemah. | **Asumsi A-01** (tidak dari wawancara) |
| UN-13 | Peneliti membutuhkan data proses belajar yang dapat dianalisis. | Kebutuhan penelitian |

## 6. User Personas

> Persona 1 disusun dari data wawancara. Persona 2 dan 3 adalah **proto-persona berbasis asumsi** dan harus divalidasi.

### Persona 1 — "Nadia" (berbasis data S01)

- **Kelas:** IX, pernah belajar PGL di kelas VIII.
- **Yang sudah bisa:** hafal $m = \frac{y_2-y_1}{x_2-x_1}$ dan $y = mx + c$; punya kebiasaan cek balik dengan substitusi.
- **Kesulitan:** garis tegak lurus, persamaan dari grafik, soal cerita panjang, perpotongan dua garis, salah tanda.
- **Cara belajar yang membantu:** menggambar dari tabel titik, langkah-langkah bertahap, menjelaskan ke teman.
- **Yang mengganggu:** tampilan ramai, istilah tanpa penjelasan, guru yang terlalu cepat.
- **Kutipan:** "Bantuan berupa step-step pengerjaan soalnya itu bikin aku mikir sendiri tapi nggak macet." (GL03)

### Persona 2 — "Raka" (proto-persona, asumsi)

- Kelas VIII, sedang belajar PGL, mengakses dari HP Android milik keluarga dengan kuota terbatas.
- Kebutuhan: aplikasi ringan, dapat diinstal, tetap jalan saat sinyal hilang.
- **Status:** asumsi — perlu dikonfirmasi lewat angket perangkat.

### Persona 3 — "Peneliti" (pengembang)

- Mahasiswa S1 Pendidikan Matematika yang menjalankan uji coba.
- Kebutuhan: membuat akun siswa tanpa data pribadi, memantau progres, mengekspor jawaban, menilai jawaban terbuka dengan rubrik.

## 7. Fitur Utama

Prioritas memakai MoSCoW. Detail di [FEATURE_SPECIFICATION.md](FEATURE_SPECIFICATION.md).

| ID | Fitur | Prioritas | Dasar |
|---|---|---|---|
| F-01 | Masuk dengan kode siswa + PIN (tanpa email/nama asli) | Must | Privasi, kebutuhan penelitian |
| F-02 | Beranda siswa: lanjutkan belajar + progres ringkas | Must | DS03 (sederhana) |
| F-03 | Peta modul & unit PGL | Must | DS02 (bertahap) |
| F-04 | Pemutar aktivitas bertahap (satu langkah per layar) | Must | EL04, IL02, DS03 |
| F-05 | Penjelajah Gradien (slider $m$, $c$; mode dua garis) | Must | DS01, IL01, DS02 |
| F-06 | Plot titik di grid (tabel → titik → garis) | Must | GL01, EL02 |
| F-07 | Contoh terbimbing bertahap dengan sorotan perubahan | Must | EL04, IL02 |
| F-08 | Masalah kontekstual berstruktur F–E–I | Must | EL05, IL04, tujuan literasi |
| F-09 | Petunjuk bertingkat (3 level) | Must | GL03 |
| F-10 | Umpan balik terarah (termasuk deteksi kesalahan tanda) | Must | IL05 |
| F-11 | Glosarium inline | Must | EL01 |
| F-12 | Refleksi & "Jelaskan dengan bahasamu" | Must | GL04 |
| F-13 | Progres belajar per unit | Must | Navigasi & motivasi dasar |
| F-14 | Asesmen literasi (pretes/postes) | Must | Kebutuhan evaluasi |
| F-15 | Ekspor data peneliti (CSV) | Must | Kebutuhan penelitian |
| F-16 | PWA: instalasi + offline untuk materi & eksplorasi | Must | Ketentuan proyek |
| F-17 | Cek prasyarat singkat + penyegar | Should | IL03 |
| F-18 | Penilaian rubrik di dalam aplikasi (panel peneliti) | Should | Efisiensi penilaian |
| F-19 | Antrean sinkronisasi jawaban saat offline | Should | Asumsi A-01 |
| F-20 | Riwayat perkembangan (linimasa percobaan & refleksi) | Could | Bukti perkembangan |
| F-21 | Mode tema gelap / pengaturan ukuran huruf | Could | Aksesibilitas |
| F-22 | Asisten AI peneliti (Gemini): saran skor rubrik & ringkasan refleksi — **hanya peneliti** (ADR-016) | Should (sudah dibuat) | Efisiensi penilaian; ketentuan usia Gemini API |
| F-23 | Skin Gari bebas pilih (12 skin) & beranda bersidebar (ADR-017) | Could (sudah dibuat) | Permintaan pemilik |
| F-24 | "Tanya Gari" AI untuk siswa, didampingi orang tua, izin per kelas (ADR-018) | Should (sudah dibuat) | Keputusan pemilik |
| F-25 | Langkah *Rencanakan*, refleksi transendensi, Diagnostik RMT (ADR-019) | Should (sudah dibuat) | Landasan RMT |
| F-26 | Efek suara (ketuk tombol, benar, perlu dicek) yang dapat dimatikan + Tanya Gari interaktif: tombol khusus, sapaan per langkah, pilihan balasan cepat, Gari bertanya balik, pesan bisa dibacakan (ADR-020) | Could (sudah dibuat) | Permintaan pemilik |
| F-27 | Chatbot "Tanya Gari" di bilah samping (obrolan umum, tidak terikat langkah), dengan pengaman yang sama dengan F-24 dan nonaktif saat asesmen (ADR-021) | Could (sudah dibuat) | Permintaan pemilik |
| — | Gamifikasi (poin, lencana, peringkat), video, iklan | Won't (MVP) | Tidak ada data kebutuhan; berpotensi menambah ECL (EL03, DS03) |

## 8. Functional Requirements

| ID | Kebutuhan fungsional | Fitur |
|---|---|---|
| FR-01 | Sistem memungkinkan siswa masuk menggunakan kode siswa dan PIN 6 digit yang dibuat peneliti. | F-01 |
| FR-02 | Sistem tidak meminta nama asli, email, nomor HP, atau foto siswa. | F-01 |
| FR-03 | Beranda menampilkan satu tombol aksi utama "Lanjutkan belajar" yang membuka langkah terakhir yang belum selesai. | F-02 |
| FR-04 | Sistem menampilkan daftar unit beserta status (belum mulai / sedang / selesai). | F-03, F-13 |
| FR-05 | Aktivitas disajikan langkah demi langkah; siswa berpindah langkah dengan tombol "Lanjut" dan dapat kembali ke langkah sebelumnya. | F-04 |
| FR-06 | Penjelajah Gradien memperbarui grafik dan persamaan dalam ≤ 100 ms setelah slider diubah. | F-05 |
| FR-07 | Mode dua garis menampilkan $m_1$, $m_2$, dan hasil $m_1 \times m_2$ serta status sejajar/tegak lurus/berpotongan. | F-05 |
| FR-08 | Siswa dapat menempatkan titik pada grid dengan ketukan/klik; titik menempel ke koordinat bilangan bulat (atau kelipatan 0,5 bila diatur). | F-06 |
| FR-09 | Contoh terbimbing menampilkan satu transformasi per tampilan, menyorot bagian yang berubah, dan tetap menampilkan langkah sebelumnya. | F-07 |
| FR-10 | Masalah kontekstual menyediakan langkah: tandai informasi → isi Diketahui/Ditanya → susun model → hitung → cek balik → tafsirkan & evaluasi. | F-08 |
| FR-11 | Siswa dapat membuka petunjuk level 1, 2, lalu 3 secara berurutan; penggunaan petunjuk dicatat. | F-09 |
| FR-12 | Sistem memberi umpan balik yang menyebut jenis kesalahan bila terdeteksi (tanda, tertukar urutan titik, salah membaca grafik). | F-10 |
| FR-13 | Istilah yang ditandai di konten menampilkan penjelasan singkat saat diketuk. | F-11 |
| FR-14 | Di akhir unit siswa menulis penjelasan singkat dan memilih tingkat keyakinan (1–4). | F-12 |
| FR-15 | Asesmen literasi tidak menampilkan kunci jawaban maupun umpan balik benar/salah selama dikerjakan. | F-14 |
| FR-16 | Peneliti dapat mengekspor percobaan, respons per langkah, refleksi, dan jawaban asesmen dalam format CSV. | F-15 |
| FR-17 | Aplikasi dapat diinstal dari Chrome Android dan desktop; materi serta penjelajah dapat dibuka tanpa koneksi setelah pernah dimuat. | F-16 |
| FR-18 | Saat offline, aplikasi menampilkan status offline dan tidak kehilangan jawaban yang sedang diketik (draf disimpan lokal). | F-16 |

## 9. Non-Functional Requirements

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-01 | Responsivitas | Tata letak berfungsi pada lebar 360 px hingga ≥ 1280 px tanpa gulir horizontal. |
| NFR-02 | Performa | Muatan awal JavaScript (gzip) target ≤ 250 KB; First Contentful Paint ≤ 2,5 detik pada emulasi "Slow 4G" Lighthouse. |
| NFR-03 | Aksesibilitas | Mengacu WCAG 2.1 level AA untuk kontras, fokus keyboard, label form, dan target sentuh ≥ 44×44 px. |
| NFR-04 | Kompatibilitas | Chrome Android (2 versi utama terakhir), Chrome/Edge desktop, Firefox desktop; Safari iOS berfungsi dengan keterbatasan PWA yang didokumentasikan. |
| NFR-05 | Keamanan | HTTPS wajib di produksi; PIN disimpan sebagai hash; validasi input di backend. |
| NFR-06 | Privasi | Minimisasi data; tidak ada pelacak pihak ketiga atau iklan. |
| NFR-07 | Keterpeliharaan | Kode mengikuti [development/CODING_STANDARDS.md](development/CODING_STANDARDS.md); cakupan uji backend ≥ 70% pada modul layanan. |
| NFR-08 | Portabilitas data | Skema dapat dimigrasikan dari SQLite ke PostgreSQL tanpa mengubah kode aplikasi selain konfigurasi koneksi. |
| NFR-09 | Bahasa | Seluruh antarmuka berbahasa Indonesia yang ramah siswa SMP. |
| NFR-10 | Beban kognitif | Satu aksi utama per layar; blok teks penjelas target ≤ 3 kalimat; tidak ada elemen dekoratif tanpa fungsi informasi. |

## 10. Acceptance Criteria (tingkat produk)

MVP dinyatakan diterima bila:

1. Seluruh fitur berprioritas **Must** lolos skenario di [testing/ACCEPTANCE_TESTING.md](testing/ACCEPTANCE_TESTING.md).
2. Seorang siswa dapat masuk, menyelesaikan minimal satu unit lengkap (eksplorasi → contoh → latihan → masalah kontekstual → refleksi), dan progresnya tersimpan di server.
3. Aplikasi lolos audit installable Lighthouse dan dapat diinstal di satu perangkat Android nyata.
4. Materi dan Penjelajah Gradien dapat dibuka dalam mode pesawat setelah pernah dimuat.
5. Peneliti dapat mengekspor CSV berisi data proses yang tidak memuat data identitas asli.
6. Konten unit telah ditelaah oleh minimal satu ahli materi (dosen pembimbing atau guru) — **TBD**.

## 11. MVP Scope

**Materi:** satu modul — *Persamaan Garis Lurus dalam Kehidupan Sehari-hari* — dengan unit:

| Unit | Judul | Status MVP |
|---|---|---|
| U0 | Cek Prasyarat (Kartesius, tanda, pecahan) | Should |
| U1 | Dari Tabel ke Grafik | Must |
| U2 | Gradien sebagai Laju Perubahan | Must |
| U3 | Persamaan $y = mx + c$ dan Makna $c$ | Must |
| U4 | Menyusun Persamaan Garis (dari dua titik dan dari grafik) | Must |
| U5 | Garis Sejajar dan Tegak Lurus | Must |
| U6 | Proyek Konteks: Membandingkan Dua Tarif (perpotongan) | Must (dapat diturunkan ke Should bila waktu tidak cukup — **TBD**) |

**Fitur:** seluruh fitur Must (F-01 s.d. F-16).

Rancangan isi unit ada di [education/LEARNING_DESIGN.md](education/LEARNING_DESIGN.md) dan [education/MATHEMATICS_CONTENT_MAP.md](education/MATHEMATICS_CONTENT_MAP.md).

## 12. Out of Scope (MVP)

- Materi selain PGL (dipetakan sebagai rencana lanjutan saja).
- Dasbor guru lengkap, manajemen kelas oleh guru, dan pendaftaran mandiri siswa.
- Gamifikasi, papan peringkat, fitur sosial/chat.
- Video, narasi audio, dan tutor berbasis AI.
- Pemeriksaan jawaban bebas berbentuk persamaan lengkap yang diketik bebas (MVP memakai input terstruktur $y = [m]x + [c]$).
- Notifikasi push.
- Aplikasi native / distribusi lewat Play Store atau App Store.

## 13. Risiko dan Asumsi

### 13.1 Asumsi

| ID | Asumsi | Cara validasi |
|---|---|---|
| A-01 | Siswa mengakses aplikasi lewat HP Android dan/atau laptop dengan koneksi yang tidak selalu stabil. | Angket perangkat saat uji coba. |
| A-02 | PGL diajarkan di kelas VIII (lihat inkonsistensi D-01). | Konfirmasi ke guru & dokumen kurikulum. |
| A-03 | Aplikasi dipakai sebagai pendamping pembelajaran (kelas atau mandiri), bukan pengganti guru. | Diskusi dengan dosen/guru. |
| A-04 | Peneliti dapat membuat akun siswa secara massal sebelum uji coba. | Uji skrip pembuatan akun. |

### 13.2 Risiko

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| RK-01 | Generalisasi berlebihan dari satu wawancara. | Desain tidak cocok untuk siswa lain. | Evaluasi bertahap (one-to-one → small group) dan revisi. |
| RK-02 | Lingkup konten terlalu besar untuk waktu pengembangan. | MVP tidak selesai. | U0 & U6 dapat diturunkan prioritasnya; konten ditulis sebagai JSON terpisah dari kode. |
| RK-03 | Penyimpanan SQLite hilang pada hosting dengan disk sementara. | Data penelitian hilang. | Pilih hosting dengan disk persisten atau PostgreSQL terkelola; cadangan rutin (lihat [testing/DEPLOYMENT_GUIDE.md](testing/DEPLOYMENT_GUIDE.md)). |
| RK-04 | Keterbatasan PWA di iOS. | Pengalaman instalasi berbeda. | Dokumentasikan langkah "Add to Home Screen"; aplikasi tetap berfungsi di browser. |
| RK-05 | Data anak di bawah umur. | Risiko privasi & etika. | Minimisasi data, persetujuan orang tua/sekolah, pseudonim (lihat [technical/SECURITY_AND_PRIVACY.md](technical/SECURITY_AND_PRIVACY.md)). |
| RK-06 | Klaim efektivitas tanpa uji empiris. | Masalah integritas akademik. | Bahasa evaluasi berhati-hati; lihat [education/ASSESSMENT_RUBRIC.md](education/ASSESSMENT_RUBRIC.md) §7. |

## 14. Keputusan yang Masih TBD

| ID | Keputusan | Alasan belum ditetapkan |
|---|---|---|
| TBD-01 | Nama final aplikasi. | Menunggu keputusan pemilik proyek. |
| TBD-02 | ~~Desain visual final.~~ **Diputuskan 25 Nov 2026**: mengikuti referensi pemilik + maskot Gari (ADR-015). | — |
| TBD-03 | Kurikulum acuan (Kurikulum Merdeka Fase D) dan pemetaan CP/TP resmi. | Perlu merujuk dokumen CP terbaru dan konfirmasi guru. |
| TBD-04 | Model pengembangan penelitian (ADDIE / 4D / lainnya). | Ditentukan bersama dosen pembimbing. |
| TBD-05 | Layanan hosting produksi. | Bergantung anggaran dan kebutuhan disk persisten. |
| TBD-06 | Jumlah & sekolah peserta uji coba. | Bergantung izin sekolah. |
| TBD-07 | Apakah aplikasi dipakai di kelas, di rumah, atau keduanya. | Tidak ada data wawancara. |
| TBD-08 | Unit dibuka bebas atau berurutan (terkunci). Default sementara: bebas + urutan disarankan. | Pertimbangan pedagogis (struktur vs. kendali siswa) perlu diputuskan pemilik. |
| TBD-09 | Cara menyusun persamaan di U4: rumus $y - y_1 = m(x - x_1)$ atau substitusi ke $y = mx + c$. | Sebaiknya mengikuti buku paket/guru siswa; perlu dicek. |
| TBD-10 | Batas materi U6: titik potong hanya secara grafik/tabel, atau juga aljabar (SPLDV). | Perlu konfirmasi lingkup kurikulum dengan dosen/guru. |
| TBD-11 | Penamaan kelas di laporan wawancara (D-01: kelas VII vs VIII). | Perlu koreksi oleh pewawancara. |

## 15. Referensi

- OECD. (2023). *PISA 2022 Assessment and Analytical Framework*. OECD Publishing.
- Detail referensi teori lainnya: [education/PEDAGOGICAL_FRAMEWORK.md](education/PEDAGOGICAL_FRAMEWORK.md) §9.
