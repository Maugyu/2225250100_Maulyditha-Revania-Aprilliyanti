# Architecture Decision Records (ADR)

> **Dokumen terkait:** [ARCHITECTURE.md](ARCHITECTURE.md) · [../development/CLAUDE.md](../development/CLAUDE.md)
>
> Format setiap ADR: **Konteks → Keputusan → Alternatif → Konsekuensi**. Status: *Diterima*, *Diusulkan*, *Diganti*. Keputusan baru ditambahkan di akhir; ADR lama tidak dihapus, hanya diberi status *Diganti oleh ADR-xxx*.

---

## Ringkasan

| ID | Judul | Status |
|---|---|---|
| ADR-001 | Arsitektur SPA + REST API terpisah | Diterima |
| ADR-002 | SQLAlchemy + Alembic untuk portabilitas SQLite → PostgreSQL | Diterima |
| ADR-003 | JavaScript (bukan TypeScript) di frontend | Diterima |
| ADR-004 | Tanpa pustaka state global; `fetch` wrapper sederhana | Diterima |
| ADR-005 | Grafik dengan komponen SVG kustom | Diterima |
| ADR-006 | KaTeX untuk menampilkan ekspresi matematika | Diterima |
| ADR-007 | `vite-plugin-pwa` (Workbox) untuk service worker | Diterima |
| ADR-008 | JWT Bearer disimpan di `localStorage` | Diterima |
| ADR-009 | Pemeriksaan jawaban latihan di klien, asesmen di server | Diterima |
| ADR-010 | Konten pembelajaran sebagai file JSON yang di-*seed* | Diterima |
| ADR-011 | CSS Modules + design token, tanpa framework CSS | Diterima |
| ADR-012 | Input persamaan terstruktur $y = [m]x + [c]$ | Diterima |
| ADR-013 | Akun dibuat via CLI, tanpa pendaftaran mandiri | Diterima |
| ADR-014 | Hosting produksi | **Diusulkan (TBD-05)** |
| ADR-015 | Gaya visual referensi + maskot Gari; dekorasi hanya di halaman depan | Diterima |
| ADR-016 | AI Gemini hanya untuk peneliti (bukan siswa) | Diganti sebagian oleh ADR-018 |
| ADR-017 | Beranda bersidebar seperti referensi + 12 skin Gari, tanpa XP | Diterima |
| ADR-018 | "Tanya Gari" AI untuk siswa dengan pendampingan orang tua | Diterima (keputusan pemilik) |
| ADR-019 | Integrasi Rigorous Mathematical Thinking (RMT) | Diterima |

---

## ADR-001 — Arsitektur SPA + REST API terpisah

- **Konteks:** Ketentuan proyek menetapkan React + Vite (frontend) dan FastAPI (backend) dengan pemisahan jelas. Pengembang tunggal (mahasiswa S1).
- **Keputusan:** Dua aplikasi terpisah dalam satu repositori (*monorepo* sederhana: `frontend/`, `backend/`), berkomunikasi lewat REST JSON `/api/v1`.
- **Alternatif:** (a) FastAPI melayani file statis frontend sekaligus — lebih sedikit layanan, tetapi mengaburkan pemisahan; dapat dipakai sebagai opsi deployment. (b) Microservices — berlebihan.
- **Konsekuensi:** Perlu CORS di produksi; dua proses saat pengembangan; pemisahan memudahkan pengujian masing-masing.

## ADR-002 — SQLAlchemy + Alembic

- **Konteks:** SQLite di awal, harus dapat bermigrasi ke PostgreSQL.
- **Keputusan:** SQLAlchemy 2.x ORM, tipe kolom portabel, migrasi Alembic, `PRAGMA foreign_keys=ON` untuk SQLite.
- **Alternatif:** SQLModel (lebih ringkas, berbasis SQLAlchemy + Pydantic) — layak, tetapi menambah lapisan abstraksi dan dokumentasi yang lebih sedikit; raw SQL — tidak portabel.
- **Konsekuensi:** Kurva belajar ORM; manfaat: ganti basis data cukup lewat `DATABASE_URL`.

