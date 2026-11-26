# User Stories

> **Dokumen terkait:** [PRD.md](PRD.md) · [FEATURE_SPECIFICATION.md](FEATURE_SPECIFICATION.md) · [testing/ACCEPTANCE_TESTING.md](testing/ACCEPTANCE_TESTING.md)
>
> Format: *Sebagai [peran], saya ingin [tujuan], agar [manfaat].* Acceptance criteria memakai pola **Given–When–Then** (Diberikan–Ketika–Maka). Kolom "Sumber" merujuk kode wawancara atau kebutuhan penelitian.

---

## Ringkasan

| ID | Judul | Peran | Fitur | Prioritas | Sumber |
|---|---|---|---|---|---|
| US-01 | Masuk dengan kode siswa | Siswa | F-01 | Must | Privasi |
| US-02 | Melanjutkan belajar | Siswa | F-02 | Must | DS03 |
| US-03 | Melihat peta unit | Siswa | F-03, F-13 | Must | DS02 |
| US-04 | Belajar langkah demi langkah | Siswa | F-04 | Must | EL04 |
| US-05 | Menjelajahi gradien secara langsung | Siswa | F-05 | Must | DS01 |
| US-06 | Membandingkan dua garis | Siswa | F-05 | Must | IL01, DS02 |
| US-07 | Memplot titik dari tabel | Siswa | F-06 | Must | GL01, EL02 |
| US-08 | Membaca titik dari grafik | Siswa | F-06 | Must | IL01 |
| US-09 | Mengikuti contoh terbimbing | Siswa | F-07 | Must | IL02, EL04 |
| US-10 | Memilah informasi soal cerita | Siswa | F-08 | Must | EL05 |
| US-11 | Merumuskan model dari konteks | Siswa | F-08 | Must | IL04 |
| US-12 | Cek balik jawaban | Siswa | F-08 | Must | GL02 |
| US-13 | Menafsirkan dan mengevaluasi hasil | Siswa | F-08 | Must | Literasi (PISA) |
| US-14 | Meminta petunjuk bertingkat | Siswa | F-09 | Must | GL03 |
| US-15 | Mendapat umpan balik spesifik | Siswa | F-10 | Must | IL05 |
| US-16 | Memahami istilah | Siswa | F-11 | Must | EL01 |
| US-17 | Menjelaskan dengan bahasa sendiri | Siswa | F-12 | Must | GL04 |
| US-18 | Mengerjakan asesmen literasi | Siswa | F-14 | Must | Penelitian |
| US-19 | Memasang aplikasi di HP | Siswa | F-16 | Must | Ketentuan proyek |
| US-20 | Belajar saat offline | Siswa | F-16 | Must | A-01 |
| US-21 | Membuat akun siswa massal | Peneliti | F-15 | Must | Penelitian |
| US-22 | Mengekspor data | Peneliti | F-15 | Must | Penelitian |
| US-23 | Cek prasyarat | Siswa | F-17 | Should | IL03 |
| US-24 | Menilai jawaban dengan rubrik | Peneliti | F-18 | Should | Penelitian |
| US-25 | Jawaban tersinkron setelah online | Siswa | F-19 | Should | A-01 |
| US-26 | Melihat riwayat belajar | Siswa | F-20 | Could | Bukti perkembangan |

---

## Epik A — Akses dan Navigasi

### US-01 — Masuk dengan kode siswa
**Sebagai** siswa, **saya ingin** masuk dengan kode siswa dan PIN yang diberikan, **agar** progres saya tersimpan tanpa harus memberikan data pribadi.

- **AC1** Diberikan kode dan PIN benar, ketika saya menekan "Masuk", maka saya diarahkan ke Beranda.
- **AC2** Diberikan PIN salah, ketika saya menekan "Masuk", maka muncul pesan "Kode atau PIN belum tepat" tanpa menyebut bagian mana yang salah.
- **AC3** Formulir tidak meminta nama asli, email, atau nomor HP.
- **AC4** Setelah 5 percobaan gagal dalam 15 menit, percobaan berikutnya ditolak sementara dengan pesan yang jelas.

### US-02 — Melanjutkan belajar
**Sebagai** siswa, **saya ingin** satu tombol untuk melanjutkan dari tempat terakhir, **agar** saya tidak bingung harus mulai dari mana.

