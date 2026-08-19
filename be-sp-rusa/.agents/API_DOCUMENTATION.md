# Dokumentasi API - SP Penyakit Rusa

Dokumen ini merupakan referensi cepat bagi AI asisten dan pengembang untuk memahami arsitektur dan struktur API saat melakukan pembaruan (update) tanpa harus memeriksa semua file kode satu per satu.

---

## 1. Arsitektur Model Database (SQLAlchemy)
File: `src/db/models.py`

Berikut adalah tabel-tabel utama yang tersedia di sistem:
- **User**: Sistem pengguna (`id`, `name`, `email`, `password`, `role`).
- **Deer**: Data spesies/tipe rusa (`id`, `name`).
- **Disease**: Data penyakit (`id`, `name`, `handling`).
- **Symptom**: Data gejala umum (`id`, `name`).
- **ExpertSymptom**: Relasi pakar antara penyakit dan gejala beserta probabilitas/bobot (`id`, `mb`, `md`, `symptom_id`, `disease_id`).
- **UserSymptom**: Gejala yang dipilih user dalam proses diagnosa (`id`, `cf`, `user_id`, `symptom_id`, `prediction_id`).
- **Prediction**: Hasil prediksi/diagnosa (`id`, `cf`, `user_id`, `disease_id`, `deer_id`).

---

## 2. Standar Skema Pydantic
File: Folder `src/schemas/`

Untuk setiap model database, telah dibuat skema Pydantic dengan menggunakan fitur `ConfigDict(from_attributes=True)` milik Pydantic v2. 
Setiap modul tabel memiliki 3 jenis skema utama:
1. `[NamaModel]`: Skema penuh, termasuk `id`. Digunakan sebagai bentuk _response_.
2. `[NamaModel]Create`: Skema untuk pembuatan data baru (tanpa `id`).
3. `[NamaModel]Update`: Skema untuk mengubah data lama (umumnya bidang opsional/sama dengan _Create_).

---

## 3. Daftar Endpoint API (Routes)
File: Folder `src/routes/` | Terdaftar pada `src/routes/router.py` dengan prefix `/api`.

Setiap model entitas sudah memiliki standar endpoint CRUD tersendiri (GET List, GET by ID, POST, PUT, DELETE). 
Seluruh endpoint diamankan dengan otentikasi JWT (`dependencies=[Depends(auth_utils.verify_token)]`).

Terdapat 8 grup _router_ yang diregistrasikan:
1. **/api/auth**: Proses autentikasi (Login, Register, Refresh Token) -> `auth.py`.
2. **/api/users**: Endpoint user -> `user.py`.
3. **/api/deers**: CRUD Rusa -> `deer.py`.
4. **/api/diseases**: CRUD Penyakit -> `disease.py`.
5. **/api/symptoms**: CRUD Gejala -> `symptom.py`.
6. **/api/expert-symptoms**: CRUD Gejala Pakar -> `expert_symptom.py`.
7. **/api/user-symptoms**: CRUD Gejala User -> `user_symptom.py`.
8. **/api/predictions**: CRUD Prediksi / Diagnosa -> `prediction.py`.

---

## 4. Panduan Ketika Melakukan Pembaruan (Update)
Jika AI diminta untuk memperbarui atau menambahkan endpoint baru, **JANGAN MENEBAK**. 
Silakan lakukan ini:
1. Pastikan Anda telah merujuk pada standar aturan kode di `.agents/AGENTS.md` (menggunakan helper `try-except`, `res.ok_response`, dll).
2. Lihat definisi skema yang ada di `src/schemas/` sebelum mengirim data.
3. Gunakan _session object_ `db: Session = Depends(database.get_db)` yang telah distandardisasi di setiap route fungsi.
4. Ketika memperbarui struktur Database, perbarui file model di `src/db/models.py`, lalu perbarui skemanya di `src/schemas/`, baru kemudian ubah logika CRUD di `src/routes/`.
