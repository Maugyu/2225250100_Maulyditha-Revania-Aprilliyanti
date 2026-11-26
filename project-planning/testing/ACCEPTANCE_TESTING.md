# Acceptance Testing

> **Dokumen terkait:** [../USER_STORIES.md](../USER_STORIES.md) · [../PRD.md](../PRD.md) §10 · [TESTING_STRATEGY.md](TESTING_STRATEGY.md)
>
> Skenario diturunkan dari acceptance criteria user stories. Kolom **Hasil** diisi saat pengujian (Lulus / Gagal + catatan). Perangkat minimal: 1 HP Android (Chrome) + 1 laptop (Chrome).

---

## 1. Prasyarat Pengujian

- Backend & frontend berjalan (lokal HTTPS atau lingkungan uji daring).
- Konten U1–U6 dan asesmen paket A di-seed.
- Akun: `UJI-01`, `UJI-02` (siswa, kelas `UJI`), `PENELITI-UJI` (peneliti).
- Asesmen paket A dibuka untuk kelas `UJI`.

## 2. Skenario

### Epik A — Akses dan Navigasi

| ID | US | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AT-01 | US-01 | Masuk dengan `UJI-01` + PIN benar. | Beranda tampil. | |
| AT-02 | US-01 | Masuk dengan PIN salah. | Pesan "Kode atau PIN belum tepat"; kode tetap terisi. | |
| AT-03 | US-01 | Periksa formulir masuk. | Tidak ada isian nama/email/HP. | |
| AT-04 | US-01 | Salah PIN 6× berturut-turut. | Percobaan ke-6 ditolak dengan pesan pembatasan. | |
| AT-05 | US-02 | Pengguna baru membuka Beranda. | Tombol "Mulai belajar" → U1 (atau U0 bila aktif). | |
| AT-06 | US-02 | Keluar di langkah 3 U2, masuk lagi, tekan "Lanjutkan belajar". | Terbuka langkah 3 U2. | |
| AT-07 | US-02 | Hitung tombol `primary` di Beranda. | Tepat satu. | |
| AT-08 | US-03 | Buka Peta Unit. | Setiap unit menampilkan judul, tujuan, status; unit disarankan ditandai. | |

### Epik B — Eksplorasi dan Representasi

| ID | US | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AT-09 | US-04 | Buka aktivitas mana pun. | Satu langkah per layar; "Langkah n dari N" terlihat. | |
| AT-10 | US-04 | Isi jawaban, tekan Lanjut, lalu Kembali. | Jawaban sebelumnya masih ada. | |
| AT-11 | US-05 | Geser slider $m$ dari 2 ke −1. | Garis berubah dari naik ke turun; teks persamaan berubah seketika. | |
| AT-12 | US-05 | Fokus slider dengan Tab, tekan panah kanan. | Nilai $m$ bertambah satu langkah. | |
| AT-13 | US-05 | Mode pesawat, buka langkah Penjelajah U2 (sudah di-prefetch). | Penjelajah berfungsi. | |
| AT-14 | US-06 | Mode dua garis: atur $m_1 = 2$, $m_2 = 2$. | Label "sejajar". | |
| AT-15 | US-06 | Atur $m_1 = 2$, $m_2 = -\frac{1}{2}$. | $m_1 \times m_2 = -1$; label "tegak lurus" + penanda siku; sudut tampak siku (skala 1:1). | |
| AT-16 | US-07 | Plot titik dari tabel; ketuk dekat (2,9; 5,1). | Titik menempel ke (3, 5). | |
| AT-17 | US-07 | Ketuk titik yang salah. | Titik terhapus. | |
| AT-18 | US-07 | Plot semua titik benar. | Garis muncul + pertanyaan pengamatan. | |
| AT-19 | US-08 | Mode baca level 1: ketuk titik potong grid pada garis. | Koordinat tampil. | |
| AT-20 | US-08 | Mode baca level 3. | Tidak ada sorotan; siswa mengetik koordinat. | |

### Epik C — Prosedur dan Masalah Kontekstual