- **AC1** Diberikan saya pernah berhenti di langkah 3 aktivitas U2, ketika saya membuka Beranda, maka tombol "Lanjutkan belajar" membuka langkah 3 aktivitas tersebut.
- **AC2** Diberikan saya pengguna baru, maka tombol berbunyi "Mulai belajar" dan membuka U1 (atau U0 bila cek prasyarat diaktifkan).
- **AC3** Beranda hanya memiliki satu tombol aksi utama.

### US-03 — Melihat peta unit
**Sebagai** siswa, **saya ingin** melihat urutan unit dan statusnya, **agar** saya tahu posisi belajar saya.

- **AC1** Setiap unit menampilkan judul, satu kalimat tujuan, dan status (belum mulai / sedang / selesai).
- **AC2** Unit dapat dibuka dalam urutan apa pun (tidak dikunci), tetapi urutan yang disarankan ditandai.

> Catatan: keputusan "tidak dikunci" adalah **TBD-08** — perlu diputuskan apakah unit dibuka bebas atau berurutan. Default MVP: bebas dengan rekomendasi urutan.

---

## Epik B — Eksplorasi dan Representasi

### US-04 — Belajar langkah demi langkah
**Sebagai** siswa, **saya ingin** materi muncul satu langkah dalam satu waktu, **agar** saya dapat memahami dengan tempo saya sendiri.

- **AC1** Setiap layar aktivitas hanya menampilkan satu langkah dan satu tombol aksi utama.
- **AC2** Tombol "Kembali" membawa ke langkah sebelumnya tanpa kehilangan jawaban.
- **AC3** Indikator posisi (misal "Langkah 2 dari 6") selalu terlihat.

### US-05 — Menjelajahi gradien secara langsung
**Sebagai** siswa, **saya ingin** mengubah nilai $m$ dan melihat garis langsung berubah, **agar** saya memahami arti kemiringan.

- **AC1** Ketika saya menggeser slider $m$, maka garis dan persamaan $y = mx + c$ diperbarui tanpa jeda yang terasa (≤ 100 ms).
- **AC2** Nilai $m$ dapat diatur negatif, nol, dan positif, termasuk pecahan sederhana (langkah 0,5 atau pecahan yang ditentukan konten).
- **AC3** Penjelajah berfungsi di layar sentuh dan dengan keyboard (tombol panah).
- **AC4** Penjelajah tetap berjalan saat offline.

### US-06 — Membandingkan dua garis
**Sebagai** siswa, **saya ingin** melihat dua garis sekaligus beserta gradiennya, **agar** saya memahami garis sejajar dan tegak lurus.

- **AC1** Mode dua garis menampilkan $m_1$, $m_2$, dan $m_1 \times m_2$.
- **AC2** Ketika $m_1 = m_2$, maka label "sejajar" muncul; ketika $m_1 \times m_2 = -1$, label "tegak lurus" muncul beserta penanda sudut siku-siku.
- **AC3** Skala sumbu X dan Y sama (1:1) agar sudut siku-siku tampak benar.

### US-07 — Memplot titik dari tabel
**Sebagai** siswa, **saya ingin** menempatkan titik dari tabel ke grid tanpa harus menggaris presisi, **agar** saya fokus pada hubungan titik dan garis.

- **AC1** Ketukan pada grid menempatkan titik yang menempel ke koordinat terdekat.
- **AC2** Titik yang salah dapat dihapus dengan mengetuknya kembali.
- **AC3** Setelah semua titik benar, garis yang melalui titik-titik tersebut digambar dan siswa diminta mengamati polanya.

### US-08 — Membaca titik dari grafik
**Sebagai** siswa, **saya ingin** berlatih menentukan koordinat titik dari grafik, **agar** saya bisa menyusun persamaan dari grafik.

- **AC1** Pada tahap awal, titik potong grid yang dilalui garis dapat diketuk dan menampilkan koordinatnya.
- **AC2** Pada tahap lanjut (fading), koordinat tidak ditampilkan otomatis; siswa mengetik koordinat sendiri.

---

## Epik C — Prosedur dan Masalah Kontekstual

### US-09 — Mengikuti contoh terbimbing
**Sebagai** siswa, **saya ingin** melihat contoh penyelesaian per langkah dengan bagian yang berubah disorot, **agar** saya tidak tertinggal seperti saat guru menulis terlalu cepat.

