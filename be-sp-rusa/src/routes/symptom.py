from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.symptom import Symptom as SymptomSchema, SymptomCreate, SymptomUpdate

router = APIRouter(prefix="/symptoms", tags=["symptoms"], dependencies=[Depends(auth_utils.verify_token)])

@router.get("/")
def get_all_symptoms(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman")
):
    try:
        # 1. Hitung total data
        total = db.query(models.Symptom).count()
        
        # 2. Ambil data sesuai halaman dan limit
        offset = (page - 1) * limit
        symptoms = db.query(models.Symptom).offset(offset).limit(limit).all()
        
        # 3. Mapping data menggunakan skema Pydantic
        symptoms_data = [SymptomSchema.model_validate(s).model_dump() for s in symptoms]
        
        # 4. Kembalikan data beserta info pagination
        return res.ok_response(data={
            "items": symptoms_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": -(-total // limit)
        })
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.get("/{id}")
def get_symptom(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        symptom = db.query(models.Symptom).filter(models.Symptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not symptom:
            return res.not_found_response("Data gejala tidak ditemukan")
            
        # 3. Mapping data ke skema Pydantic
        symptom_data = SymptomSchema.model_validate(symptom).model_dump()
        
        # 4. Kembalikan data
        return res.ok_response(data=symptom_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/")
def create_symptom(request: SymptomCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi data request ke Model
        new_symptom = models.Symptom(**request.model_dump())
        
        # 2. Simpan ke database
        db.add(new_symptom)
        db.commit()
        db.refresh(new_symptom)
        
        # 3. Mapping response dengan skema Pydantic
        symptom_data = SymptomSchema.model_validate(new_symptom).model_dump()
        return res.created_response(data=symptom_data, message="Data gejala berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.put("/{id}")
def update_symptom(id: int, request: SymptomUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        symptom = db.query(models.Symptom).filter(models.Symptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not symptom:
            return res.not_found_response("Data gejala tidak ditemukan")
            
        # 3. Update field data
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(symptom, key, value)
        
        # 4. Commit perubahan
        db.commit()
        db.refresh(symptom)
        
        # 5. Mapping response dengan skema Pydantic
        symptom_data = SymptomSchema.model_validate(symptom).model_dump()
        return res.ok_response(data=symptom_data, message="Data gejala berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.delete("/{id}")
def delete_symptom(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        symptom = db.query(models.Symptom).filter(models.Symptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not symptom:
            return res.not_found_response("Data gejala tidak ditemukan")
            
        # 3. Hapus data dari DB
        db.delete(symptom)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Kembalikan response sukses
        return res.ok_response(message="Data gejala berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
