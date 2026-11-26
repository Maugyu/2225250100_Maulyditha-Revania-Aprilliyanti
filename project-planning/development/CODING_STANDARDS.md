# Coding Standards

> **Dokumen terkait:** [CLAUDE.md](CLAUDE.md) · [../technical/ARCHITECTURE.md](../technical/ARCHITECTURE.md) · [../testing/TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)

---

## 1. Prinsip Umum

1. **Sederhana dulu.** Pilih solusi paling mudah dipahami yang memenuhi kebutuhan.
2. **Satu tanggung jawab per modul/fungsi.**
3. **Logika murni terpisah dari I/O** (UI, HTTP, DB) agar mudah dites.
4. **Konsisten** dengan kode yang sudah ada lebih penting daripada preferensi pribadi.
5. **Bahasa:** identifier & komentar teknis dalam bahasa Inggris; teks yang dilihat siswa dalam bahasa Indonesia.

## 2. JavaScript / React

### 2.1 Alat

| Alat | Fungsi |
|---|---|
| ESLint (konfigurasi bawaan Vite React + `eslint-plugin-react-hooks`) | Linting |
| Prettier | Format (2 spasi, petik tunggal, titik koma, lebar 100) |
| Vitest + React Testing Library | Tes |

### 2.2 Aturan

- Komponen fungsi + hooks; tidak ada class component.
- Satu komponen utama per file; nama file = nama komponen.
- Props didokumentasikan dengan JSDoc pada komponen bersama (`components/ui`, `features/graph`).
- Hindari `useEffect` untuk menghitung data turunan — hitung langsung saat render atau `useMemo`.
- Import absolut via alias `@/` → `src/`.
- Tidak ada `console.log` di kode yang di-commit (gunakan util `logger` yang mati di produksi).
- Angka & pecahan: gunakan util `lib/math/fraction.js` (representasi pembilang/penyebut bulat) untuk menghindari galat floating-point saat membandingkan jawaban.

Contoh fungsi checker:

```js
/**
 * Mendeteksi apakah jawaban hanya berbeda tanda dari kunci (R-09, IL05).
 * @param {Fraction} answer
 * @param {Fraction} key
 * @returns {boolean}
 */
export function isSignFlip(answer, key) {
  return !key.isZero() && answer.equals(key.negate());
}
```

### 2.3 Struktur folder fitur

```
features/graph/
├── GraphCanvas.jsx
├── GraphCanvas.module.css
├── SlopeExplorer.jsx
├── coords.js            # transformasi koordinat (murni)
└── __tests__/
    ├── coords.test.js
    └── SlopeExplorer.test.jsx
```

### 2.4 Penanganan galat (frontend)

- Semua panggilan API lewat `lib/api/client.js` yang:
  - menambahkan header `Authorization`,
  - mengubah respons galat menjadi objek `ApiError {status, code, message}`,
  - mengarahkan ke `/masuk` saat 401,
  - membedakan galat jaringan (offline) dari galat server.
- Komponen menampilkan pesan ramah dari `lib/strings.js`, bukan pesan mentah server.
- *Error boundary* di tingkat halaman menampilkan layar "Terjadi kendala. Muat ulang" tanpa kehilangan draf.

## 3. Python / FastAPI

### 3.1 Alat

| Alat | Fungsi |
|---|---|
| Ruff | Linting + format (gaya kompatibel Black, lebar 100) |
| pytest, pytest-cov | Tes & cakupan |
| mypy (opsional) | Pemeriksaan tipe |

### 3.2 Aturan

- Type hints di semua fungsi publik.
- Mengikuti PEP 8 (ditegakkan Ruff).
- Router tipis → service → model. Router tidak berisi query.
- Sesi DB lewat dependency `get_db`; satu sesi per request.
- Konfigurasi lewat `pydantic-settings` (`core/config.py`), dibaca dari variabel lingkungan.
- Docstring singkat (gaya Google) untuk service & util.

Contoh:

```python
@router.post("/attempts/{attempt_id}/responses", status_code=201, response_model=StepResponseOut)
def create_step_response(
    attempt_id: int,
    payload: StepResponseIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_student),
) -> StepResponseOut:
    return attempt_service.record_response(db, user=user, attempt_id=attempt_id, payload=payload)
```

### 3.3 Penanganan galat (backend)

- Definisikan `AppError(code, message, status_code, details=None)` di `core/errors.py`.
- Exception handler global mengubah `AppError`, `RequestValidationError`, dan galat tak terduga ke format `{"error": {...}}`.
- Galat tak terduga: log stack trace (tanpa data sensitif), kembalikan `INTERNAL_ERROR` generik.
- Jangan menelan exception diam-diam (`except: pass` dilarang).

### 3.4 Logging

- Modul `logging` standar; format: waktu, level, modul, pesan, `request_id`.
- Dilarang mencatat PIN, token, atau isi jawaban siswa di log.

## 4. Konten JSON

- Satu file per **unit** berisi daftar aktivitasnya: `content/pgl/units/u2.json` (diputuskan saat implementasi agar urutan aktivitas mudah dibaca).
- Kunci langkah kebab-case dan unik dalam aktivitas.
- Divalidasi oleh `schemas/content.py` sebelum seed; seed gagal bila tidak valid.
- Perubahan konten → naikkan `content_version` di `module.json` dan commit dengan awalan `content:`.

## 5. Dokumentasi

| Jenis | Aturan |
|---|---|
| README | Di root, `frontend/`, dan `backend/`: cara menjalankan & menguji. |
| Kontrak | API & skema DB diperbarui di `project-planning/technical/` sebelum/bersamaan dengan kode. |
| ADR | Keputusan arsitektur baru → tambahkan ke `ADR.md`. |
| Changelog | `CHANGELOG.md` sederhana per rilis uji coba. |

## 6. Git dan GitHub

- Branch utama: `main` (selalu dapat dijalankan). Kerja di branch `feat/…`, `fix/…`, `docs/…`, `content/…`.
- Pesan commit: format *Conventional Commits* — `feat: tambah slider c pada SlopeExplorer`, `fix: …`, `test: …`, `docs: …`, `content: …`.
- Commit kecil dan fokus; satu tugas TASK_BREAKDOWN per Pull Request bila memungkinkan.
- `.gitignore` wajib memuat: `node_modules/`, `dist/`, `.env`, `*.db`, `__pycache__/`, `.venv/`, `exports/`, `*.csv` (kecuali contoh di `tests/fixtures/`).

## 7. Praktik Terbaik Tambahan

- **Aksesibilitas sejak awal:** label form, fokus terlihat, `aria-live` untuk umpan balik.
- **Performa:** impor dinamis (`React.lazy`) untuk area peneliti; hindari dependensi besar.
- **Tidak ada angka ajaib:** batas (misal 5 percobaan login, 80 kata) dijadikan konstanta bernama.
- **Kode mati dihapus,** bukan dikomentari.