- **AC1** Setiap langkah memiliki label tujuan (misal "Langkah 1: Cari gradien").
- **AC2** Bagian persamaan yang berubah dari langkah sebelumnya disorot.
- **AC3** Langkah sebelumnya tetap terlihat di atas langkah aktif.
- **AC4** Contoh berikutnya berupa *completion problem*: sebagian langkah harus saya isi sendiri.

### US-10 — Memilah informasi soal cerita
**Sebagai** siswa, **saya ingin** menandai informasi penting dalam soal, **agar** saya tidak bingung antara angka penting dan "cuma cerita".

- **AC1** Teks soal dapat diketuk per frasa yang telah disiapkan konten untuk ditandai.
- **AC2** Setelah menandai, saya mengisi tabel "Diketahui" dan "Ditanya".
- **AC3** Umpan balik menunjukkan informasi penting yang terlewat atau informasi tidak relevan yang ditandai.

### US-11 — Merumuskan model dari konteks
**Sebagai** siswa, **saya ingin** dibantu mengubah situasi menjadi persamaan, **agar** saya bisa menyelesaikan soal cerita.

- **AC1** Saya menentukan arti variabel ($x$ = …, $y$ = …) dengan memilih dari opsi atau mengetik.
- **AC2** Saya mengisi persamaan dalam bentuk terstruktur $y = [m]x + [c]$; pecahan dapat ditulis sebagai `a/b`.
- **AC3** Umpan balik menjelaskan bila $m$ dan $c$ tertukar maknanya.

### US-12 — Cek balik jawaban
**Sebagai** siswa, **saya ingin** mengecek persamaan saya dengan memasukkan titik yang diketahui, **agar** saya yakin jawaban saya benar sebelum dikirim.

- **AC1** Setelah menyusun persamaan, muncul langkah "Cek balik" yang meminta saya menghitung $y$ untuk satu titik yang diketahui.
- **AC2** Aplikasi menampilkan perbandingan hasil hitungan saya dengan nilai $y$ yang diketahui.

### US-13 — Menafsirkan dan mengevaluasi hasil
**Sebagai** siswa, **saya ingin** menjelaskan arti hasil perhitungan dalam konteks soal, **agar** saya tahu apakah jawabannya masuk akal.

- **AC1** Setelah menghitung, saya menjawab pertanyaan tafsiran (misal "Apa arti nilai 2.500 dalam situasi ini?").
- **AC2** Saya menjawab pertanyaan evaluasi kewajaran (misal "Apakah jarak negatif mungkin? Mengapa?").
- **AC3** Jawaban terbuka tersimpan untuk dinilai peneliti dengan rubrik.

### US-14 — Meminta petunjuk bertingkat
**Sebagai** siswa, **saya ingin** meminta petunjuk sedikit demi sedikit, **agar** saya tetap berpikir sendiri tetapi tidak macet.

- **AC1** Tombol "Petunjuk" membuka level 1; level 2 dan 3 hanya terbuka setelah level sebelumnya dibuka.
- **AC2** Level 3 menunjukkan langkah contoh, bukan jawaban akhir.
- **AC3** Jumlah dan level petunjuk yang dibuka tercatat.

### US-15 — Mendapat umpan balik spesifik
**Sebagai** siswa, **saya ingin** tahu jenis kesalahan saya, **agar** saya dapat memperbaikinya.

- **AC1** Bila jawaban saya bernilai sama tetapi bertanda berlawanan, pesan menyebut "Periksa tanda positif/negatif".
- **AC2** Bila saya menukar urutan titik hanya pada pembilang atau penyebut, pesan menjelaskan pentingnya urutan yang konsisten.
- **AC3** Setelah 2 kali salah pada langkah yang sama, petunjuk level 1 ditawarkan (bukan dipaksakan).

### US-16 — Memahami istilah
**Sebagai** siswa, **saya ingin** mengetuk istilah matematika untuk melihat artinya, **agar** saya tidak tersesat oleh istilah yang belum saya pahami.

- **AC1** Istilah bertanda (garis bawah putus-putus) menampilkan penjelasan ≤ 2 kalimat dalam bahasa sehari-hari.
- **AC2** Penjelasan muncul di tempat (popover), tidak memindahkan halaman.

### US-17 — Menjelaskan dengan bahasa sendiri
**Sebagai** siswa, **saya ingin** menuliskan penjelasan singkat seolah mengajari teman, **agar** saya sadar bagian yang belum saya pahami.

