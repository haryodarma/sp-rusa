from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.deer import Deer as DeerSchema, DeerCreate, DeerUpdate

router = APIRouter(prefix="/deers", tags=["deers"], dependencies=[Depends(auth_utils.verify_token)])

@router.get("/")
def get_all_deers(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman")
):
    try:
        # 1. Hitung total data
        total = db.query(models.Deer).count()
        
        # 2. Ambil data sesuai halaman dan limit
        offset = (page - 1) * limit
        deers = db.query(models.Deer).offset(offset).limit(limit).all()
        
        # 3. Mapping data menggunakan skema Pydantic
        deers_data = [DeerSchema.model_validate(d).model_dump() for d in deers]
        
        # 4. Kembalikan data beserta info pagination
        return res.ok_response(data={
            "items": deers_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": -(-total // limit)  # Pembulatan ke atas
        })
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.get("/{id}")
def get_deer(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        deer = db.query(models.Deer).filter(models.Deer.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not deer:
            return res.not_found_response("Data rusa tidak ditemukan")
            
        # 3. Mapping data ke skema Pydantic
        deer_data = DeerSchema.model_validate(deer).model_dump()
        
        # 4. Kembalikan data
        return res.ok_response(data=deer_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/")
def create_deer(request: DeerCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi data request ke Model
        new_deer = models.Deer(**request.model_dump())
        
        # 2. Simpan ke database
        db.add(new_deer)
        db.commit()
        db.refresh(new_deer)
        
        # 3. Mapping response dengan skema Pydantic
        deer_data = DeerSchema.model_validate(new_deer).model_dump()
        return res.created_response(data=deer_data, message="Data rusa berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.put("/{id}")
def update_deer(id: int, request: DeerUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        deer = db.query(models.Deer).filter(models.Deer.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not deer:
            return res.not_found_response("Data rusa tidak ditemukan")
            
        # 3. Update field data
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(deer, key, value)
        
        # 4. Commit perubahan
        db.commit()
        db.refresh(deer)
        
        # 5. Mapping response dengan skema Pydantic
        deer_data = DeerSchema.model_validate(deer).model_dump()
        return res.ok_response(data=deer_data, message="Data rusa berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

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
