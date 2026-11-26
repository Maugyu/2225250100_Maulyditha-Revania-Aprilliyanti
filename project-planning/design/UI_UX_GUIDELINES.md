# UI/UX Guidelines

> **Dokumen terkait:** [USER_FLOW.md](USER_FLOW.md) · [WIREFRAME_SPECIFICATION.md](WIREFRAME_SPECIFICATION.md) · [../education/PEDAGOGICAL_FRAMEWORK.md](../education/PEDAGOGICAL_FRAMEWORK.md) §8
>
> ✅ **Pembaruan 25 Nov 2026:** referensi desain diterima dan diterapkan (latar pastel mint–biru bertitik, kartu membulat, tombol utama kuning, huruf **Plus Jakarta Sans** yang di-*self-host*, maskot **Gari si bebek kuning**). Nilai final ada di `frontend/src/styles/tokens.css`. Ornamen dekoratif hanya di halaman depan — lihat ADR-015.
>
> ~~Desain visual final belum ditetapkan (TBD-02).~~ Pemilik proyek akan memberi referensi desain terpisah. Dokumen ini menetapkan **prinsip, struktur token, dan aturan fungsional**. Nilai warna, jenis huruf, dan gaya ilustrasi di bawah adalah **placeholder** yang wajib diganti setelah referensi diterima.

---

## 1. Prinsip Desain Antarmuka

| Kode | Prinsip | Penjelasan | Dasar |
|---|---|---|---|
| UX-01 | **Satu layar, satu tugas** | Setiap layar punya satu aksi utama yang menonjol. | DS03, EL04 |
| UX-02 | **Tenang dan fokus** | Tanpa ilustrasi dekoratif, latar bermotif, atau animasi yang tidak membawa informasi. | EL03 |
| UX-03 | **Visual bermakna** | Warna, sorotan, dan animasi hanya dipakai untuk menandai informasi matematis (misal bagian persamaan yang berubah). | Signaling |
| UX-04 | **Bahasa ramah** | Kalimat pendek, sapaan "kamu", istilah dijelaskan. | EL01 |
| UX-05 | **Kendali di tangan siswa** | Tidak ada perpindahan otomatis antarlangkah; tidak ada penghitung waktu di latihan. | EL04 |
| UX-06 | **Bantuan tersembunyi sampai diminta** | Petunjuk, glosarium, dan pembahasan dibuka atas permintaan. | GL03, progressive disclosure |
| UX-07 | **Mobile-first** | Dirancang untuk layar 360 px lebih dulu. | Asumsi A-01 |
| UX-08 | **Toleran kesalahan** | Jawaban tidak hilang saat kembali, offline, atau salah ketik. | — |

## 2. Design System (Struktur Token)

Token didefinisikan sebagai CSS custom properties di `frontend/src/styles/tokens.css`. Komponen **hanya** boleh memakai token, tidak boleh nilai mentah.

### 2.1 Warna (placeholder)

| Token | Peran | Nilai placeholder | Aturan |
|---|---|---|---|
| `--color-bg` | Latar halaman | `#FFFFFF` | Polos, tanpa motif. |
| `--color-surface` | Kartu/panel | `#F7F7F8` | — |
| `--color-text` | Teks utama | `#1F2328` | Kontras ≥ 4.5:1 terhadap latar. |
| `--color-text-muted` | Teks sekunder | `#59636E` | Kontras ≥ 4.5:1. |
| `--color-primary` | Aksi utama | TBD | Hanya untuk tombol aksi utama & fokus. |
| `--color-success` | Benar | TBD (hijau) | Selalu disertai ikon/teks, bukan warna saja. |
| `--color-warning` | Perlu periksa | TBD (kuning/oranye) | Untuk umpan balik "periksa tanda", bukan merah. |
| `--color-error` | Kesalahan sistem | TBD (merah) | Hanya untuk galat teknis/validasi form. |
| `--color-highlight` | Sorotan perubahan persamaan | TBD | Dipakai di contoh terbimbing (PP-06). |
| `--color-line-1`, `--color-line-2` | Garis 1 dan 2 di grafik | TBD | Harus dapat dibedakan oleh penderita buta warna; garis 2 juga putus-putus. |

> Umpan balik "salah" pada latihan memakai `--color-warning`, bukan merah, agar terasa sebagai "ayo periksa" — keputusan desain yang dapat ditinjau setelah referensi visual diterima.

### 2.2 Tipografi (placeholder)

