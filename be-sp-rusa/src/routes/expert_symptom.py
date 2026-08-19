from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.expert_symptom import ExpertSymptom as ExpertSymptomSchema, ExpertSymptomCreate, ExpertSymptomUpdate

router = APIRouter(prefix="/expert-symptoms", tags=["expert_symptoms"], dependencies=[Depends(auth_utils.verify_token)])

@router.get("/")
def get_all_expert_symptoms(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman")
):
    try:
        # 1. Hitung total data
        total = db.query(models.ExpertSymptom).count()
        
        # 2. Ambil data beserta relasi (symptom dan disease)
        offset = (page - 1) * limit
        expert_symptoms = (
            db.query(models.ExpertSymptom)
            .options(
                joinedload(models.ExpertSymptom.symptom),
                joinedload(models.ExpertSymptom.disease)
            )
            .offset(offset)
            .limit(limit)
            .all()
        )
        
        # 3. Mapping data menggunakan skema Pydantic
        expert_symptoms_data = [ExpertSymptomSchema.model_validate(es).model_dump() for es in expert_symptoms]
        
        # 4. Kembalikan data beserta info pagination
        return res.ok_response(data={
            "items": expert_symptoms_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": -(-total // limit)
        })
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.get("/{id}")
def get_expert_symptom(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB beserta relasi
        expert_symptom = (
            db.query(models.ExpertSymptom)
            .options(
                joinedload(models.ExpertSymptom.symptom),
                joinedload(models.ExpertSymptom.disease)
            )
            .filter(models.ExpertSymptom.id == id)
            .first()
        )
        
        # 2. Validasi jika data tidak ditemukan
        if not expert_symptom:
            return res.not_found_response("Data gejala pakar tidak ditemukan")
            
        # 3. Mapping data ke skema Pydantic
        expert_symptom_data = ExpertSymptomSchema.model_validate(expert_symptom).model_dump()
        
        # 4. Kembalikan data
        return res.ok_response(data=expert_symptom_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/")
def create_expert_symptom(request: ExpertSymptomCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi data request ke Model
        new_expert_symptom = models.ExpertSymptom(**request.model_dump())
        
        # 2. Simpan ke database
        db.add(new_expert_symptom)
        db.commit()
        db.refresh(new_expert_symptom)
        
        # 3. Load ulang dengan relasi
        expert_symptom = (
            db.query(models.ExpertSymptom)
            .options(
                joinedload(models.ExpertSymptom.symptom),
                joinedload(models.ExpertSymptom.disease)
            )
            .filter(models.ExpertSymptom.id == new_expert_symptom.id)
            .first()
        )
        
        # 4. Mapping response dengan skema Pydantic
        expert_symptom_data = ExpertSymptomSchema.model_validate(expert_symptom).model_dump()
        return res.created_response(data=expert_symptom_data, message="Data gejala pakar berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.put("/{id}")
def update_expert_symptom(id: int, request: ExpertSymptomUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        expert_symptom = db.query(models.ExpertSymptom).filter(models.ExpertSymptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not expert_symptom:
            return res.not_found_response("Data gejala pakar tidak ditemukan")
            
        # 3. Update field data
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(expert_symptom, key, value)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Load ulang dengan relasi
        expert_symptom = (
            db.query(models.ExpertSymptom)
            .options(
                joinedload(models.ExpertSymptom.symptom),
                joinedload(models.ExpertSymptom.disease)
            )
            .filter(models.ExpertSymptom.id == id)
            .first()
        )
        
        # 6. Mapping response dengan skema Pydantic
        expert_symptom_data = ExpertSymptomSchema.model_validate(expert_symptom).model_dump()
        return res.ok_response(data=expert_symptom_data, message="Data gejala pakar berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.delete("/{id}")
def delete_expert_symptom(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        expert_symptom = db.query(models.ExpertSymptom).filter(models.ExpertSymptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not expert_symptom:
            return res.not_found_response("Data gejala pakar tidak ditemukan")
            
        # 3. Hapus data dari DB
        db.delete(expert_symptom)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Kembalikan response sukses
        return res.ok_response(message="Data gejala pakar berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