## ADR-003 — JavaScript, bukan TypeScript

- **Konteks:** Ketentuan teknologi menyebut JavaScript.
- **Keputusan:** JavaScript (ES2022+, modul ES). JSDoc dipakai untuk fungsi penting (checker, util matematika) agar editor tetap memberi bantuan tipe.
- **Alternatif:** TypeScript — keamanan tipe lebih baik, tetapi di luar ketentuan dan menambah kompleksitas.
- **Konsekuensi:** Tes unit lebih penting untuk menangkap kesalahan tipe.

## ADR-004 — Tanpa pustaka state global

- **Konteks:** Jumlah state global kecil (sesi pengguna, status online).
- **Keputusan:** React Context untuk sesi & status koneksi; modul `lib/api` berbasis `fetch` dengan penanganan token & galat terpusat.
- **Alternatif:** Redux/Zustand, TanStack Query — bermanfaat untuk aplikasi besar; dapat ditambahkan bila kebutuhan caching data server bertambah.
- **Konsekuensi:** Bundel lebih kecil, lebih mudah dipahami.

## ADR-005 — Grafik dengan SVG kustom

- **Konteks:** Penjelajah Gradien, plot titik, dua garis (DS01, GL01, IL01). Butuh ringan, bekerja offline, tampilan bersih (EL03), dan kendali penuh atas interaksi (snap, sorotan).
- **Keputusan:** Komponen SVG kustom (`GraphCanvas`) dengan transformasi koordinat sederhana.
- **Alternatif:** JSXGraph (kuat untuk geometri dinamis, tetapi bundel lebih besar & gaya bawaan), pustaka chart umum (tidak cocok untuk manipulasi garis), embed kalkulator grafik pihak ketiga (ketergantungan eksternal, butuh online, tampilan tidak dapat dikendalikan, potensi distraksi).
- **Konsekuensi:** Perlu menulis dan menguji logika koordinat sendiri — namun cakupannya terbatas (garis lurus, titik, grid).

## ADR-006 — KaTeX

- **Konteks:** Ekspresi seperti $m = \frac{y_2-y_1}{x_2-x_1}$ perlu tampil rapi, termasuk offline.
- **Keputusan:** KaTeX (dibundel, font di-precache).
- **Alternatif:** MathJax (lebih lengkap, lebih berat); HTML/CSS manual (pecahan sulit dirapikan).
- **Konsekuensi:** Menambah ukuran bundel (CSS + font); dimuat sekali dan di-cache.

## ADR-007 — vite-plugin-pwa

- **Konteks:** Butuh manifest, service worker, precache, runtime caching.
- **Keputusan:** `vite-plugin-pwa` mode `generateSW`, `registerType: "prompt"`.
- **Alternatif:** Service worker manual — kendali penuh, rawan kesalahan versi cache; `injectManifest` — dipakai bila nanti butuh logika SW khusus.
- **Konsekuensi:** Konfigurasi deklaratif; strategi caching didokumentasikan di [PWA_SPECIFICATION.md](PWA_SPECIFICATION.md).

## ADR-008 — JWT Bearer di `localStorage`

- **Konteks:** Frontend & backend dapat berbeda domain; PWA perlu tetap login setelah dibuka ulang.
- **Keputusan:** JWT berumur 8 jam, dikirim via header `Authorization`, disimpan di `localStorage`.
- **Alternatif:** Cookie `HttpOnly` + `SameSite` — lebih tahan XSS, tetapi lintas domain memerlukan `SameSite=None; Secure` + CSRF handling, lebih kompleks; layak dipertimbangkan bila frontend & backend disajikan dari domain yang sama.
- **Konsekuensi:** Risiko pencurian token via XSS → mitigasi CSP ketat, tanpa HTML mentah dari pengguna, tanpa skrip pihak ketiga.

## ADR-009 — Pemeriksaan latihan di klien, asesmen di server