- **AC1** Di akhir unit muncul prompt "Jelaskan ke temanmu: …" dengan kotak teks.
- **AC2** Saya memilih tingkat keyakinan 1–4.
- **AC3** Jawaban dapat dilewati, tetapi aplikasi mencatat bahwa langkah ini dilewati.

---

## Epik D — Asesmen dan PWA

### US-18 — Mengerjakan asesmen literasi
**Sebagai** siswa, **saya ingin** mengerjakan asesmen tanpa tekanan, **agar** kemampuan saya dapat dilihat apa adanya.

- **AC1** Asesmen tidak menampilkan benar/salah maupun petunjuk selama dikerjakan.
- **AC2** Jawaban tersimpan otomatis per butir.
- **AC3** Setelah dikirim, asesmen tidak dapat diubah.
- **AC4** Asesmen hanya dapat dikerjakan saat online.

### US-19 — Memasang aplikasi di HP
**Sebagai** siswa, **saya ingin** memasang aplikasi ke layar utama HP, **agar** mudah dibuka seperti aplikasi biasa.

- **AC1** Di Chrome Android, opsi "Instal aplikasi" tersedia.
- **AC2** Setelah diinstal, aplikasi terbuka dalam mode *standalone* dengan ikon dan nama yang benar.
- **AC3** Di iOS, tersedia panduan singkat "Tambahkan ke Layar Utama".

### US-20 — Belajar saat offline
**Sebagai** siswa, **saya ingin** tetap bisa membuka materi saat sinyal hilang, **agar** belajar tidak terputus.

- **AC1** Materi unit yang pernah dibuka dapat ditampilkan saat offline.
- **AC2** Banner status offline muncul tanpa menutupi konten.
- **AC3** Jawaban yang sedang diketik tersimpan sebagai draf lokal.

---

## Epik E — Peneliti

### US-21 — Membuat akun siswa massal
**Sebagai** peneliti, **saya ingin** membuat akun siswa dari daftar kode, **agar** uji coba dapat dimulai cepat tanpa data pribadi.

- **AC1** Skrip/endpoint menerima jumlah siswa dan kode kelas, lalu menghasilkan kode siswa dan PIN acak.
- **AC2** Daftar kode + PIN dapat diunduh sekali untuk dibagikan; PIN tidak dapat dilihat lagi setelahnya (hanya di-reset).

### US-22 — Mengekspor data
**Sebagai** peneliti, **saya ingin** mengekspor data proses belajar ke CSV, **agar** dapat dianalisis di spreadsheet atau perangkat statistik.

- **AC1** Ekspor tersedia per kelas untuk: percobaan aktivitas, respons per langkah, penggunaan petunjuk, refleksi, dan jawaban asesmen.
- **AC2** File menggunakan kode siswa, bukan identitas asli.
- **AC3** Hanya pengguna dengan peran peneliti yang dapat mengekspor.

### US-23 — Cek prasyarat *(Should)*
**Sebagai** siswa, **saya ingin** mengecek kesiapan prasyarat secara singkat, **agar** saya tahu bagian mana yang perlu disegarkan.

- **AC1** Cek terdiri atas ≤ 6 butir (Kartesius, operasi tanda, pecahan).
- **AC2** Hanya bagian yang salah yang menawarkan penyegar singkat.

### US-24 — Menilai jawaban dengan rubrik *(Should)*
**Sebagai** peneliti, **saya ingin** menilai jawaban terbuka per indikator rubrik di dalam aplikasi, **agar** penilaian lebih cepat dan konsisten.

- **AC1** Peneliti melihat jawaban siswa tanpa kode siswa (penilaian buta) secara default.
- **AC2** Skor 0–3 per indikator tersimpan beserta catatan dan identitas penilai.

### US-25 — Sinkronisasi setelah online *(Should)*
**Sebagai** siswa, **saya ingin** jawaban latihan saya saat offline terkirim otomatis ketika online, **agar** progres saya tidak hilang.

- **AC1** Respons latihan offline disimpan di antrean lokal (IndexedDB).
- **AC2** Ketika koneksi kembali, antrean dikirim dan status "Tersinkron" ditampilkan.
- **AC3** Pengiriman ulang tidak menimbulkan data ganda (idempoten via `client_id`).

### US-26 — Riwayat belajar *(Could)*
**Sebagai** siswa, **saya ingin** melihat riwayat percobaan dan refleksi saya, **agar** saya bisa melihat perkembangan diri.

- **AC1** Riwayat menampilkan unit, tanggal, jumlah petunjuk, dan refleksi yang ditulis.
