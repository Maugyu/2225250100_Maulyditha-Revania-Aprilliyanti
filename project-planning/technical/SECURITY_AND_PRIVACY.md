# Security and Privacy

> **Dokumen terkait:** [ARCHITECTURE.md](ARCHITECTURE.md) · [API_SPECIFICATION.md](API_SPECIFICATION.md) · [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) · [../testing/DEPLOYMENT_GUIDE.md](../testing/DEPLOYMENT_GUIDE.md)
>
> Pengguna aplikasi adalah **anak di bawah umur**. Prinsip utama: kumpulkan sesedikit mungkin, lindungi yang dikumpulkan, dan gunakan hanya untuk tujuan pembelajaran dan penelitian yang disetujui.

---

## 1. Landasan

| Acuan | Relevansi |
|---|---|
| UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) | Data anak termasuk kategori data pribadi yang memerlukan perlindungan khusus; pemrosesan data anak memerlukan persetujuan orang tua/wali. Pasal spesifik perlu dirujuk langsung oleh penulis. |
| Etika penelitian kampus | Persetujuan sekolah, orang tua/wali (*informed consent*), dan siswa (*assent*); prosedur mengikuti ketentuan program studi/komite etik (**TBD**). |
| OWASP Top 10 & OWASP ASVS | Acuan praktik keamanan aplikasi web. |

## 2. Minimisasi Data

| Data | Dikumpulkan? | Alasan |
|---|---|---|
| Nama asli, email, nomor HP, alamat, tanggal lahir, foto | ❌ Tidak | Tidak diperlukan untuk tujuan aplikasi. |
| Nama sekolah | ❌ Tidak di sistem (hanya label samaran kelas) | Identitas sekolah dicatat terpisah oleh peneliti bila perlu. |
| Kode siswa (pseudonim) | ✅ | Menghubungkan data proses tanpa identitas. |
| Hash PIN | ✅ | Autentikasi. |
| Jawaban, petunjuk, refleksi, skor | ✅ | Tujuan pembelajaran & penelitian. |
| Alamat IP | ⚠️ Hanya di log server, retensi pendek (≤ 30 hari) | Keamanan & debugging. Tidak disimpan di basis data. |
| Pelacak analitik pihak ketiga (misal Google Analytics) | ❌ Tidak | Tidak diperlukan; risiko privasi anak. |
| Iklan | ❌ Tidak | DS03 + privasi. |

**Tabel penghubung kode siswa ↔ nama asli** (bila diperlukan peneliti) disimpan **di luar sistem** (misal dokumen terenkripsi milik peneliti), tidak pernah diunggah ke server aplikasi maupun repositori Git.

## 2b. Pihak Ketiga: Gemini API (ADR-016)

| Aspek | Ketentuan |
|---|---|
| Siapa yang memakai | Peneliti (saran skor, ringkasan refleksi) **dan siswa** lewat "Tanya Gari" bila kelasnya diizinkan peneliti dan siswa mengonfirmasi pendampingan orang tua (ADR-018). |
| Data yang dikirim ke Google | Teks soal, jawaban/pertanyaan siswa, dan refleksi — **tanpa** kode siswa, kode kelas, atau identitas lain; email & nomor HP yang terketik dihapus otomatis. Kunci jawaban tidak dikirim pada "Tanya Gari". |
| Kunci API | Hanya di `backend/.env`; tidak pernah di frontend, log, atau repositori. |
| Persetujuan | Formulir persetujuan orang tua/sekolah perlu menyebut bahwa jawaban tertulis dapat diproses layanan AI pihak ketiga untuk membantu penilaian (TBD bersama pembimbing). |
| Tier layanan | Tier gratis dapat memakai data untuk peningkatan produk Google — pertimbangkan tier berbayar untuk data penelitian. |

## 3. Autentikasi dan Otorisasi

| Aspek | Keputusan |
|---|---|
| Metode | Kode pengguna + PIN 6 digit (dibuat acak oleh CLI). |
| Penyimpanan PIN | Hash argon2 (via `argon2-cffi`) atau bcrypt (via `passlib`/`bcrypt`) — dipilih saat implementasi; **tidak pernah** plaintext. |
| Pembatasan percobaan | 5 gagal / 15 menit per username → 429. MVP: penyimpanan di memori proses (cukup untuk satu proses server); dicatat sebagai keterbatasan. |
| Token | JWT HS256, berlaku 8 jam, klaim minimal: `sub` (user id), `role`, `exp`. Kunci rahasia dari variabel lingkungan `JWT_SECRET` (≥ 32 byte acak). |
| Penyimpanan token di klien | `localStorage` (ADR-008). Mitigasi XSS: tidak memakai `dangerouslySetInnerHTML` untuk konten pengguna; Content-Security-Policy ketat. |
| Peran | `student` dan `researcher`. Endpoint `/researcher/*` dijaga dependency `require_role("researcher")`. |
| Kepemilikan | Setiap query sumber milik siswa difilter dengan `user_id` dari token. |
| Akun peneliti | Dibuat lewat CLI; PIN peneliti boleh lebih panjang (TBD: kata sandi ≥ 12 karakter untuk peneliti — direkomendasikan). |

