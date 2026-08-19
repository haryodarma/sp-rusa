from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.user_symptom import UserSymptom as UserSymptomSchema, UserSymptomCreate, UserSymptomUpdate

router = APIRouter(prefix="/user-symptoms", tags=["user_symptoms"], dependencies=[Depends(auth_utils.verify_token)])

@router.get("/")
def get_all_user_symptoms(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman")
):
    try:
        # 1. Hitung total data
        total = db.query(models.UserSymptom).count()
        
        # 2. Ambil data beserta relasi (user dan symptom)
        offset = (page - 1) * limit
        user_symptoms = (
            db.query(models.UserSymptom)
            .options(
             
                joinedload(models.UserSymptom.symptom)
            )
            .offset(offset)
            .limit(limit)
            .all()
        )
        
        # 3. Mapping data menggunakan skema Pydantic
        user_symptoms_data = [UserSymptomSchema.model_validate(us).model_dump() for us in user_symptoms]
        
        # 4. Kembalikan data beserta info pagination
        return res.ok_response(data={
            "items": user_symptoms_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": -(-total // limit)
        })
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.get("/{id}")
def get_user_symptom(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB beserta relasi
        user_symptom = (
            db.query(models.UserSymptom)
            .options(
              
                joinedload(models.UserSymptom.symptom)
            )
            .filter(models.UserSymptom.id == id)
            .first()
        )
        
        # 2. Validasi jika data tidak ditemukan
        if not user_symptom:
            return res.not_found_response("Data gejala user tidak ditemukan")
            
        # 3. Mapping data ke skema Pydantic
        user_symptom_data = UserSymptomSchema.model_validate(user_symptom).model_dump()
        
        # 4. Kembalikan data
        return res.ok_response(data=user_symptom_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/")
def create_user_symptom(request: UserSymptomCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi data request ke Model
        new_user_symptom = models.UserSymptom(**request.model_dump())
        
        # 2. Simpan ke database
        db.add(new_user_symptom)
        db.commit()
        db.refresh(new_user_symptom)
        
        # 3. Load ulang dengan relasi
        user_symptom = (
            db.query(models.UserSymptom)
            .options(
                joinedload(models.UserSymptom.symptom)
            )
            .filter(models.UserSymptom.id == new_user_symptom.id)
            .first()
        )
        
        # 4. Mapping response dengan skema Pydantic
        user_symptom_data = UserSymptomSchema.model_validate(user_symptom).model_dump()
        return res.created_response(data=user_symptom_data, message="Data gejala user berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.put("/{id}")
def update_user_symptom(id: int, request: UserSymptomUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        user_symptom = db.query(models.UserSymptom).filter(models.UserSymptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not user_symptom:
            return res.not_found_response("Data gejala user tidak ditemukan")
            
        # 3. Update field data
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(user_symptom, key, value)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Load ulang dengan relasi
        user_symptom = (
            db.query(models.UserSymptom)
            .options(
               
                joinedload(models.UserSymptom.symptom)
            )
            .filter(models.UserSymptom.id == id)
            .first()
        )
        
        # 6. Mapping response dengan skema Pydantic
        user_symptom_data = UserSymptomSchema.model_validate(user_symptom).model_dump()
        return res.ok_response(data=user_symptom_data, message="Data gejala user berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.delete("/{id}")
def delete_user_symptom(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        user_symptom = db.query(models.UserSymptom).filter(models.UserSymptom.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not user_symptom:
            return res.not_found_response("Data gejala user tidak ditemukan")
            
        # 3. Hapus data dari DB
        db.delete(user_symptom)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Kembalikan response sukses
        return res.ok_response(message="Data gejala user berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
