# Coding Guidelines for Routes (Pedoman Penulisan Rute API)

Dokumen ini berisi panduan untuk menulis kode di folder `src/routes/` agar konsisten, mudah dipelajari oleh pemula, dan aman dari error. AI wajib membaca dan mengikuti aturan ini saat membuat atau mengubah rute API untuk semua modul (termasuk Auth dan Tabel Master CRUD).

---

## 1. Gunakan Blok `try-except` dan Tampilkan Pesan Error Exception
Gunakan blok `try-except` pada operasi yang melakukan perubahan pada database (Create, Update, Delete) atau proses yang berisiko memicu error.
- Tangkap exception dengan `except Exception as e:`.
- Kembalikan respon error internal dengan pesan exception yang jelas menggunakan `res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")` atau `res.internal_error_response(message=str(e))`.

```python
# Contoh pada Operasi POST/Create
@router.post("/")
def create_deer(request: DeerCreate, db: Session = Depends(database.get_db)):
    try:
        # Proses utama...
        return res.created_response(data=new_deer)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
```

## 2. Validasi Sederhana dan Cepat (Early Return)
Lakukan validasi keberadaan data di awal fungsi menggunakan struktur `if-not` dan langsung kembalikan respon error yang sesuai agar alur kode lurus dan mudah dibaca (Flat Code).
- Jika data tidak ditemukan: `res.not_found_response("Nama/ID tidak ditemukan")`
- Jika otentikasi/otorisasi gagal: `res.unauthorized_response("Akses ditolak")`

```python
# Validasi keberadaan data berdasarkan ID
deer = db.query(models.Deer).filter(models.Deer.id == deer_id).first()
if not deer:
    return res.not_found_response("Data Rusa tidak ditemukan")
```

## 3. Struktur Berurutan Menggunakan Komentar Berangka (Bahasa Indonesia)
Untuk memudahkan pemahaman alur kerja oleh pemula, tulis komentar langkah-demi-langkah menggunakan angka dan bahasa Indonesia yang mudah dipahami pada setiap endpoint.

### Contoh Pola CRUD Master (Tabel Umum):

#### A. Ambil Satu Data (GET By ID)
```python
@router.get("/{id}")
def get_deer(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        deer = db.query(models.Deer).filter(models.Deer.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not deer:
            return res.not_found_response("Data rusa tidak ditemukan")
            
        # 3. Kembalikan data
        return res.ok_response(data=deer)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
```

#### B. Tambah Data Baru (POST)
```python
@router.post("/")
def create_deer(request: DeerCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi data request ke Model
        new_deer = models.Deer(name=request.name)
        
        # 2. Simpan ke database
        db.add(new_deer)
        db.commit()
        db.refresh(new_deer)
        
        # 3. Kembalikan response sukses
        return res.created_response(data=new_deer, message="Data rusa berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
```

#### C. Ubah Data (PUT)
```python
@router.put("/{id}")
def update_deer(id: int, request: DeerUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        deer = db.query(models.Deer).filter(models.Deer.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not deer:
            return res.not_found_response("Data rusa tidak ditemukan")
            
        # 3. Update field data
        deer.name = request.name
        
        # 4. Commit perubahan
        db.commit()
        db.refresh(deer)
        
        # 5. Kembalikan response sukses
        return res.ok_response(data=deer, message="Data rusa berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
```

#### D. Hapus Data (DELETE)
```python
@router.delete("/{id}")
def delete_deer(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        deer = db.query(models.Deer).filter(models.Deer.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not deer:
            return res.not_found_response("Data rusa tidak ditemukan")
            
        # 3. Hapus data dari DB
        db.delete(deer)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Kembalikan response sukses
        return res.ok_response(message="Data rusa berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
```

## 4. Gunakan Helper Respon Terstandarisasi (`http_response`)
Selalu impor dan gunakan utility helper respon `src/utils/http_response.py` sebagai `res` untuk standarisasi format keluaran API.
- `res.ok_response(data, message)` -> Status 200 (Untuk GET, PUT, DELETE sukses)
- `res.created_response(data, message)` -> Status 201 (Untuk POST sukses)
- `res.not_found_response(message)` -> Status 404
- `res.unauthorized_response(message)` -> Status 401
- `res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")` -> Status 500