| ID | US | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AT-21 | US-09 | Buka contoh terbimbing U4. | Label langkah; bagian berubah disorot; langkah sebelumnya tetap terlihat. | |
| AT-22 | US-09 | Lanjut ke completion problem. | Satu baris berupa input. | |
| AT-23 | US-10 | Masalah U3: tandai semua frasa termasuk "perpustakaan". | Umpan balik menyebut ada informasi yang tidak diperlukan. | |
| AT-24 | US-10 | Isi Diketahui–Ditanya. | Baris dapat ditambah/dihapus; tersimpan. | |
| AT-25 | US-11 | Isi $m = 5000$, $c = 2500$. | Umpan balik `M_C_SWAP`. | |
| AT-26 | US-11 | Isi $m$ = `5/2` pada soal yang kuncinya 2,5. | Diterima sebagai benar. | |
| AT-27 | US-12 | Setelah model benar, langkah cek balik. | Diminta menghitung $y$ untuk titik diketahui; perbandingan ditampilkan. | |
| AT-28 | US-13 | Langkah tafsir & evaluasi. | Kotak teks tampil; jawaban tersimpan (cek DB/ekspor). | |
| AT-29 | US-14 | Tekan Petunjuk tiga kali. | Level 1 → 2 → 3 berurutan; level 3 bukan jawaban akhir. | |
| AT-30 | US-14 | Cek data respons. | `hint_level_max = 3`. | |
| AT-31 | US-15 | Hitung gradien, jawab −2 untuk kunci 2. | Pesan "periksa tanda". | |
| AT-32 | US-15 | Salah 2× pada langkah sama. | Petunjuk level 1 ditawarkan. | |
| AT-33 | US-15 | Salah 3×. | Tombol "Lihat pembahasan" muncul. | |
| AT-34 | US-16 | Ketuk istilah "gradien". | Popover ≤ 2 kalimat; halaman tidak berpindah. | |
| AT-35 | US-17 | Akhir U2: tulis penjelasan + keyakinan 3. | Tersimpan; ringkasan pola langkah tampil setelahnya. | |
| AT-36 | US-17 | Tekan "Lewati". | Tercatat `skipped = true`. | |

### Epik D — Asesmen dan PWA

| ID | US | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AT-37 | US-18 | Kerjakan asesmen. | Tanpa petunjuk, tanpa benar/salah. | |
| AT-38 | US-18 | Isi butir 1, tutup tab, buka lagi. | Jawaban butir 1 masih ada. | |
| AT-39 | US-18 | Kirim, lalu coba ubah. | Tidak dapat diubah. | |
| AT-40 | US-18 | Periksa respons jaringan asesmen. | Tidak ada `answer_key`. | |
| AT-41 | US-18 | Buka asesmen saat offline. | Pesan "Sambungkan internet". | |
| AT-42 | US-19 | Chrome Android → Instal. | Ikon & nama benar; terbuka standalone. | |
| AT-43 | US-19 | Buka di Safari iOS (bila ada). | Panduan "Tambahkan ke Layar Utama". | |
| AT-44 | US-20 | Mode pesawat → buka aplikasi terinstal. | Beranda & unit ter-cache terbuka; banner offline. | |
| AT-45 | US-20 | Offline, ketik jawaban, tutup aplikasi, buka lagi. | Draf masih ada. | |

### Epik E — Peneliti

| ID | US | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AT-46 | US-21 | Jalankan CLI `create-students --class UJI --count 5`. | CSV 5 kode + PIN; DB berisi hash. | |
| AT-47 | US-22 | Peneliti ekspor `step_responses` kelas UJI. | CSV terunduh dengan kolom `username`, tanpa identitas asli. | |
| AT-48 | US-22 | Siswa mencoba URL ekspor. | 403. | |
| AT-49 | — | Peneliti menutup asesmen; siswa membuka. | Asesmen tidak dapat dimulai. | |

### Should / Could (diuji bila diimplementasikan)

| ID | US | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|---|
| AT-50 | US-23 | Kerjakan cek prasyarat, salah pada butir pecahan. | Hanya penyegar pecahan ditawarkan. | |
| AT-51 | US-24 | Peneliti membuka antrean penilaian buta. | Tanpa kode siswa; skor 0–3 tersimpan. | |
| AT-52 | US-25 | Offline jawab 3 langkah → online. | Terkirim; tidak ada duplikat di DB. | |
| AT-53 | US-26 | Buka riwayat. | Unit, tanggal, petunjuk, refleksi tampil. | |

## 3. Kriteria Penerimaan MVP

MVP diterima bila **AT-01 s.d. AT-49 lulus** (atau penyimpangan minor disetujui pemilik dan dicatat), ditambah butir PRD §10 nomor 3–6.

## 4. Pencatatan Hasil

| Tanggal | Penguji | Perangkat/Browser | Versi aplikasi | Lulus | Gagal | Catatan |
|---|---|---|---|---|---|---|
| | | | | | | |
