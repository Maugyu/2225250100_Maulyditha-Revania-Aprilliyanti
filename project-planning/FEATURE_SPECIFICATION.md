# Feature Specification

> **Dokumen terkait:** [PRD.md](PRD.md) · [USER_STORIES.md](USER_STORIES.md) · [education/LEARNING_DESIGN.md](education/LEARNING_DESIGN.md) · [design/WIREFRAME_SPECIFICATION.md](design/WIREFRAME_SPECIFICATION.md) · [technical/API_SPECIFICATION.md](technical/API_SPECIFICATION.md)

---

## 1. Ringkasan Prioritas

| ID | Fitur | MoSCoW | Kompleksitas teknis | Manfaat pedagogis | Rekomendasi wawancara |
|---|---|---|---|---|---|
| F-01 | Masuk (kode siswa + PIN) | Must | Rendah | Prasyarat pencatatan bukti | — |
| F-02 | Beranda siswa | Must | Rendah | Mengurangi kebingungan navigasi | R-21 |
| F-03 | Peta modul & unit | Must | Rendah | Struktur bertahap | R-08 |
| F-04 | Pemutar aktivitas bertahap | Must | Sedang | Segmenting, learner pacing | R-06, R-14 |
| F-05 | Penjelajah Gradien | Must | Sedang | Jembatan representasi | R-04, R-20 |
| F-06 | Plot & baca titik di grid | Must | Sedang | Konstruksi representasi | R-05, R-11, R-15 |
| F-07 | Contoh terbimbing bertahap | Must | Rendah–Sedang | Worked example + fading | R-06, R-14 |
| F-08 | Masalah kontekstual F–E–I | Must | Sedang | Inti literasi matematika | R-12, R-16 |
| F-09 | Petunjuk bertingkat | Must | Rendah | Scaffolding | R-17 |
| F-10 | Umpan balik terarah | Must | Sedang | Koreksi spesifik | R-09 |
| F-11 | Glosarium inline | Must | Rendah | Menurunkan ECL bahasa | R-10 |
| F-12 | Refleksi & jelaskan | Must | Rendah | Self-explanation | R-18, R-19 |
| F-13 | Progres per unit | Must | Rendah | Orientasi | — |
| F-14 | Asesmen literasi | Must | Sedang | Bukti evaluasi | — |
| F-15 | Akun massal & ekspor CSV | Must | Rendah | Kebutuhan penelitian | — |
| F-16 | PWA (instal + offline konten) | Must | Sedang | Akses | Asumsi A-01 |
| F-17 | Cek prasyarat | Should | Rendah | Mengelola ICL | R-07 |
| F-18 | Penilaian rubrik di aplikasi | Should | Sedang | Efisiensi peneliti | — |
| F-19 | Antrean sinkronisasi offline | Should | Sedang–Tinggi | Akses | Asumsi A-01 |
| F-20 | Riwayat belajar | Could | Rendah | Refleksi perkembangan | — |
| F-21 | Tema gelap & ukuran huruf | Could | Rendah | Aksesibilitas | — |

## 2. Diagram Ketergantungan Fitur

```
F-01 Masuk ──┬──> F-02 Beranda ──> F-03 Peta Unit ──> F-04 Pemutar Aktivitas
             │                                             │
             │            ┌────────────────┬───────────────┼───────────────┬──────────────┐
             │            ▼                ▼               ▼               ▼              ▼
             │       F-05 Penjelajah  F-06 Grid      F-07 Contoh     F-08 Masalah    F-12 Refleksi
             │                                        Terbimbing      Kontekstual
             │                                             │               │
             │                                             └──────┬────────┘
             │                                                    ▼
             │                                     F-09 Petunjuk + F-10 Umpan Balik + F-11 Glosarium
             │
             ├──> F-13 Progres (butuh data percobaan dari F-04)
             ├──> F-14 Asesmen ──> F-18 Rubrik (Should)
             └──> F-15 Ekspor (butuh data F-04, F-12, F-14)

F-16 PWA: lapisan lintas fitur (app shell + cache konten) ──> F-19 Antrean sinkronisasi (Should)
```

---

## 3. Spesifikasi Detail

### F-01 — Masuk (Kode Siswa + PIN)

