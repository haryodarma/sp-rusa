# 🦌 Dokumentasi Lengkap Sistem Pakar Diagnosa Penyakit Rusa

Sistem Pakar Diagnosa Penyakit Rusa adalah aplikasi berbasis web yang dirancang untuk mengidentifikasi jenis penyakit pada rusa berdasarkan gejala klinis yang dialami, serta memberikan rekomendasi tindakan penanganan. Sistem ini menggabungkan metode pembobotan **Certainty Factor (CF)** dari pakar/pengguna dengan metode inferensi **Dempster-Shafer (DS)** untuk mengolah ketidakpastian data multi-gejala.

---

## 📌 Daftar Isi
1. [Tech Stack & Alasan Pemilihan](#1-tech-stack--alasan-pemilihan)
2. [Arsitektur & Alur Sistem](#2-arsitektur--alur-sistem)
3. [Peran Pengguna (User Roles)](#3-peran-pengguna-user-roles)
4. [Struktur Basis Data (Database Schema)](#4-struktur-basis-data-database-schema)
5. [Logika Inferensi & Formulas Matematika (POV Developer)](#5-logika-inferensi--formulas-matematika-pov-developer)
6. [Simulasi Manual Metode Dempster-Shafer](#6-simulasi-manual-metode-dempster-shafer)
7. [Struktur Proyek (Directory Structure)](#7-struktur-proyek-directory-structure)
8. [Panduan Instalasi & Jalankan Aplikasi](#8-panduan-instalasi--jalankan-aplikasi)
9. [Dokumentasi API Endpoints](#9-dokumentasi-api-endpoints)

---

## 1. 🛠️ Tech Stack & Alasan Pemilihan

### Backend (`be-sp-rusa`)
- **FastAPI (Python 3.10+)**: Kerangka kerja backend berkinerja tinggi, berbasis asynchronous (ASGI). Dipilih karena proses eksekusi matematika/algoritma inferensi sangat cepat, memiliki OpenAPI/Swagger UI otomatis, serta integrasi Pydantic yang ketat.
- **SQLAlchemy (v2.0)**: Object-Relational Mapper (ORM) modern Python untuk pengelolaan query database secara aman dan aman dari SQL Injection.
- **PyMySQL & MySQL**: Database relasional MySQL/MariaDB dipilih untuk menjamin integritas data (ACID) dan hubungan *foreign key* antar tabel master.
- **PyJWT & Passlib / Pwdlib**: Keamanan autentikasi berstandar industri dengan enkripsi kata sandi (Argon2 / BCrypt) dan otentikasi stateless menggunakan JSON Web Tokens (JWT).

### Frontend (`fe-sp-rusa`)
- **React 19 + Vite 8**: Performa *rendering* frontend yang fleksibel dan instan. Vite memberikan *build time* yang sangat cepat dibanding bundler konvensional.
- **Tailwind CSS v4**: Framework Utility-First CSS untuk antarmuka pengguna yang responsif, modern, dan ringan.
- **Zustand**: Library manajemen *state* terpusat yang minimalis dan efisien tanpa *boilerplate* berlebih seperti Redux.
- **React Router v7**: Routing halaman *Single Page Application* (SPA) dengan fitur proteksi rute (*Auth Guards*).
- **Axios & Lucide React**: Modul HTTP client dengan interseptor request/response dan pustaka ikonik yang konsisten.

### Modeling / Experimentation (`modeling`)
- **Jupyter Notebook (`cf.ipynb`) & JSON**: Tempat pengujian awal dataset penyakit rusa, eksperimen pembobotan $MB$/$MD$, dan pemvalidasian algoritma Dempster-Shafer sebelum diimplementasikan ke backend FastAPI.

---

## 2. 🏗️ Arsitektur & Alur Sistem

```
┌─────────────────┐       HTTP Requests (JSON)      ┌─────────────────────────┐
│                 │ ──────────────────────────────> │                         │
│  React Frontend │                                 │     FastAPI Backend     │
│   (Vite + Tailwind) │ <────────────────────────────── │  (App / Router / Utils) │
└─────────────────┘       JSON Response + JWT       └────────────┬────────────┘
                                                                 │
                                                    SQLAlchemy   │ DB Queries
                                                                 ▼
                                                    ┌─────────────────────────┐
                                                    │     Database MySQL      │
                                                    │       (be_rusa)         │
                                                    └─────────────────────────┘
```

### Alur Sistem dari POV User:
1. **Registrasi / Login**: Pengguna masuk sebagai **Guest** (Peternak/Pengelola) atau **Admin**.
2. **Pilih Data Rusa**: Pengguna memilih atau mendaftarkan rusa yang akan diperiksa.
3. **Input Gejala & Keyakinan**: Pengguna memilih gejala yang terlihat pada rusa dan memberikan nilai keyakinan $CF_{\text{user}}$ (skala 0.0 - 1.0).
4. **Hasil Prediksi & Solusi**: Sistem menampilkan persentase diagnosa penyakit tertinggi, daftar ranking alternatif penyakit, serta rekomendasi penanganan medis.
5. **Riwayat Diagnosa**: Pengguna dapat melihat riwayat diagnosa yang tersimpan sebelumnya.

### Alur Sistem dari POV Server (Kalkulasi Diagnosa):
1. Client melakukan `POST /api/predictions` membawa `user_id`, `deer_id`, dan array `user_symptoms` (berisi `symptom_id` & `cf`).
2. Server memvalidasi token JWT via Middleware Authentication (`auth_utils.verify_token`).
3. Server mengambil relasi pakar (`expert_symptoms`) dari DB untuk seluruh `symptom_id` yang dipilih.
4. Server menghitung $CF_{\text{pakar}} = MB - MD$ dan $CF_{\text{akhir}} = CF_{\text{pakar}} \times CF_{\text{user}}$.
5. Server membentuk nilai **Basic Probability Assignment (BPA / Mass Function $m$)** untuk setiap gejala.
6. Server melakukan **Kombinasi Dempster-Shafer** secara sekuensial ($m_1 \oplus m_2 \oplus \dots \oplus m_n$).
7. Server menormalkan nilai probabilitas (menghapus elemen Konflik $K$).
8. Server memfilter focal set tunggal (1 penyakit), mengurutkan ranking berdasarkan probabilitas terbesar, lalu menyimpan hasil ke tabel `predictions` & `user_symptoms`.
9. Server mengembalikan response JSON berisi hasil diagnosa utama dan ranking.

---

## 3. 👥 Peran Pengguna (User Roles)

| Role | Hak Akses & Fitur |
|---|---|
| **`guest`** | • Melakukan registrasi & login.<br>• Melakukan konsultasi/prediksi penyakit rusa.<br>• Melihat riwayat prediksi rusa milik pribadi.<br>• Melihat detail rekomendasi penanganan. |
| **`admin`** | • Memiliki semua hak akses `guest`.<br>• Manajemen Master Data Penyakit (`diseases`).<br>• Manajemen Master Data Gejala (`symptoms`).<br>• Manajemen Relasi & Bobot Pakar (`expert_symptoms`).<br>• Manajemen Data Rusa (`deers`) & Pengguna (`users`). |

---

## 4. 🗄️ Struktur Basis Data (Database Schema)

Database menggunakan nama default **`be_rusa`**. Terdiri dari 7 tabel utama:

```mermaid
erDiagram
    users ||--o{ predictions : "membuat"
    deers ||--o{ predictions : "didiagnosa"
    diseases ||--o{ predictions : "hasil_utama"
    diseases ||--o{ expert_symptoms : "pemetaan_pakar"
    symptoms ||--o{ expert_symptoms : "bobot_gejala"
    symptoms ||--o{ user_symptoms : "dipilih_user"
    predictions ||--o{ user_symptoms : "memiliki_gejala"

    users {
        int id PK
        string name
        string email
        string password
        enum role "admin, guest"
    }

    deers {
        int id PK
        string name
    }

    diseases {
        int id PK
        string name
        string handling
    }

    symptoms {
        int id PK
        string name
    }

    expert_symptoms {
        int id PK
        float mb "Measure of Belief"
        float md "Measure of Disbelief"
        int symptom_id FK
        int disease_id FK
    }

    predictions {
        int id PK
        float cf "Nilai Kepastian Akhir (Mass)"
        int user_id FK
        int disease_id FK
        int deer_id FK
    }

    user_symptoms {
        int id PK
        float cf "Nilai Kepastian User"
        int symptom_id FK
        int prediction_id FK
    }
```

---

## 5. 🧮 Logika Inferensi & Formulas Matematika (POV Developer)

Algoritma dalam sistem pakar ini menggabungkan **Certainty Factor (CF)** untuk menghitung tingkat keyakinan tunggal, dan **Dempster-Shafer (DS)** untuk mengkombinasikan bukti-bukti dari berbagai gejala.

### Step 1: Hitung Certainty Factor Pakar ($CF_{\text{pakar}}$)
Setiap relasi Gejala ($G$) ke Penyakit ($P$) memiliki nilai *Measure of Belief* ($MB$) dan *Measure of Disbelief* ($MD$):
$$CF_{\text{pakar}} = MB - MD$$

### Step 2: Hitung Certainty Factor Akhir per Relasi ($CF_{\text{akhir}}$)
Nilai kepastian pakar dikalikan dengan bobot kepastian yang diberikan oleh pengguna ($CF_{\text{user}}$):
$$CF_{\text{akhir}} = CF_{\text{pakar}} \times CF_{\text{user}}$$

### Step 3: Pembentukan Basic Probability Assignment (BPA / Mass Function $m$)
Untuk sebuah gejala $G_i$ yang terhubung dengan subset penyakit (focal set) $H = \{P_1, P_2, \dots, P_k\}$:
- Mass fungsi untuk focal set $H$:
  $$m_i(H) = \frac{\sum CF_{\text{akhir}}}{k}$$
- Mass fungsi untuk ketidakpastian / semesta ($\Theta$):
  $$m_i(\Theta) = 1.0 - m_i(H)$$

### Step 4: Kombinasi Dempster-Shafer ($m_1 \oplus m_2$)
Kombinasi dua fungsi massa $m_1$ dan $m_2$ dihitung menggunakan aturan kombinasi Dempster:
$$m_{1,2}(X) = \frac{\sum_{A \cap B = X} m_1(A) \cdot m_2(B)}{1 - K}$$

Di mana $K$ adalah nilai **Konflik** (irisan himpunan kosong $\emptyset$):
$$K = \sum_{A \cap B = \emptyset} m_1(A) \cdot m_2(B)$$

Jika terdapat $n$ gejala, kombinasi dilakukan secara berurutan:
$$m_{\text{gabungan}} = ( (m_1 \oplus m_2) \oplus m_3 ) \dots \oplus m_n$$

---

## 6. 📝 Simulasi Manual Metode Dempster-Shafer

### Skenario Contoh:
Misalkan terdapat 2 Penyakit:
- $P_1$: Antraks
- $P_2$: Scabies

User memilih 2 Gejala:
1. **Gejala 1 ($G_1$)**: "Demam Tinggi Mendadak" ($CF_{\text{user}} = 1.0$)
   - Terkait $P_1$ (Antraks) dengan $MB = 0.8, MD = 0.1 \rightarrow CF_{\text{pakar}} = 0.7$
   - $CF_{\text{akhir}} = 0.7 \times 1.0 = 0.7$
   - Focal Set $H_1 = \{P_1\}$
   - $m_1(\{P_1\}) = 0.7$
   - $m_1(\Theta) = 1 - 0.7 = 0.3$

2. **Gejala 2 ($G_2$)**: "Gatal-gatal pada Kulit" ($CF_{\text{user}} = 0.8$)
   - Terkait $P_2$ (Scabies) dengan $MB = 0.9, MD = 0.1 \rightarrow CF_{\text{pakar}} = 0.8$
   - $CF_{\text{akhir}} = 0.8 \times 0.8 = 0.64$
   - Focal Set $H_2 = \{P_2\}$
   - $m_2(\{P_2\}) = 0.64$
   - $m_2(\Theta) = 1 - 0.64 = 0.36$

---

### Tabel Kombinasi $m_1 \oplus m_2$:

| $m_1 \backslash m_2$ | $m_2(\{P_2\}) = 0.64$ | $m_2(\Theta) = 0.36$ |
|---|---|---|
| **$m_1(\{P_1\}) = 0.7$** | $\{P_1\} \cap \{P_2\} = \emptyset$<br>Massa = $0.7 \times 0.64 = 0.448$ **(Konflik)** | $\{P_1\} \cap \Theta = \{P_1\}$<br>Massa = $0.7 \times 0.36 = 0.252$ |
| **$m_1(\Theta) = 0.3$** | $\Theta \cap \{P_2\} = \{P_2\}$<br>Massa = $0.3 \times 0.64 = 0.192$ | $\Theta \cap \Theta = \Theta$<br>Massa = $0.3 \times 0.36 = 0.108$ |

---

### Perhitungan Normalisasi:
1. **Hitung Nilai Konflik ($K$)**:
   $$K = 0.448$$
   $$\text{Pembagi} = 1 - K = 1 - 0.448 = 0.552$$

2. **Hitung Mass Hasil Normalisasi**:
   - $m_{\text{gabungan}}(\{P_1\}) = \frac{0.252}{0.552} \approx 0.4565 \text{ (45.65\%)}$
   - $m_{\text{gabungan}}(\{P_2\}) = \frac{0.192}{0.552} \approx 0.3478 \text{ (34.78\%)}$
   - $m_{\text{gabungan}}(\Theta) = \frac{0.108}{0.552} \approx 0.1957 \text{ (19.57\%)}$

### Kesimpulan Diagnosa:
- Diagnosa Utama: **$P_1$ (Antraks)** dengan persentase keyakinan **45.65%**.
- Ranking 2: **$P_2$ (Scabies)** dengan persentase keyakinan **34.78%**.

---

## 7. 📁 Struktur Proyek (Directory Structure)

```
SP Penyakit Rusa/
├── README.md                          # Dokumentasi utama proyek
├── docs.txt                           # Catatan kebutuhan & requirement
├── SQL.txt                            # DDL awal basis data MySQL
├── app/
│   ├── be-sp-rusa/                    # Backend (FastAPI + SQLAlchemy)
│   │   ├── main.py                    # Entry point aplikasi FastAPI & CORS
│   │   ├── config.py                  # Pydantic BaseSettings (.env reader)
│   │   ├── seed.py                    # Script seeder data awal
│   │   ├── requirement.txt            # Dependensi Python
│   │   ├── .env                       # File konfigurasi environment
│   │   └── src/
│   │       ├── db/
│   │       │   ├── database.py        # Kategori engine SQLAlchemy & SessionLocal
│   │       │   └── models.py          # Definisi ORM Model SQLAlchemy
│   │       ├── routes/                # Endpoint Handlers
│   │       │   ├── router.py          # Master Router
│   │       │   ├── auth.py            # Autentikasi (Register, Login, Me)
│   │       │   ├── disease.py         # CRUD Master Penyakit
│   │       │   ├── symptom.py         # CRUD Master Gejala
│   │       │   ├── expert_symptom.py  # CRUD Relasi & Bobot Pakar
│   │       │   ├── deer.py            # CRUD Data Rusa
│   │       │   ├── user.py            # CRUD User (Admin)
│   │       │   └── prediction.py      # Algoritma DS/CF & Diagnosa
│   │       ├── schemas/               # Validasi request & response (Pydantic)
│   │       └── utils/                 # Utility Hashing, JWT, & Standard Response
│   │
│   ├── fe-sp-rusa/                    # Frontend (React 19 + Vite 8 + Tailwind)
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── src/
│   │       ├── api/                   # Konfigurasi Axios & API Client
│   │       ├── components/            # Komponen UI Reusable
│   │       ├── features/              # Modul Fitur (auth, prediksi, admin, landing)
│   │       ├── layouts/               # Layout Dasar (Navbar, Sidebar, Footer)
│   │       ├── routes/                # Konfigurasi React Router & Guard
│   │       └── store/                 # Zustand Store (Auth State, User State)
│   │
│   └── modeling/                      # Notebook Modeling & Dataset
│       ├── cf.ipynb                   # Simulation Notebook Dempster-Shafer
│       └── dataset.json               # Raw Dataset Penyakit & Gejala
```

---

## 8. 🚀 Panduan Instalasi & Jalankan Aplikasi

### Prerequisites (Persyaratan):
- Node.js (v18+) & `npm` / `pnpm`
- Python (v3.10+)
- MySQL Server (XAMPP / MariaDB / Docker MySQL)

---

### Langkah 1: Setup Backend (`be-sp-rusa`)

1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd app/be-sp-rusa
   ```

2. Buat virtual environment & aktifkan:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / MacOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependensi Python:
   ```bash
   pip install -r requirement.txt
   ```

4. Buat file `.env` (sesuaikan kredensial MySQL):
   ```env
   DATABASE_URL="mysql+pymysql://root:root@localhost:3306/be_rusa"
   SECRET_KEY="rahasia_super_aman"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ACCESS_TOKEN_SECRET_KEY="access-token-secret-here"
   REFRESH_TOKEN_SECRET_KEY="refresh-token-secret-here"
   ```

5. Buat database `be_rusa` di MySQL Anda, lalu jalankan Seeder:
   ```bash
   python seed.py
   ```

6. Jalankan Server FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   > Backend akan berjalan di `http://localhost:8000`. Swagger API docs tersedia di `http://localhost:8000/docs`.

---

### Langkah 2: Setup Frontend (`fe-sp-rusa`)

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd app/fe-sp-rusa
   ```

2. Install paket dependensi:
   ```bash
   npm install
   # atau jika menggunakan pnpm
   pnpm install
   ```

3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   > Frontend akan berjalan di `http://localhost:5173`.

---

## 9. 📡 Dokumentasi API Endpoints

Semua endpoint berbasis rute `/api` dan menggunakan otentikasi JWT Bearer Token (kecuali rute publik).

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan pengguna baru (`role: guest`) | Public |
| `POST` | `/api/auth/login` | Authentication user & mendapatkan JWT Token | Public |
| `GET` | `/api/auth/me` | Mengambil profile pengguna yang sedang login | Authenticated |

### 🩺 Predictions & Diagnosa (`/api/predictions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/predictions` | Memproses inferensi Dempster-Shafer & membuat diagnosa | Authenticated |
| `GET` | `/api/predictions` | Ambil daftar riwayat diagnosa (bisa difilter per `user_id`) | Authenticated |
| `GET` | `/api/predictions/{id}` | Ambil detail 1 hasil diagnosa | Authenticated |
| `DELETE`| `/api/predictions/{id}` | Hapus riwayat diagnosa | Authenticated |

### 🦠 Master Data Penyakit & Gejala
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST/PUT/DELETE` | `/api/diseases` | Kelola master data penyakit | Authenticated / Admin |
| `GET/POST/PUT/DELETE` | `/api/symptoms` | Kelola master data gejala | Authenticated / Admin |
| `GET/POST/PUT/DELETE` | `/api/expert-symptoms` | Kelola relasi gejala-penyakit ($MB, MD$) | Authenticated / Admin |
| `GET/POST/PUT/DELETE` | `/api/deers` | Kelola data profil rusa | Authenticated |

---

> 💡 **Kontribusi & Pemeliharaan Kode**: Saat menambah gejala baru atau memodifikasi bobot $MB$/$MD$, pastikan untuk memperbarui seeder (`seed.py`) atau melalui dashboard admin agar tabel `expert_symptoms` tetap konsisten.