> PIN 6 digit memiliki ruang kunci terbatas (10⁶). Risiko ini diterima untuk kemudahan siswa SMP, dengan mitigasi pembatasan percobaan dan sifat data yang tidak berisi identitas asli.

## 4. Validasi Input

- Seluruh input divalidasi Pydantic (`extra="forbid"`, batas panjang, pola regex untuk kode).
- Jawaban teks bebas disimpan apa adanya, **di-escape** saat ditampilkan (React melakukan escape bawaan). Dilarang merender HTML dari input pengguna.
- Konten modul (dibuat peneliti) boleh berisi sintaks terbatas (`[[istilah]]`, `$...$` untuk KaTeX) yang di-parse oleh komponen, bukan HTML mentah.
- KaTeX dijalankan dengan `trust: false` dan `throwOnError: false`.
- Ekspor CSV melindungi dari *CSV/formula injection* (awalan `'` untuk sel diawali `= + - @`).
- Query basis data hanya lewat ORM/parameter terikat (tidak ada SQL string concatenation).

## 5. Keamanan Transport dan Header

| Kontrol | Penerapan |
|---|---|
| HTTPS | Wajib di produksi untuk frontend & backend (juga syarat PWA). |
| HSTS | Diaktifkan di server/hosting produksi. |
| CORS | Hanya domain frontend produksi. |
| Content-Security-Policy (frontend) | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' <API_ORIGIN>; frame-ancestors 'none'` — disesuaikan saat implementasi (KaTeX memerlukan style inline). |
| Header lain | `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`. |
| Dokumentasi API | `/docs` dan `/openapi.json` dinonaktifkan di produksi (`docs_url=None` bila `ENV=production`). |

## 6. Data di Perangkat

| Data | Lokasi | Dihapus saat |
|---|---|---|
| Token | `localStorage` | Logout / kedaluwarsa. |
| Draf jawaban | `localStorage` | Terkirim / logout. |
| Antrean (F-19) | IndexedDB | Terkirim / logout (dengan peringatan bila masih ada data belum terkirim). |
| Cache konten | Cache Storage `content-v1` | Tidak berisi data pribadi; boleh tetap. |
| Cache progres | Cache Storage `user-v1` | Logout. |

Perangkat bersama (HP keluarga/lab sekolah): tombol "Keluar" selalu tersedia di Beranda.

## 7. Pengelolaan Rahasia dan Repositori

- Rahasia (`JWT_SECRET`, `DATABASE_URL` produksi) hanya di variabel lingkungan; file `.env` masuk `.gitignore`. Sediakan `.env.example` tanpa nilai rahasia.
- File basis data (`*.db`), hasil ekspor CSV, dan daftar PIN **tidak boleh** di-commit.
- Repositori GitHub: disarankan **privat** selama ada data uji coba di sekitar proyek (TBD).
- Foto dokumentasi wawancara (berisi wajah siswa) **tidak** dimasukkan ke repositori maupun aplikasi.

## 8. Retensi dan Penghapusan

| Data | Retensi | Prosedur penghapusan |
|---|---|---|
| Data proses & asesmen | Sampai penelitian selesai + masa yang ditentukan kampus (**TBD**) | Skrip CLI `delete-class --class KLS8A` menghapus seluruh data kelas. |
| Permintaan penghapusan oleh siswa/orang tua | Diproses ≤ 7 hari | CLI `delete-student --username …`. |
| Log server | ≤ 30 hari | Rotasi log otomatis. |
| Cadangan basis data | Mengikuti retensi data utama | Hapus cadangan lama saat data utama dihapus. |

## 9. Cadangan

- SQLite: salin file basis data harian ke lokasi terpisah (perintah `sqlite3 app.db ".backup backup.db"` agar konsisten saat berjalan). Cadangan dienkripsi bila disimpan di luar server.
- PostgreSQL terkelola: gunakan fitur cadangan penyedia.

## 10. Daftar Periksa Keamanan Sebelum Uji Coba

- [ ] HTTPS aktif di frontend & backend.
- [ ] `JWT_SECRET` acak dan tidak ada di repositori.
- [ ] `/docs` nonaktif di produksi.
- [ ] Pembatasan percobaan login teruji.
- [ ] Tes otorisasi: siswa tidak dapat mengakses data siswa lain maupun endpoint peneliti.
- [ ] Ekspor CSV hanya pseudonim.
- [ ] Persetujuan sekolah & orang tua telah diperoleh; `consent_confirmed` diisi.
- [ ] Cadangan basis data terjadwal dan pemulihan pernah diuji.