- **Konteks:** Latihan harus memberi umpan balik instan dan bekerja offline; asesmen harus menjaga kerahasiaan kunci.
- **Keputusan:** Kunci & pola kesalahan latihan dikirim bersama konten; pemeriksaan di `lib/checkers`. Asesmen: kunci hanya di server; skor otomatis dihitung saat submit.
- **Alternatif:** Semua pemeriksaan di server — tidak bekerja offline dan menambah latensi.
- **Konsekuensi:** Siswa yang teknis dapat melihat kunci latihan — dapat diterima karena latihan formatif dan tidak dinilai. Data `is_correct` latihan berasal dari klien; untuk analisis penelitian, peneliti dapat menghitung ulang dari `response` mentah.

## ADR-010 — Konten sebagai file JSON yang di-*seed*

- **Konteks:** Konten akan sering direvisi oleh pemilik proyek (ahli pendidikan matematika), harus terpisah dari kode komponen.
- **Keputusan:** Konten di `backend/content/pgl/*.json`, divalidasi Pydantic, dimuat ke DB lewat `python -m app.cli seed-content`. `content_version` dinaikkan setiap revisi.
- **Alternatif:** CMS/antarmuka admin konten — terlalu kompleks untuk MVP; konten di-hardcode di React — sulit direvisi dan dianalisis.
- **Konsekuensi:** Revisi konten = edit JSON + seed ulang; riwayat perubahan konten tercatat di Git.

## ADR-011 — CSS Modules + design token

- **Konteks:** Ketentuan CSS3; desain visual final menyusul (TBD-02).
- **Keputusan:** Token di `tokens.css` (custom properties), gaya komponen di CSS Modules.
- **Alternatif:** Tailwind — cepat, tetapi menambah alat dan menjauh dari ketentuan "CSS3"; CSS-in-JS — beban runtime.
- **Konsekuensi:** Mengganti tema visual cukup dengan mengubah token.

## ADR-012 — Input persamaan terstruktur

- **Konteks:** Pemeriksaan persamaan bebas memerlukan parser dan uji ekuivalensi aljabar.
- **Keputusan:** Input `y = [m]x + [c]` dengan dukungan pecahan `a/b`, desimal koma/titik, dan tanda negatif.
- **Alternatif:** Input bebas + parser (misal math.js) — kompleks, bundel lebih besar.
- **Konsekuensi:** Mengurangi beban ekstraneous mengetik notasi (sejalan EL05/DS03), tetapi tidak melatih menulis persamaan bentuk lain (misal $ax + by = c$). Dapat ditambah setelah MVP.

## ADR-013 — Akun via CLI

- **Konteks:** Siswa di bawah umur; minimisasi data; uji coba terkendali.
- **Keputusan:** Akun dibuat peneliti lewat CLI; tidak ada endpoint pendaftaran.
- **Alternatif:** Pendaftaran mandiri dengan kode kelas — lebih fleksibel, tetapi membuka risiko data tak terkendali.
- **Konsekuensi:** Peneliti harus membagikan kode & PIN secara manual.

## ADR-014 — Hosting produksi *(Diusulkan)*