| Token | Penggunaan | Nilai placeholder |
|---|---|---|
| `--font-body` | Teks umum | Font sistem (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`) — ringan, tanpa unduhan. |
| `--font-math` | Ekspresi matematika | Font bawaan KaTeX. |
| `--text-sm` / `--text-md` / `--text-lg` / `--text-xl` | Skala | 14 / 16 / 20 / 24 px |
| `--leading-body` | Tinggi baris | 1.5 |

Aturan: ukuran teks isi minimal 16 px di ponsel; panjang baris maksimal ±70 karakter di desktop.

### 2.3 Spacing

Skala 4 px: `--space-1` = 4 px, `--space-2` = 8, `--space-3` = 12, `--space-4` = 16, `--space-6` = 24, `--space-8` = 32. Gutter samping halaman ponsel = `--space-4`.

### 2.4 Radius, bayangan, gerak

| Token | Nilai placeholder | Aturan |
|---|---|---|
| `--radius-md` | 8 px | — |
| `--shadow-sm` | tipis | Hanya untuk elemen mengambang (popover). |
| `--motion-fast` | 150 ms | Transisi informasional (sorotan). Hormati `prefers-reduced-motion`. |

## 3. Komponen

| Komponen | Fungsi | Aturan penting |
|---|---|---|
| `Button` | Aksi | Varian: `primary` (maks. satu per layar), `secondary`, `ghost`. Tinggi ≥ 44 px. |
| `StepHeader` | Judul unit + "Langkah n dari N" + bilah progres tipis | Selalu terlihat di Pemutar Aktivitas. |
| `ActionBar` | Bilah aksi bawah: Kembali · Aksi utama · Petunjuk | Menempel di bawah layar ponsel (sticky). |
| `HintPanel` | Petunjuk bertingkat | Terbuka dari bawah (bottom sheet) di ponsel; panel samping di desktop. |
| `FeedbackBox` | Umpan balik | Ikon + teks ≤ 2 kalimat; diumumkan via `aria-live="polite"`. |
| `GlossaryTerm` | Istilah berpenjelasan | Garis bawah putus-putus; popover ≤ 2 kalimat. |
| `MathText` | Render ekspresi | KaTeX; fallback teks bila gagal. |
| `GraphCanvas` | Grafik SVG | Grid, sumbu berlabel, skala 1:1 saat dibutuhkan. |
| `SlopeExplorer` | Penjelajah Gradien | Slider berlabel + nilai numerik; dukungan keyboard. |
| `PointPlotter` | Plot/baca titik | Snap; titik dapat dihapus; target sentuh ≥ 44 px (area sentuh lebih besar dari titik visual). |
| `HighlightableText` | Tandai informasi | Frasa yang dapat ditandai diberi batas halus; status tertandai jelas (bukan warna saja). |
| `KnownAskedTable` | Diketahui–Ditanya | Baris dinamis (tambah/hapus). |
| `LinearModelInput` | $y = [m]x + [c]$ | Menerima bilangan bulat, desimal (koma/titik), dan pecahan `a/b`. |
| `ReflectionForm` | Penjelasan + keyakinan 1–4 | Kotak teks dengan batas karakter (misal 500). |
| `OfflineBanner` | Status koneksi | Tipis di atas, tidak menutupi konten. |
| `UpdatePrompt` | Versi baru PWA | Tidak memaksa muat ulang saat siswa sedang menjawab. |

## 4. Navigasi

- **Struktur datar dan dangkal:** Beranda → Peta Unit → Pemutar Aktivitas. Maksimal 3 tingkat.
- **Ponsel:** tanpa menu hamburger berlapis. Tombol "kembali ke Beranda" di kepala halaman.
- **Di dalam aktivitas:** navigasi hanya Kembali/Lanjut; keluar aktivitas lewat ikon "tutup" dengan konfirmasi ringan ("Progresmu tersimpan").
- **Peneliti:** area terpisah `/peneliti` dengan navigasi tab sederhana (Kelas · Ekspor · Penilaian).

## 5. Responsivitas

| Breakpoint | Lebar | Tata letak Pemutar Aktivitas |
|---|---|---|
| `sm` (default) | < 640 px | Satu kolom: konten → grafik → bilah aksi menempel di bawah. |
| `md` | 640–1023 px | Satu kolom lebih lebar; grafik maks. 560 px. |
| `lg` | ≥ 1024 px | Dua kolom: teks/langkah di kiri, grafik/interaksi di kanan; petunjuk sebagai panel samping. |

Aturan: tidak ada gulir horizontal; grafik menyesuaikan lebar kontainer dan mempertahankan rasio; papan ketik virtual tidak boleh menutupi kolom input aktif (gulir otomatis ke input).

## 6. Aksesibilitas (acuan WCAG 2.1 AA)

| Aspek | Aturan |
|---|---|
| Kontras | Teks ≥ 4.5:1; elemen grafis penting ≥ 3:1. |
| Bukan warna saja | Benar/salah, garis 1/2, dan status tertandai memakai ikon, pola, atau teks tambahan. |
| Keyboard | Semua kontrol dapat dioperasikan dengan Tab/Enter/Spasi/panah; fokus terlihat jelas. |
| Label | Setiap input memiliki `<label>`; slider memiliki `aria-valuetext` (misal "gradien 1/2"). |
| Grafik | Ringkasan teks alternatif (misal "Garis naik melalui (0, 1) dan (2, 5)"). |
| Gerak | Hormati `prefers-reduced-motion`. |
| Bahasa | `<html lang="id">`. |
| Ukuran sentuh | ≥ 44×44 px. |

## 7. Pola Penulisan Mikro (Microcopy)

| Situasi | Contoh |
|---|---|
| Tombol utama | "Lanjut", "Cek jawaban", "Mulai belajar" — kata kerja, singkat. |
| Benar | "Tepat! Gradiennya 2, artinya naik 2 setiap 1 langkah ke kanan." |
| Periksa | "Hampir! Nilainya sudah tepat, coba periksa tandanya." |
| Petunjuk | "Butuh bantuan? Lihat petunjuk 1 dari 3." |
| Offline (MVP) | "Kamu sedang offline. Materi dan penjelajah tetap bisa dipakai. Jawaban latihan baru tercatat saat kamu online lagi." |
| Offline (setelah F-19) | "Kamu sedang offline. Jawabanmu disimpan di perangkat dan dikirim otomatis saat online." |
| Hindari | Pujian personal berlebihan, tanda seru beruntun, emoji dekoratif, istilah tanpa penjelasan. |