| Aspek | Spesifikasi |
|---|---|
| Tujuan | Mengidentifikasi siswa dengan pseudonim agar progres & bukti tersimpan. |
| Input | `kode_pengguna` (format contoh `KLS8A-07`), `pin` (6 digit). |
| Aturan | Tidak ada pendaftaran mandiri. Akun dibuat peneliti (F-15). Pembatasan percobaan: 5 gagal/15 menit per kode. |
| Keluaran | Token akses (JWT) berlaku 8 jam; profil minimal (`kode_pengguna`, `peran`, `kelas`). |
| Alur | Buka aplikasi → layar Masuk → isi kode & PIN → Beranda. |
| Kesalahan | Pesan generik "Kode atau PIN belum tepat"; pesan pembatasan percobaan. |
| Ketergantungan | API `POST /auth/login`. |

### F-02 — Beranda Siswa

- Menampilkan sapaan dengan kode/nama samaran, **satu** tombol utama "Lanjutkan belajar"/"Mulai belajar", dan ringkasan progres (misal "3 dari 6 unit selesai").
- Tautan sekunder: "Lihat semua unit", "Asesmen" (bila dibuka peneliti).
- Tidak ada ilustrasi dekoratif (R-13).

### F-03 — Peta Modul & Unit

- Daftar vertikal unit U0–U6 dengan judul, satu kalimat tujuan, status, dan penanda "disarankan berikutnya".
- Unit tidak dikunci (default, **TBD-08**).

### F-04 — Pemutar Aktivitas Bertahap

Komponen inti yang memutar aktivitas dari data JSON (lihat skema konten di [technical/DATABASE_SCHEMA.md](technical/DATABASE_SCHEMA.md) §5).

| Aspek | Spesifikasi |
|---|---|
| Struktur layar | Kepala (judul unit + "Langkah n dari N") · Area langkah · Bilah aksi bawah (Kembali · aksi utama · Petunjuk). |
| Jenis langkah | `info`, `explore_slope`, `explore_two_lines`, `plot_points`, `read_point`, `worked_example`, `completion`, `identify_info`, `known_asked`, `define_variables`, `linear_model`, `numeric`, `choice`, `check_back`, `interpret`, `evaluate`, `explain`, `reflection`. |
| Perilaku | Langkah berikutnya terbuka setelah langkah wajib dijawab benar **atau** setelah siswa memilih "Lihat pembahasan" setelah 3 kali mencoba (agar tidak macet). |
| Penyimpanan | Setiap jawaban dikirim ke `POST /attempts/{id}/responses`; draf disimpan di `localStorage`/IndexedDB. |
| Catatan beban kognitif | Satu langkah per layar (segmenting); tombol aksi utama tunggal (R-21). |

### F-05 — Penjelajah Gradien

| Mode | Perilaku |
|---|---|
| **Satu garis** | Slider $m$ (−5 s.d. 5, langkah 0,5 atau daftar pecahan yang ditentukan konten) dan $c$ (−10 s.d. 10, langkah 1). Grafik + persamaan diperbarui bersamaan. Opsional: segitiga "naik/jalan" (rise/run) ditampilkan untuk memvisualkan $\frac{\Delta y}{\Delta x}$. |
| **Dua garis** | Dua set slider ($m_1, c_1$, $m_2, c_2$). Panel status: $m_1$, $m_2$, $m_1 \times m_2$, label "sejajar" / "tegak lurus" / "berpotongan" + titik potong. |
| **Kontekstual** | Sumbu diberi label konteks (misal "Jarak (km)" dan "Biaya (Rp ribu)"); domain dibatasi sesuai konteks (misal $x \ge 0$). |

- Rendering: SVG kustom (lihat ADR-005 di [technical/ADR.md](technical/ADR.md)).
- Aksesibilitas: slider memakai `<input type="range">` berlabel; nilai diumumkan ke pembaca layar.
- Rasio sumbu 1:1 pada mode dua garis.

### F-06 — Plot & Baca Titik di Grid