- **Konteks:** SQLite membutuhkan disk persisten; PWA membutuhkan HTTPS; anggaran mahasiswa.
- **Opsi:**
  1. Frontend di hosting statis + backend di VPS kecil (disk persisten, HTTPS via reverse proxy & Let's Encrypt). Kendali penuh, perlu administrasi server.
  2. Frontend di hosting statis + backend di PaaS + PostgreSQL terkelola. Administrasi minimal; perlu cek batasan paket gratis (tidur otomatis, kuota).
  3. Satu VPS menjalankan keduanya (FastAPI melayani `dist/`).
- **Rekomendasi sementara:** Opsi 2 bila PaaS menyediakan PostgreSQL yang memadai; Opsi 1/3 bila ingin tetap SQLite.
- **Status:** Menunggu keputusan pemilik proyek (TBD-05).

## ADR-015 — Gaya visual referensi + maskot Gari

- **Konteks:** Pemilik memberi referensi desain (landing bergaya pastel dengan maskot dan ornamen) dan meminta maskot bebek kuning sebagai ikon sekaligus "asisten". Prinsip PP-03 melarang dekorasi tanpa informasi (dasar: EL03, DS03).
- **Keputusan:** (1) Tata letak & gaya mengikuti referensi, dengan identitas sendiri (nama JelajahGaris, maskot Gari yang digambar sebagai SVG orisinal). (2) Ornamen dekoratif (garis meliuk, bintang, animasi maskot) **hanya di halaman depan**. (3) Di halaman belajar, Gari hanya muncul dengan fungsi: pemberi petunjuk (HintPanel), refleksi, dan status kosong/memuat. (4) Gari **bukan** chatbot AI; petunjuknya berasal dari konten yang ditulis peneliti.
- **Alternatif:** Menerapkan dekorasi di semua halaman — ditolak karena bertentangan dengan temuan EL03.
- **Konsekuensi:** Halaman depan menarik bagi siswa, sementara layar belajar tetap minim distraksi. Perlu dievaluasi pada uji coba (EVALUATION_PLAN tema T5).

## ADR-016 — AI Gemini hanya untuk peneliti

- **Konteks:** Pemilik meminta integrasi AI dengan Gemini API. Ketentuan Gemini API mensyaratkan pengguna ≥ 18 tahun dan melarang pemakaian di layanan yang ditujukan/kemungkinan diakses orang < 18 tahun ([arsip ketentuan](https://ai.google.dev/gemini-api/terms-archive/terms_03_20_24)); siswa SMP < 18 tahun.
- **Keputusan (dipilih pemilik, 26 Nov 2026):** AI hanya di Area Peneliti: (1) saran skor rubrik per butir uraian, (2) ringkasan tema refleksi per kelas & unit. Siswa tidak pernah berinteraksi dengan AI. Kunci API hanya di `backend/.env` (`GEMINI_API_KEY`), tidak pernah ke frontend. Model diatur lewat `GEMINI_MODEL`.
- **Pengaman:** tanpa kode siswa/kelas dalam prompt; keluaran divalidasi (indikator butir saja, skor 0–3); saran **tidak** disimpan sebagai skor — peneliti memutuskan; batas 60 panggilan/jam; setiap panggilan dicatat di tabel `ai_logs` (migrasi 0002).
- **Konsekuensi:** Penelitian wajib melaporkan bahwa penilaian dibantu AI dan menghitung kesepakatan saran AI vs skor final peneliti (EVALUATION_PLAN). Situs tetap diakses siswa — pemilik disarankan meminta konfirmasi tertulis kepada Google/pembimbing. Pada tier gratis Gemini API, data dapat dipakai Google untuk meningkatkan produk; untuk data penelitian pertimbangkan tier berbayar (cek halaman harga resmi).

## ADR-017 — Beranda bersidebar + skin Gari

- **Konteks:** Pemilik memberi referensi beranda setelah masuk (sidebar, kartu "Langkah pertama", banner maskot, kartu streak, daftar tantangan) dan meminta Gari lebih imut dengan banyak skin.
- **Keputusan:** Tata letak diikuti. Penyesuaian terhadap PP-10: "+XP" diganti estimasi waktu; "streak" menjadi "n dari 7 hari belajar minggu ini" tanpa hukuman/hitungan beruntun; "Tantangan" menjadi "Misi belajar" berbasis unit. 12 skin Gari **bebas dipilih** (personalisasi, bukan hadiah), disimpan per siswa di perangkat. Ponsel: sidebar menjadi bilah navigasi bawah.
- **Konsekuensi:** Bila pemilik kelak ingin XP/lencana, perlu keputusan baru (ubah PP-10) dan dievaluasi dampaknya pada distraksi (tema T5).

## ADR-018 — "Tanya Gari" (AI) untuk siswa dengan pendampingan orang tua

- **Konteks:** Setelah diberi tahu bahwa ketentuan Gemini API mensyaratkan pengguna ≥ 18 tahun tanpa pengecualian resmi untuk pendampingan, pemilik proyek (26 Nov 2026) memutuskan AI tetap dipakai siswa karena **pemakaian akan diawasi langsung oleh orang tua**. Risiko penangguhan kunci API oleh Google diterima pemilik; konfirmasi tertulis dari Google/pembimbing tetap disarankan.
- **Keputusan & pengaman:**
  1. Mati secara bawaan; peneliti mengizinkan **per kelas** (`classes.ai_student_enabled`) setelah persetujuan orang tua terkumpul.
  2. Setiap sesi siswa wajib menekan "Orang tuaku sedang mendampingi" (`supervised: true` diperiksa server).
  3. PP-04 tetap berlaku: kunci jawaban & pembahasan tidak dikirim ke AI; balasan yang memuat nilai kunci diganti petunjuk konten (`status = leak_replaced`).
  4. Instruksi sistem: Sokratik, ≤ 3 kalimat, hanya matematika, tidak meminta data pribadi, menyarankan bicara dengan orang tua/guru bila ada hal tidak aman. Filter keamanan Google `BLOCK_LOW_AND_ABOVE`.
  5. Email/nomor HP dihapus sebelum dikirim; tanpa kode siswa/kelas.
  6. Tidak tersedia di asesmen (PP-09). Batas 20 pertanyaan/jam/siswa.
  7. Semua percakapan tersimpan di `ai_chats` dan dapat diekspor peneliti (dataset `ai_chats`) — bisa ditunjukkan ke orang tua.
  8. Model cadangan otomatis (`GEMINI_FALLBACK_MODELS`) bila model utama sibuk.
- **Konsekuensi:** Formulir persetujuan orang tua wajib menjelaskan fitur ini. Laporan penelitian perlu mencantumkan pemakaian AI oleh siswa dan dampaknya dievaluasi (EVALUATION_PLAN, tema T4/T5).

## ADR-019 — Integrasi Rigorous Mathematical Thinking (RMT)

- **Konteks:** Pemilik menambahkan landasan RMT (Kinard & Kozulin, 2008): alat psikologis Vygotsky + MLE & fungsi kognitif Feuerstein.
- **Keputusan:** (1) Tipe langkah baru `plan` (Perencanaan Tindakan) di masalah kontekstual U2–U6, sebelum perhitungan; kode umpan balik `PLAN_ORDER`. (2) Kolom `reflections.transfer` + `transfer_prompt` di konten untuk transendensi (migrasi 0004). (3) Endpoint & tab **Diagnostik RMT** (`GET /researcher/classes/{kode}/diagnostics`, dataset CSV `diagnostics`). (4) Instruksi "Tanya Gari" memakai prinsip MLE dan pertanyaan per fase Input/Elaborasi/Output. (5) Validator konten mewajibkan langkah rencana (U2–U6) dan pertanyaan transendensi (PP-11, PP-12).
- **Konsekuensi:** Konten naik ke versi 2026.11.3. Satu langkah tambahan per masalah kontekstual (±1 menit). Pemetaan diagnostik perlu divalidasi sebelum dipakai untuk klaim.

## ADR-020 — Efek suara & Tanya Gari interaktif

- **Konteks:** Pemilik meminta suara saat menekan tombol, suara saat jawaban benar/salah, AI yang lebih interaktif, dan tombol khusus untuk bertanya ke Gari.
- **Keputusan:**
  1. Suara disintesis dengan Web Audio API (`src/lib/sound/`), tanpa berkas audio dan tanpa dependensi baru. Nada pendek dan pelan; nada "perlu dicek" lembut dan menurun agar tidak terasa menghukum. Tanpa fanfare, poin, atau hadiah (PP-10).
  2. Sakelar suara (ikon speaker) di bilah samping/atas dan di kepala pemutar; status disimpan per perangkat (`localStorage.sound`). Bawaan: menyala.
  3. Suara benar/salah hanya di latihan. Asesmen tidak memeriksa jawaban di klien sehingga tidak ada suara benar/salah (PP-09); suara ketuk tetap ada.
  4. Tombol **Tanya Gari** khusus di ActionBar (hanya bila kelas mengizinkan AI) membuka panel obrolan langsung; panel petunjuk tetap terpisah dan menautkan ke obrolan. Saat jawaban "perlu dicek", muncul tautan "Tanya Gari: kenapa belum tepat?".
  5. Interaktivitas: sapaan lokal per proses langkah (tanpa memanggil AI), pilihan balasan cepat, Gari selalu mengakhiri dengan pertanyaan balik dan menyarankan 2–3 balasan (`choices`) yang disaring dari kunci jawaban, kode umpan balik terakhir dikirim sebagai konteks (`feedback_code`), percakapan bertahan selama sesi browser, pesan Gari bisa dibacakan (Web Speech API, `id-ID`).
- **Konsekuensi:** Suara berpotensi menjadi distraksi (beban kognitif asing) — karena itu singkat dan bisa dimatikan; perlu diamati saat uji coba. Pembacaan teks memakai mesin suara bawaan perangkat/browser; pada sebagian browser teks pesan Gari (bukan data siswa) dapat diproses layanan suara daring milik penyedia browser.

## ADR-021 — Chatbot Tanya Gari di bilah samping

- **Konteks:** Pemilik meminta chatbot di bilah samping yang terhubung ke Gari AI, sehingga siswa bisa bertanya di luar langkah aktivitas.
- **Keputusan:**
  1. Item **Tanya Gari** (berlabel AI) di bilah samping desktop dan bilah bawah ponsel membuka laci obrolan yang tetap terbuka saat siswa berpindah halaman. Item hanya tampil bila kelas diizinkan (`GET /me/ai`).
  2. Endpoint baru `POST /ai/chat` untuk obrolan umum. Pengaman sama dengan `/ai/ask`: izin per kelas, konfirmasi pendamping, batas per jam (kuota dipakai bersama), penghapusan data pribadi, filter keamanan, log `ai_chats`.
  3. Tidak tersedia selama asesmen: laci disembunyikan di `/asesmen/:id`, dan server menolak (`403 AI_DURING_ASSESSMENT`) bila siswa punya pengerjaan asesmen berstatus `in_progress` (PP-09).
  4. Karena tidak terikat langkah, tidak ada kunci jawaban untuk dicek. Instruksi AI melarang menyelesaikan soal yang disalin siswa dan mengarahkan siswa ke tombol Petunjuk/Tanya Gari di aktivitasnya.
  5. Migrasi 0005: `ai_chats.activity_id` dan `step_key` boleh kosong; ekspor menandai baris ini sebagai "(obrolan umum)".
  6. Percakapan disimpan di `sessionStorage` dan dihapus saat keluar, bersama konfirmasi pendamping.
- **Konsekuensi:** Risiko siswa menyalin soal latihan ke obrolan umum hanya ditahan oleh instruksi AI (tanpa pengecekan kunci). Perlu dipantau lewat ekspor `ai_chats`.

## ADR-022 — Gari bergerak di banner beranda

- **Konteks:** Pemilik meminta maskot Gari di banner beranda bisa bergerak. Ini pengecualian yang disetujui pemilik terhadap PP-03 (tanpa animasi dekoratif) dan ADR-015 (dekorasi hanya di landing).
- **Keputusan:** Prop `animated` pada `DuckMascot` (CSS murni, tanpa pustaka): badan mengayun pelan, kepala sedikit miring, sayap mengepak, mata berkedip. Diketuk → melompat sekali + bunyi "kwek" (mengikuti sakelar suara). Hanya dipakai di banner beranda, tidak di pemutar aktivitas maupun asesmen, agar tidak menambah beban kognitif saat mengerjakan soal. Animasi mati otomatis bila perangkat memakai `prefers-reduced-motion`.
- **Konsekuensi:** Beranda sedikit lebih "hidup"; tidak ada informasi matematika yang ditambahkan. Bila uji coba menunjukkan gangguan, cukup hapus prop `animated`.
