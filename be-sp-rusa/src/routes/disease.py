from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.disease import Disease as DiseaseSchema, DiseaseCreate, DiseaseUpdate

router = APIRouter(prefix="/diseases", tags=["diseases"], dependencies=[Depends(auth_utils.verify_token)])

@router.get("/")
def get_all_diseases(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman")
):
    try:
        # 1. Hitung total data
        total = db.query(models.Disease).count()
        
        # 2. Ambil data sesuai halaman dan limit
        offset = (page - 1) * limit
        diseases = db.query(models.Disease).offset(offset).limit(limit).all()
        
        # 3. Mapping data menggunakan skema Pydantic
        diseases_data = [DiseaseSchema.model_validate(d).model_dump() for d in diseases]
        
        # 4. Kembalikan data beserta info pagination
        return res.ok_response(data={
            "items": diseases_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": -(-total // limit)
        })
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.get("/{id}")
def get_disease(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        disease = db.query(models.Disease).filter(models.Disease.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not disease:
            return res.not_found_response("Data penyakit tidak ditemukan")
            
        # 3. Mapping data ke skema Pydantic
        disease_data = DiseaseSchema.model_validate(disease).model_dump()
        
        # 4. Kembalikan data
        return res.ok_response(data=disease_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/")
def create_disease(request: DiseaseCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi data request ke Model
        new_disease = models.Disease(**request.model_dump())
        
        # 2. Simpan ke database
        db.add(new_disease)
        db.commit()
        db.refresh(new_disease)
        
        # 3. Mapping response dengan skema Pydantic
        disease_data = DiseaseSchema.model_validate(new_disease).model_dump()
        return res.created_response(data=disease_data, message="Data penyakit berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.put("/{id}")
def update_disease(id: int, request: DiseaseUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        disease = db.query(models.Disease).filter(models.Disease.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not disease:
            return res.not_found_response("Data penyakit tidak ditemukan")
            
        # 3. Update field data
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(disease, key, value)
        
        # 4. Commit perubahan
        db.commit()
        db.refresh(disease)
        
        # 5. Mapping response dengan skema Pydantic
        disease_data = DiseaseSchema.model_validate(disease).model_dump()
        return res.ok_response(data=disease_data, message="Data penyakit berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.delete("/{id}")
def delete_disease(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        disease = db.query(models.Disease).filter(models.Disease.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not disease:
            return res.not_found_response("Data penyakit tidak ditemukan")
            
        # 3. Hapus data dari DB
        db.delete(disease)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Kembalikan response sukses
        return res.ok_response(message="Data penyakit berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
