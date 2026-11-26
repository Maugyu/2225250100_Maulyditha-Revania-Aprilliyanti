# Database Schema

> **Dokumen terkait:** [ARCHITECTURE.md](ARCHITECTURE.md) · [API_SPECIFICATION.md](API_SPECIFICATION.md) · [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md) · [../education/ASSESSMENT_RUBRIC.md](../education/ASSESSMENT_RUBRIC.md)

---

## 1. Prinsip Rancangan

1. **Portabel SQLite → PostgreSQL:** hanya memakai tipe yang didukung keduanya lewat SQLAlchemy (`Integer`, `String`, `Text`, `Boolean`, `DateTime(timezone=True)`, `JSON`). Tidak memakai fitur khusus SQLite.
2. **Primary key `INTEGER` auto-increment** untuk kesederhanaan; tabel yang menerima data dari klien offline memiliki kolom `client_id` (UUID string) yang unik untuk idempotensi.
3. **Waktu disimpan dalam UTC** (`DateTime(timezone=True)`); ditampilkan dalam WIB/zona lokal di frontend.
4. **Minimisasi data:** tidak ada kolom nama asli, email, nomor HP, tanggal lahir, atau foto.
5. **Konten sebagai data:** isi langkah aktivitas disimpan sebagai JSON tervalidasi (`activities.content`), sehingga konten bisa direvisi tanpa mengubah skema.
6. **Soft delete tidak dipakai** di MVP; penghapusan data siswa dilakukan dengan prosedur di [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md).
7. Penamaan tabel jamak, `snake_case`, bahasa Inggris (konsisten dengan kode).

## 2. Diagram Relasi (ERD)

```mermaid
erDiagram
    classes ||--o{ users : "memiliki"
    modules ||--o{ units : "terdiri atas"
    units ||--o{ activities : "terdiri atas"
    modules ||--o{ glossary_terms : "memiliki"
    users ||--o{ attempts : "melakukan"
    activities ||--o{ attempts : "dicoba dalam"
    attempts ||--o{ step_responses : "berisi"
    users ||--o{ reflections : "menulis"
    units ||--o{ reflections : "untuk"
    modules ||--o{ assessments : "memiliki"
    assessments ||--o{ assessment_items : "berisi"
    classes ||--o{ class_assessments : "membuka"
    assessments ||--o{ class_assessments : "dibuka untuk"
    users ||--o{ assessment_submissions : "mengerjakan"
    assessments ||--o{ assessment_submissions : "dikerjakan dalam"
    assessment_submissions ||--o{ item_responses : "berisi"
    assessment_items ||--o{ item_responses : "dijawab dalam"
    item_responses ||--o{ rubric_scores : "dinilai"
    users ||--o{ rubric_scores : "menilai (peneliti)"
```

## 3. Definisi Tabel

Keterangan: **PK** = primary key, **FK** = foreign key, **UQ** = unique, **NN** = not null.

### 3.1 `classes`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| code | String(20) | UQ, NN | Kode kelas, misal `KLS8A`. |
| label | String(100) | NN | Label samaran, misal "Kelas uji coba 1". Bukan nama sekolah asli bila tidak perlu. |
| created_at | DateTime | NN | |

### 3.2 `users`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| username | String(30) | UQ, NN | Kode pengguna, misal `KLS8A-07`. |
| pin_hash | String(255) | NN | Hash PIN (argon2/bcrypt). |
| role | String(20) | NN, CHECK in (`student`, `researcher`) | |
| class_id | Integer | FK → classes.id, NULL untuk peneliti | |
| is_active | Boolean | NN, default true | Menonaktifkan tanpa menghapus. |
| consent_confirmed | Boolean | NN, default false | Persetujuan orang tua/sekolah telah dicatat peneliti (di luar sistem). |
| created_at | DateTime | NN | |
| last_login_at | DateTime | NULL | |

### 3.3 `modules`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| slug | String(50) | UQ, NN | `pgl` |
| title | String(150) | NN | |
| grade | Integer | NN | 8 |
| pisa_content_category | String(40) | NN | `change_and_relationships` |
| description | Text | NULL | |
| content_version | String(20) | NN | Versi konten, misal `2026.11.1`. |
| is_published | Boolean | NN, default false | |

### 3.4 `units`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| module_id | Integer | FK → modules.id, NN | |
| slug | String(50) | NN; UQ(module_id, slug) | `u2-gradien` |
| order_index | Integer | NN | 0–6 |
| title | String(150) | NN | |
| goal | String(255) | NN | Satu kalimat tujuan. |
| is_optional | Boolean | NN, default false | U0 = true. |

### 3.5 `activities`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| unit_id | Integer | FK → units.id, NN | |
| slug | String(60) | NN; UQ(unit_id, slug) | |
| order_index | Integer | NN | |
| phase | String(20) | NN | `hook`, `explore`, `example`, `guided`, `practice`, `context_problem`, `reflect` |
| title | String(150) | NN | |
| literacy_processes | JSON | NN | Contoh `["formulate","employ","interpret"]` (PP-01). |
| indicators | JSON | NN | Contoh `["F1","F3","I1"]`. |
| context_category | String(40) | NULL | `money`, `transport`, `environment`, … |
| content | JSON | NN | Langkah-langkah (lihat §5). |
| is_required | Boolean | NN, default true | Untuk perhitungan progres. |

