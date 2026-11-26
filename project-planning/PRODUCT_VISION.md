# Product Vision

> **Dokumen terkait:** [PRD.md](PRD.md) · [education/PEDAGOGICAL_FRAMEWORK.md](education/PEDAGOGICAL_FRAMEWORK.md) · [education/INTERVIEW_ANALYSIS.md](education/INTERVIEW_ANALYSIS.md)

---

## 1. Pernyataan Visi

> **Membantu siswa SMP melihat, merumuskan, dan menalar matematika dalam situasi nyata — selangkah demi selangkah, tanpa gangguan.**

Aplikasi ini ingin menjadi ruang belajar yang tenang tempat siswa dapat menjelajahi konsep (misalnya kemiringan garis) secara langsung, memecahkan masalah kontekstual dengan bantuan yang bertahap, lalu menjelaskan pemahamannya dengan bahasa sendiri.

## 2. Pernyataan Posisi Produk

| Komponen | Isi |
|---|---|
| **Untuk** | siswa SMP yang sudah mengenal rumus tetapi belum lancar menggunakannya dalam konteks |
| **yang** | kesulitan menghubungkan rumus, grafik, dan soal cerita |
| **JelajahGaris (nama kerja)** | adalah aplikasi web progresif (PWA) pembelajaran literasi matematika |
| **yang** | menyediakan eksplorasi visual interaktif, langkah penyelesaian bertahap, dan masalah kontekstual berstruktur |
| **Berbeda dengan** | kumpulan rumus dan bank soal pilihan ganda |
| **produk ini** | melatih proses merumuskan, menggunakan, dan menafsirkan matematika sambil menjaga beban kognitif tetap terkelola |

## 3. Misi

1. **Menjembatani representasi** — menghubungkan tabel, grafik, persamaan, dan situasi nyata dalam satu tampilan yang dapat dimanipulasi.
2. **Menghormati tempo siswa** — setiap langkah diatur oleh siswa, bukan oleh aplikasi.
3. **Memberi bantuan yang membuat berpikir, bukan menggantikan berpikir** — petunjuk bertingkat dan umpan balik yang spesifik.
4. **Mengutamakan makna di atas hafalan** — setiap konsep dikaitkan dengan "untuk apa" dalam kehidupan sehari-hari.
5. **Menjaga privasi anak** — data seminimal mungkin, tanpa iklan dan pelacak.

## 4. Nilai Utama

| Nilai | Arti dalam produk | Akar temuan |
|---|---|---|
| **Fokus** | Hanya elemen yang membawa informasi matematika yang tampil. | EL03, DS03 |
| **Bertahap** | Konsep dan prosedur dipecah menjadi langkah kecil. | IL02, EL04, DS02 |
| **Aktif** | Siswa memanipulasi, menandai, menulis, dan mengecek — bukan hanya membaca. | GL01, GL02, DS01 |
| **Jujur** | Umpan balik spesifik; evaluasi tidak mengklaim lebih dari yang dapat dibuktikan. | IL05, prinsip penelitian |
| **Ramah** | Bahasa sehari-hari; istilah selalu dijelaskan. | EL01 |
| **Inklusif** | Berjalan di HP sederhana dan saat sinyal lemah. | Asumsi A-01 |

## 5. Tujuan Jangka Panjang

| Horizon | Tujuan |
|---|---|
| **Jangka pendek (MVP, satu semester)** | Satu modul PGL lengkap, tervalidasi ahli, diuji coba terbatas. |
| **Jangka menengah** | Revisi berdasarkan uji coba; perluasan ke materi terkait fungsi linear (misal SPLDV) dan materi lain di [education/MATHEMATICS_CONTENT_MAP.md](education/MATHEMATICS_CONTENT_MAP.md); dasbor guru sederhana. |
| **Jangka panjang** | Kumpulan modul literasi matematika SMP lintas konten (perubahan dan hubungan, ruang dan bentuk, kuantitas, ketidakpastian dan data) dengan bukti empiris dari penelitian lanjutan. |

> Jangka menengah dan panjang adalah arah, **bukan** komitmen. Keputusan lanjutan bergantung pada hasil evaluasi MVP.

## 6. Karakteristik Aplikasi

1. **Berbasis web dan dapat diinstal (PWA)** — tanpa Play Store/App Store.
2. **Responsif** — dirancang *mobile-first*, tetap nyaman di laptop.
3. **Ringan dan tahan offline** — materi dan eksplorasi tetap dapat dibuka tanpa sinyal setelah pernah dimuat.
4. **Satu aksi utama per layar** — tidak ada menu dan tombol berlebih.
5. **Konten terpisah dari kode** — unit ditulis dalam format data (JSON) agar mudah direvisi tanpa mengubah komponen.
6. **Mengumpulkan bukti proses** — setiap langkah F–E–I tercatat untuk dianalisis peneliti.

## 7. Yang Bukan Produk Ini

- Bukan bank soal pilihan ganda atau kumpulan rumus.
- Bukan pengganti guru.
- Bukan platform game dengan poin dan peringkat.
- Bukan alat ukur terstandar kemampuan literasi matematika (instrumen asesmen masih perlu divalidasi).
