# API Specification

> **Dokumen terkait:** [ARCHITECTURE.md](ARCHITECTURE.md) · [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) · [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md)
>
> FastAPI juga menghasilkan dokumentasi OpenAPI otomatis di `/docs` (dinonaktifkan di produksi — lihat keamanan). Dokumen ini adalah **kontrak rancangan**; bila berbeda dengan implementasi, perbarui dokumen ini terlebih dahulu.

---

## 1. Konvensi Umum

| Aspek | Aturan |
|---|---|
| Base URL | `/api/v1` |
| Format | JSON (`Content-Type: application/json; charset=utf-8`), kecuali ekspor CSV. |
| Penamaan field | `snake_case`. |
| Autentikasi | `Authorization: Bearer <jwt>` untuk semua endpoint kecuali `GET /health` dan `POST /auth/login`. |
| Waktu | ISO 8601 UTC, misal `2026-11-25T08:15:00Z`. |
| ID dari klien | `client_id` berformat UUID v4 untuk entitas yang dapat dibuat offline (idempoten). |
| Paginasi | `?limit=50&offset=0` (default 50, maks. 200) pada daftar peneliti. |

### 1.1 Format galat

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": [{"field": "pin", "issue": "harus 6 digit angka"}]
  }
}
```

### 1.2 Kode status

| Status | Kapan |
|---|---|
| 200 OK | Berhasil membaca/memperbarui. |
| 201 Created | Entitas baru dibuat. |
| 204 No Content | Berhasil tanpa isi (misal logout). |
| 400 Bad Request | Permintaan tidak dapat diproses (logika), misal asesmen sudah dikirim. |
| 401 Unauthorized | Token tidak ada/tidak valid/kedaluwarsa; login gagal. |
| 403 Forbidden | Peran tidak berhak (siswa mengakses endpoint peneliti) atau asesmen belum dibuka. |
| 404 Not Found | Sumber tidak ditemukan **atau bukan milik pengguna** (tidak membocorkan keberadaan). |
| 409 Conflict | `client_id` sama dengan isi berbeda. |
| 422 Unprocessable Entity | Validasi skema gagal (bawaan FastAPI, dibungkus ke format galat seragam). |
| 429 Too Many Requests | Terlalu banyak percobaan login. |
| 500 Internal Server Error | Galat tak terduga (pesan generik, detail hanya di log). |

### 1.3 Kode galat aplikasi

`VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `TOO_MANY_ATTEMPTS`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `ASSESSMENT_CLOSED`, `ASSESSMENT_ALREADY_SUBMITTED`, `CLIENT_ID_CONFLICT`, `INTERNAL_ERROR`.

---

## 2. Ringkasan Endpoint

> **Pembaruan implementasi v0.1:** endpoint attempt memakai `client_id` (UUID dari klien) di path, bukan id basis data, agar respons yang dibuat saat offline dapat diantre sebelum attempt tercatat di server. `GET /activities/{id}` juga mengembalikan `current_attempt`, `next_activity_id`, `position`, `unit`, dan `module_slug`.