- **Mode plot:** siswa diberi tabel nilai; mengetuk grid untuk menempatkan titik (snap ke bilangan bulat). Setelah semua titik benar → garis digambar → pertanyaan pengamatan.
- **Mode baca:** grafik garis ditampilkan; siswa memilih dua titik yang dilalui garis. Tingkat bantuan (fading):
  1. Titik potong grid yang dilalui garis disorot dan menampilkan koordinat saat diketuk.
  2. Titik disorot, koordinat diketik siswa.
  3. Tanpa sorotan; siswa memilih dan mengetik koordinat.

### F-07 — Contoh Terbimbing Bertahap

- Urutan: **contoh penuh** → **completion problem** (1–2 langkah kosong) → **soal mandiri**.
- Tiap langkah memiliki label tujuan, ekspresi matematika (KaTeX), dan sorotan bagian yang berubah.
- Tombol "Langkah berikutnya" dikendalikan siswa (R-14).

### F-08 — Masalah Kontekstual Berstruktur F–E–I

Urutan langkah baku (dapat di-fading di unit akhir):

| Proses PISA | Langkah | Jenis langkah |
|---|---|---|
| Formulate | 1. Baca situasi (teks ≤ 80 kata). | `info` |
| Formulate | 2. Tandai informasi penting. | `identify_info` |
| Formulate | 3. Isi Diketahui & Ditanya. | `known_asked` |
| Formulate | 4. Tentukan arti variabel $x$ dan $y$. | `define_variables` |
| Formulate | 5. Susun model $y = [m]x + [c]$. | `linear_model` |
| Employ | 6. Hitung nilai yang ditanyakan. | `numeric` |
| Employ/Evaluate | 7. Cek balik dengan titik yang diketahui. | `check_back` |
| Interpret | 8. Tafsirkan hasil dalam konteks. | `interpret` |
| Evaluate | 9. Evaluasi kewajaran / batasan model. | `evaluate` |

### F-09 — Petunjuk Bertingkat

| Level | Isi | Contoh (menyusun persamaan dari dua titik) |
|---|---|---|
| 1 — Arahan | Pertanyaan pemantik. | "Apa yang perlu kamu cari lebih dulu sebelum menulis persamaan?" |
| 2 — Strategi | Menyebut strategi/rumus yang relevan. | "Gunakan $m = \frac{y_2-y_1}{x_2-x_1}$ dengan dua titik yang diketahui." |
| 3 — Langkah contoh | Menunjukkan langkah pertama dengan angka soal, tanpa jawaban akhir. | "$m = \frac{7-3}{4-2} = \dots$" |

Penggunaan dicatat (`hint_level_max`) sebagai data proses, **bukan** sebagai pengurang nilai.

### F-10 — Umpan Balik Terarah

- **Benar:** konfirmasi singkat + satu kalimat makna ("Benar. Setiap 1 km, biaya bertambah Rp2.500.").
- **Salah, pola dikenali:** pesan spesifik dari katalog kesalahan:

| Kode | Pola | Pesan |
|---|---|---|
| `SIGN_FLIP` | Nilai absolut benar, tanda terbalik. | "Nilainya sudah tepat, coba periksa tanda positif/negatifnya." |
| `ORDER_MISMATCH` | Pembilang $y_2-y_1$ tetapi penyebut $x_1-x_2$. | "Urutan titik di atas dan di bawah harus sama." |
| `RECIPROCAL` | Menjawab $\frac{1}{m}$ alih-alih $-\frac{1}{m}$ (tegak lurus). | "Garis tegak lurus: kebalikan **dan** lawan tanda." |
| `M_C_SWAP` | $m$ dan $c$ tertukar dalam konteks. | "Mana yang berubah per satuan, mana yang nilai awal?" |
| `XY_SWAP` | Koordinat $(x, y)$ tertukar. | "Ingat: $(x, y)$ — mendatar dulu, lalu tegak." |
| `ARITH` | Salah hitung lain. | "Periksa kembali perhitunganmu di langkah ini." |
| `IRRELEVANT_SELECTED` | Menandai informasi yang tidak diperlukan (langkah `identify_info`). | "Ada bagian yang kamu tandai tapi tidak dipakai untuk menjawab. Coba cek lagi." |
| `MISSED_INFO` | Informasi penting belum ditandai. | "Masih ada informasi penting yang belum ditandai." |