### 3.6 `glossary_terms`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| module_id | Integer | FK → modules.id, NN | |
| key | String(50) | NN; UQ(module_id, key) | `gradien` |
| term | String(80) | NN | "Gradien" |
| definition | String(300) | NN | ≤ 2 kalimat. |
| example | String(200) | NULL | |

### 3.7 `attempts`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| client_id | String(36) | UQ, NN | UUID dari klien. |
| user_id | Integer | FK → users.id, NN | |
| activity_id | Integer | FK → activities.id, NN | |
| content_version | String(20) | NN | Versi konten saat dikerjakan. |
| status | String(20) | NN | `in_progress`, `completed` |
| last_step_key | String(40) | NULL | Untuk "Lanjutkan belajar". |
| started_at | DateTime | NN | |
| updated_at | DateTime | NN | Aktivitas terakhir (untuk "Lanjutkan belajar"). |
| completed_at | DateTime | NULL | |

### 3.8 `step_responses`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| client_id | String(36) | UQ, NN | Idempotensi. |
| attempt_id | Integer | FK → attempts.id, NN | |
| step_key | String(40) | NN | Kunci langkah dalam konten. |
| step_type | String(30) | NN | Jenis langkah. |
| try_number | Integer | NN | Percobaan ke-n pada langkah ini. |
| response | JSON | NN | Jawaban mentah, misal `{"m":"2500","c":"5000"}`. |
| is_correct | Boolean | NULL | NULL untuk jawaban terbuka. |
| feedback_code | String(30) | NULL | `SIGN_FLIP`, `ORDER_MISMATCH`, … |
| hint_level_max | Integer | NN, default 0 | 0–3. |
| solution_revealed | Boolean | NN, default false | Pembahasan dibuka. |
| answered_at | DateTime | NN | Waktu di klien (dikirim) — divalidasi wajar. |
| received_at | DateTime | NN | Waktu server. |

### 3.9 `reflections`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| client_id | String(36) | UQ, NN | |
| user_id | Integer | FK → users.id, NN | |
| unit_id | Integer | FK → units.id, NN | |
| prompt_key | String(40) | NN | |
| explanation | Text | NULL | ≤ 500 karakter; NULL bila dilewati. |
| confidence | Integer | NULL, CHECK 1–4 | |
| skipped | Boolean | NN, default false | |
| created_at | DateTime | NN | |

### 3.10 `assessments`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| module_id | Integer | FK → modules.id, NN | |
| slug | String(50) | UQ, NN | `pgl-pre-a`, `pgl-post-b` |
| kind | String(10) | NN, CHECK in (`pre`, `post`) | |
| title | String(150) | NN | |
| instructions | Text | NN | |

### 3.11 `assessment_items`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| assessment_id | Integer | FK → assessments.id, NN | |
| order_index | Integer | NN | |
| item_key | String(40) | NN | |
| prompt | JSON | NN | Situasi + sub-butir (dikirim ke klien). |
| answer_key | JSON | NULL | Kunci & aturan skor otomatis. **Tidak pernah dikirim ke klien siswa.** |
| indicators | JSON | NN | `["F1","F2","F3","E2","I1","I2"]` |

### 3.12 `class_assessments`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| class_id | Integer | FK → classes.id, NN | UQ(class_id, assessment_id) |
| assessment_id | Integer | FK → assessments.id, NN | |
| is_open | Boolean | NN, default false | Diatur peneliti. |
| opened_at | DateTime | NULL | |
| closed_at | DateTime | NULL | |

### 3.13 `assessment_submissions`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| user_id | Integer | FK → users.id, NN | UQ(user_id, assessment_id) — satu kali per asesmen. |
| assessment_id | Integer | FK → assessments.id, NN | |
| status | String(20) | NN | `in_progress`, `submitted` |
| started_at | DateTime | NN | |
| submitted_at | DateTime | NULL | |

### 3.14 `item_responses`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| submission_id | Integer | FK → assessment_submissions.id, NN | UQ(submission_id, item_id) |
| item_id | Integer | FK → assessment_items.id, NN | |
| response | JSON | NN | Jawaban per sub-butir. |
| auto_scores | JSON | NULL | Contoh `{"F1":3,"F3":2,"E2":3}` (skor awal otomatis). |
| updated_at | DateTime | NN | Autosave terakhir. |

### 3.15 `rubric_scores`

| Kolom | Tipe | Batasan | Keterangan |
|---|---|---|---|
| id | Integer | PK | |
| item_response_id | Integer | FK → item_responses.id, NN | |
| indicator | String(5) | NN, CHECK in (F1, F2, F3, E1, E2, E3, I1, I2) | |
| score | Integer | NN, CHECK 0–3 | |
| rater_id | Integer | FK → users.id (peran researcher), NN | UQ(item_response_id, indicator, rater_id) — mendukung penilai kedua. |
| note | String(500) | NULL | |
| scored_at | DateTime | NN | |