| Method | Path | Peran | Fitur | Prioritas |
|---|---|---|---|---|
| GET | `/health` | Publik | — | Must |
| POST | `/auth/login` | Publik | F-01 | Must |
| GET | `/auth/me` | Semua | F-01 | Must |
| GET | `/modules` | Siswa | F-03 | Must |
| GET | `/modules/{slug}` | Siswa | F-03, F-11 | Must |
| GET | `/activities/{activity_id}` | Siswa | F-04 | Must |
| GET | `/me/progress` | Siswa | F-02, F-13 | Must |
| GET | `/me/resume` | Siswa | F-02 | Must |
| POST | `/attempts` | Siswa | F-04 | Must |
| POST | `/attempts/{attempt_client_id}/responses` | Siswa | F-04, F-08–F-10 | Must |
| PATCH | `/attempts/{attempt_client_id}` | Siswa | F-04 | Must |
| POST | `/reflections` | Siswa | F-12 | Must |
| GET | `/me/assessments` | Siswa | F-14 | Must |
| POST | `/assessments/{assessment_id}/submissions` | Siswa | F-14 | Must |
| GET | `/submissions/{submission_id}` | Siswa | F-14 | Must |
| PUT | `/submissions/{submission_id}/responses/{item_id}` | Siswa | F-14 | Must |
| POST | `/submissions/{submission_id}/submit` | Siswa | F-14 | Must |
| GET | `/researcher/classes` | Peneliti | F-15 | Must |
| GET | `/researcher/classes/{class_code}/progress` | Peneliti | F-15 | Must |
| PATCH | `/researcher/classes/{class_code}/assessments/{assessment_id}` | Peneliti | F-14 | Must |
| GET | `/researcher/export/{dataset}.csv` | Peneliti | F-15 | Must |
| GET | `/researcher/scoring/queue` | Peneliti | F-18 | Should |
| PUT | `/researcher/scoring/{item_response_id}` | Peneliti | F-18 | Should |
| POST | `/sync/batch` | Siswa | F-19 | Should |

Pembuatan akun siswa dan *seeding* konten dilakukan lewat **CLI**, bukan endpoint (mengurangi permukaan serangan).

---

## 3. Detail Endpoint

### 3.1 `GET /health`

**200**
```json
{"status": "ok", "version": "0.1.0"}
```

### 3.2 `POST /auth/login`

**Request**
```json
{"username": "KLS8A-07", "pin": "482913"}
```

**Validasi:** `username` 3–30 karakter `[A-Z0-9-]` (dinormalisasi ke huruf besar); `pin` tepat 6 digit.