- **Salah, pola tidak dikenali:** pesan umum + tawaran petunjuk.
- Pemeriksaan latihan dilakukan di klien (agar berjalan offline); hasilnya dikirim ke server sebagai catatan. Asesmen diperiksa di server.

### F-11 — Glosarium Inline

- Istilah ditandai di konten dengan sintaks `[[gradien]]`.
- Ketuk → popover ≤ 2 kalimat + contoh singkat. Contoh: **Gradien** — "Seberapa curam garis. Dihitung dari perubahan naik-turun dibagi perubahan ke kanan."
- Daftar istilah awal: koordinat, sumbu, gradien, konstanta, sejajar, tegak lurus, titik potong, substitusi, variabel, model matematika.

### F-12 — Refleksi & "Jelaskan dengan Bahasamu"

- Prompt di akhir unit, misal: "Temanmu bingung kenapa garis $y = -2x + 1$ turun. Jelaskan dengan kalimatmu sendiri."
- Skala keyakinan 1–4 ("belum yakin" s.d. "sangat yakin").
- Ringkasan "Pola langkah" unit ditampilkan **setelah** siswa menulis penjelasan (R-19).

### F-13 — Progres per Unit

- Status unit dihitung dari aktivitas: `not_started`, `in_progress`, `completed` (semua aktivitas wajib selesai).
- Tidak menampilkan skor persentase di beranda (menghindari fokus pada nilai — keputusan desain, dapat ditinjau).

### F-14 — Asesmen Literasi (Pretes/Postes)

- Dua paket paralel (pretes & postes) berisi masalah kontekstual F–E–I; butir dirancang di [education/ASSESSMENT_RUBRIC.md](education/ASSESSMENT_RUBRIC.md).
- Dibuka/ditutup oleh peneliti (`is_active`).
- Tanpa petunjuk, umpan balik, maupun glosarium di butir asesmen (**TBD**: glosarium boleh/tidak — rekomendasi: boleh, karena tujuan asesmen bukan mengukur kosakata).
- Autosave per butir; kirim akhir mengunci jawaban.

### F-15 — Akun Massal & Ekspor CSV

- Pembuatan akun melalui skrip CLI backend (`python -m app.cli create-students --class KLS8A --count 30`) yang menghasilkan CSV kode + PIN.
- Ekspor melalui endpoint peneliti `GET /researcher/export/{dataset}.csv?class_code=`.

### F-16 — PWA

Lihat [technical/PWA_SPECIFICATION.md](technical/PWA_SPECIFICATION.md). Ringkasnya: manifest, service worker (vite-plugin-pwa/Workbox), precache app shell, cache konten modul, banner offline, prompt pembaruan.

### F-17 s.d. F-21 (Should/Could)

| ID | Ringkasan |
|---|---|
| F-17 | Cek prasyarat ≤ 6 butir; penyegar hanya untuk bagian yang salah. |
| F-18 | **v0.1: sudah diimplementasikan.** Panel peneliti: daftar jawaban terbuka (buta kode siswa), formulir skor 0–3 per indikator + catatan. |
| F-19 | Antrean respons latihan; kirim saat `online`; idempoten via `client_id` UUID. **v0.1: sudah diimplementasikan versi sederhana** (localStorage, kirim berurutan ke endpoint biasa; `/sync/batch` belum dibuat). |
| F-20 | Linimasa percobaan dan refleksi siswa. |
| F-21 | Tema gelap dan pengaturan ukuran huruf (3 tingkat). |

## 4. Fitur yang Sengaja Tidak Dibuat

| Fitur | Alasan |
|---|---|
| Poin, lencana, papan peringkat | Tidak ada data kebutuhan; berisiko menambah distraksi (EL03) dan menggeser fokus ke skor. |
| Iklan | Ditolak eksplisit oleh siswa (DS03). |
| Video penjelasan | Tidak ada data preferensi; informasi transien berisiko serupa EL04; biaya produksi tinggi. |
| Tutor AI/chatbot | Kompleksitas, biaya, dan risiko keakuratan; di luar kapasitas S1. |
| Input persamaan bebas | Parser & pemeriksaan ekuivalensi menambah kompleksitas; input terstruktur cukup untuk tujuan MVP. |