## 4. Indeks

| Tabel | Indeks | Alasan |
|---|---|---|
| attempts | (user_id, activity_id) | Mencari percobaan terakhir per aktivitas. |
| step_responses | (attempt_id, step_key) | Memuat jawaban per langkah. |
| reflections | (user_id, unit_id) | Ringkasan unit. |
| users | (class_id) | Daftar siswa per kelas. |

## 5. Struktur JSON `activities.content`

Contoh untuk masalah tarif ojek (U3), diringkas:

```json
{
  "schema_version": 1,
  "steps": [
    {
      "key": "situasi",
      "type": "info",
      "process": "formulate",
      "body": "Raka memesan ojek daring … biaya awal Rp5.000, lalu Rp2.500 untuk setiap kilometer …"
    },
    {
      "key": "tandai",
      "type": "identify_info",
      "process": "formulate",
      "indicator": "F1",
      "prompt": "Ketuk bagian yang penting untuk menjawab pertanyaan.",
      "spans": [
        {"id": "s1", "text": "biaya awal Rp5.000", "relevant": true},
        {"id": "s2", "text": "Rp2.500 untuk setiap kilometer", "relevant": true},
        {"id": "s3", "text": "8 km", "relevant": true},
        {"id": "s4", "text": "Rp30.000", "relevant": true},
        {"id": "s5", "text": "perpustakaan", "relevant": false}
      ],
      "hints": ["Informasi mana yang berupa angka dan dipakai untuk menghitung biaya?", "…", "…"]
    },
    {
      "key": "model",
      "type": "linear_model",
      "process": "formulate",
      "indicator": "F3",
      "prompt": "Susun model biaya: y = [m]x + [c]",
      "answer": {"m": "2500", "c": "5000"},
      "error_patterns": ["M_C_SWAP", "SIGN_FLIP"],
      "hints": ["Mana yang bertambah setiap km?", "m = biaya per km, c = biaya awal.", "y = 2500x + …"],
      "feedback": {"correct": "Tepat! Biaya naik Rp2.500 setiap 1 km, dimulai dari Rp5.000."}
    },
    {
      "key": "tafsir",
      "type": "interpret",
      "process": "interpret",
      "indicator": "I1",
      "prompt": "Apa arti angka 2.500 dalam situasi ini?",
      "max_length": 300
    }
  ],
  "glossary_refs": ["gradien", "konstanta", "model_matematika"]
}
```

Skema ini divalidasi oleh model Pydantic `ActivityContent` saat *seeding*. Endpoint asesmen memakai struktur serupa, tetapi `answer`, `error_patterns`, dan `hints` **dihapus** sebelum dikirim ke klien (kunci disimpan di `assessment_items.answer_key`).

> Catatan keamanan: untuk **latihan**, kunci jawaban ikut dikirim ke klien agar pemeriksaan bisa offline. Ini disengaja karena latihan bersifat formatif (lihat ADR-009).

## 6. Contoh Data

**classes**

| id | code | label |
|---|---|---|
| 1 | KLS8A | Kelas uji coba 1 |

**users**

| id | username | role | class_id | is_active |
|---|---|---|---|---|
| 1 | PENELITI-01 | researcher | NULL | true |
| 2 | KLS8A-01 | student | 1 | true |
| 3 | KLS8A-02 | student | 1 | true |

**attempts**

| id | client_id | user_id | activity_id | status | last_step_key |
|---|---|---|---|---|---|
| 10 | 7b1e…c2 | 2 | 15 | in_progress | model |

**step_responses**

| id | attempt_id | step_key | try_number | response | is_correct | feedback_code | hint_level_max |
|---|---|---|---|---|---|---|---|
| 101 | 10 | tandai | 1 | `{"selected":["s1","s2","s3","s4","s5"]}` | false | `IRRELEVANT_SELECTED` | 0 |
| 102 | 10 | tandai | 2 | `{"selected":["s1","s2","s3","s4"]}` | true | NULL | 0 |
| 103 | 10 | model | 1 | `{"m":"5000","c":"2500"}` | false | `M_C_SWAP` | 1 |

**rubric_scores**

| id | item_response_id | indicator | score | rater_id | note |
|---|---|---|---|---|---|
| 1 | 55 | I1 | 2 | 1 | Satuan tidak disebut. |

## 7. Migrasi ke PostgreSQL

1. Ganti `DATABASE_URL` dari `sqlite:///./data/app.db` ke `postgresql+psycopg://user:pass@host/db`.
2. Jalankan `alembic upgrade head` di basis data baru.
3. Pindahkan data dengan skrip ekspor–impor per tabel (urutan sesuai FK: classes → users → modules → units → activities → … ) atau alat seperti `pgloader` (TBD bila diperlukan).
4. Jalankan seluruh tes backend terhadap PostgreSQL (lihat [../testing/TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)).

Hal yang perlu diwaspadai: SQLite tidak menegakkan panjang `String(n)` dan FK hanya aktif bila `PRAGMA foreign_keys=ON` — aktifkan pragma ini sejak awal agar perilaku sama dengan PostgreSQL.