**200**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {"username": "KLS8A-07", "role": "student", "class_code": "KLS8A"}
}
```

**401** `INVALID_CREDENTIALS` (pesan sama untuk username tidak ada / PIN salah / akun nonaktif). **429** `TOO_MANY_ATTEMPTS` setelah 5 gagal dalam 15 menit per username.

### 3.3 `GET /auth/me`

**200** `{"username": "KLS8A-07", "role": "student", "class_code": "KLS8A"}`

### 3.4 `GET /modules`

**200**
```json
[{"slug": "pgl", "title": "Persamaan Garis Lurus dalam Kehidupan Sehari-hari", "grade": 8, "unit_count": 7, "content_version": "2026.11.1"}]
```

### 3.5 `GET /modules/{slug}`

**200**
```json
{
  "slug": "pgl",
  "title": "Persamaan Garis Lurus dalam Kehidupan Sehari-hari",
  "content_version": "2026.11.1",
  "units": [
    {
      "slug": "u2-gradien", "order_index": 2, "title": "Gradien sebagai Laju Perubahan",
      "goal": "Mengartikan gradien sebagai perubahan per satuan.", "is_optional": false,
      "activities": [{"id": 15, "slug": "u2-jelajah", "phase": "explore", "title": "Menjelajah kemiringan"}]
    }
  ],
  "glossary": [{"key": "gradien", "term": "Gradien", "definition": "Seberapa curam garis…", "example": "…"}]
}
```

### 3.6 `GET /activities/{activity_id}`

**200** — objek aktivitas lengkap dengan `content` (lihat [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) §5), termasuk kunci jawaban **latihan** (ADR-009).

### 3.7 `GET /me/progress`

**200**
```json
{
  "module_slug": "pgl",
  "units": [
    {"slug": "u1-tabel-grafik", "status": "completed"},
    {"slug": "u2-gradien", "status": "in_progress"},
    {"slug": "u3-ymxc", "status": "not_started"}
  ],
  "completed_units": 1,
  "total_required_units": 6
}
```

### 3.8 `GET /me/resume`

**200** `{"activity_id": 15, "step_key": "contoh-3", "unit_title": "Gradien sebagai Laju Perubahan"}` atau `{"activity_id": null}` bila pengguna baru.

### 3.9 `POST /attempts`

**Request** `{"client_id": "7b1e…", "activity_id": 15, "content_version": "2026.11.1", "started_at": "2026-11-25T08:00:00Z"}`

**201** `{"id": 10, "client_id": "7b1e…", "status": "in_progress"}`. Bila `client_id` sudah ada dengan isi sama → **200** dengan objek yang sama (idempoten); isi berbeda → **409**.

### 3.10 `POST /attempts/{attempt_client_id}/responses`

**Request**
```json
{
  "client_id": "c3f0…",
  "step_key": "model",
  "step_type": "linear_model",
  "try_number": 1,
  "response": {"m": "5000", "c": "2500"},
  "is_correct": false,
  "feedback_code": "M_C_SWAP",
  "hint_level_max": 1,
  "solution_revealed": false,
  "answered_at": "2026-11-25T08:05:12Z"
}
```

**Validasi:** attempt milik pengguna; `step_key` ada di konten aktivitas; `hint_level_max` 0–3; `response` ≤ 4 KB; `feedback_code` dari daftar yang diizinkan; teks bebas ≤ 500 karakter.

**201** `{"id": 103}` · **404** attempt bukan milik pengguna.

### 3.11 `PATCH /attempts/{attempt_client_id}`

**Request** `{"last_step_key": "tafsir"}` atau `{"status": "completed", "completed_at": "…"}` · **200**.

### 3.12 `POST /reflections`

**Request** `{"client_id": "…", "unit_slug": "u2-gradien", "prompt_key": "jelaskan-u2", "explanation": "Karena m-nya negatif…", "confidence": 3, "skipped": false}` · **201**.

**Validasi:** `confidence` 1–4 atau null bila `skipped`; `explanation` ≤ 500 karakter.

### 3.13 `GET /me/assessments`

**200** `[{"id": 1, "slug": "pgl-pre-a", "kind": "pre", "title": "Asesmen Awal", "is_open": true, "submission_status": null}]`

### 3.14 `POST /assessments/{assessment_id}/submissions`

Membuat (atau mengembalikan yang sudah ada) submission. **201/200** `{"id": 40, "status": "in_progress", "items": [ {"id": 1, "item_key": "m1", "prompt": {…}} ]}` — **tanpa** `answer_key`. **403** `ASSESSMENT_CLOSED`.

### 3.15 `GET /submissions/{submission_id}`

**200** — submission + butir + jawaban tersimpan (untuk melanjutkan).

### 3.16 `PUT /submissions/{submission_id}/responses/{item_id}`

**Request** `{"response": {"tandai": ["s1","s3"], "model": {"m": "2000", "c": "10000"}, "tafsir": "…"}}` · **200** `{"saved_at": "…"}` · **400** `ASSESSMENT_ALREADY_SUBMITTED`.

### 3.17 `POST /submissions/{submission_id}/submit`

Mengunci jawaban, menghitung `auto_scores` (F1, F3, E2). **200** `{"status": "submitted", "submitted_at": "…"}`. Skor **tidak** dikembalikan ke siswa.

### 3.18 `GET /researcher/classes/{class_code}/progress`

**200**
```json
{
  "class_code": "KLS8A",
  "students": [
    {"username": "KLS8A-01", "units": {"u1-tabel-grafik": "completed", "u2-gradien": "in_progress"}, "hints_used": 7, "last_active_at": "…"}
  ]
}
```

### 3.19 `PATCH /researcher/classes/{class_code}/assessments/{assessment_id}`

**Request** `{"is_open": true}` · **200**.

### 3.20 `GET /researcher/export/{dataset}.csv?class_code=KLS8A`

`dataset` ∈ `attempts`, `step_responses`, `reflections`, `assessment_responses`, `rubric_scores`.
**200** `Content-Type: text/csv; charset=utf-8` dengan header `Content-Disposition: attachment`. Kolom memakai `username` (pseudonim). Sel yang diawali `= + - @` diberi awalan `'` untuk mencegah *CSV injection*.

### 3.21 `GET /researcher/scoring/queue` *(Should)*

Parameter: `assessment_id`, `indicator`, `blind=true`. **200** daftar `item_responses` acak tanpa `username` bila `blind=true`.

### 3.22 `PUT /researcher/scoring/{item_response_id}` *(Should)*

**Request** `{"scores": [{"indicator": "I1", "score": 2, "note": "tanpa satuan"}]}` · **200**. **Validasi:** indikator sesuai `assessment_items.indicators`; skor 0–3.

### 3.23 `POST /sync/batch` *(Should)*

**Request** `{"attempts": [...], "step_responses": [...], "reflections": [...]}` (maks. 200 entri). Diproses idempoten per `client_id`. **200** `{"accepted": ["…"], "duplicates": ["…"], "rejected": [{"client_id": "…", "code": "VALIDATION_ERROR"}]}`.

---

### 3.24 `GET /me/ai` dan `POST /ai/ask` — Tanya Gari *(ADR-018, ADR-020)*

`GET /me/ai` → `{"available": true, "limit_per_hour": 20}`.

`POST /ai/ask` (peran siswa; kelas harus diizinkan peneliti; tidak tersedia di asesmen):

```json
{
  "activity_id": 12,
  "step_key": "model",
  "question": "Kenapa jawabanku belum tepat?",
  "history": [{"role": "siswa", "text": "..."}, {"role": "gari", "text": "..."}],
  "current_answer": {"m": "5000", "c": "2500"},
  "feedback_code": "M_C_SWAP",
  "supervised": true
}
```

- `question` 2–300 karakter; `history` ≤ 12 giliran; `feedback_code` opsional, harus salah satu kode umpan balik yang dikenal (422 bila tidak).
- Respons `200`: `{"reply": "…", "choices": ["Aku coba dulu", "Masih bingung"], "status": "ok"}`. `status` ∈ `ok | blocked | leak_replaced`; `choices` 0–3 balasan singkat untuk siswa, pilihan yang memuat kunci jawaban dibuang.
- Galat: `403 AI_NOT_ALLOWED`, `403 AI_SUPERVISION_REQUIRED`, `404 NOT_FOUND`, `429 AI_RATE_LIMIT`, `502 AI_ERROR`, `503 AI_UNAVAILABLE`.

### 3.25 `POST /ai/chat` — obrolan umum Tanya Gari dari bilah samping *(ADR-021)*

Body: `{"question": "Apa itu gradien?", "history": [...], "supervised": true}` (tanpa `activity_id`/`step_key`).
Respons `200` sama dengan `/ai/ask`: `{"reply", "choices", "status"}`.
Galat tambahan: `403 AI_DURING_ASSESSMENT` bila siswa sedang mengerjakan asesmen (pengerjaan `in_progress`).

## 4. Aturan Validasi Umum

| Aturan | Penerapan |
|---|---|
| Semua input divalidasi oleh schema Pydantic dengan `extra="forbid"`. | Field tak dikenal → 422. |
| Batas panjang string eksplisit pada setiap field teks. | Mencegah muatan berlebih. |
| Ukuran body maksimal 64 KB (kecuali `/sync/batch` 512 KB). | Middleware/proxy. |
| Kepemilikan sumber selalu dicek di service (user_id dari token, bukan dari body). | Mencegah IDOR. |
| Nilai numerik jawaban disimpan sebagai string apa adanya; normalisasi untuk penskoran dilakukan di service. | Menjaga bukti asli. |

## 5. CORS

- Lokal: tidak diperlukan (proxy Vite).
- Produksi: `allow_origins=[<domain frontend>]`, `allow_methods=["GET","POST","PUT","PATCH"]`, `allow_headers=["Authorization","Content-Type"]`, tanpa `allow_credentials` (token di header, bukan cookie).
