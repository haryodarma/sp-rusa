from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["user"], dependencies=[Depends(auth_utils.verify_token)])

@router.get("/")
def get_all_users(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman")
):
    try:
        # 1. Hitung total data
        total = db.query(models.User).count()
        
        # 2. Ambil data sesuai halaman dan limit
        offset = (page - 1) * limit
        users = db.query(models.User).offset(offset).limit(limit).all()
        
        # 3. Mapping data menggunakan skema Pydantic
        users_data = [UserSchema.model_validate(u).model_dump() for u in users]
        
        # 4. Kembalikan data beserta info pagination
        return res.ok_response(data={
            "items": users_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": -(-total // limit)
        })
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.get("/{id}")
def get_user(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        user = db.query(models.User).filter(models.User.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not user:
            return res.not_found_response("Data user tidak ditemukan")
            
        # 3. Mapping data ke skema Pydantic
        user_data = UserSchema.model_validate(user).model_dump()
        
        # 4. Kembalikan data
        return res.ok_response(data=user_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/")
def create_user(request: UserCreate, db: Session = Depends(database.get_db)):
    try:
        # 1. Konversi request dan hash password
        user_dict = request.model_dump()
        user_dict["password"] = auth_utils.hash_password(user_dict["password"])
        
        # 2. Buat instance model User baru
        new_user = models.User(**user_dict)
        
        # 3. Simpan ke database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # 4. Response data yang sudah diformat skema
        user_data = UserSchema.model_validate(new_user).model_dump()
        return res.created_response(data=user_data, message="Data user berhasil ditambahkan")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.put("/{id}")
def update_user(id: int, request: UserUpdate, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data lama di DB
        user = db.query(models.User).filter(models.User.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not user:
            return res.not_found_response("Data user tidak ditemukan")
            
        # 3. Update field data
        update_data = request.model_dump(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["password"] = auth_utils.hash_password(update_data["password"])
            
        for key, value in update_data.items():
            setattr(user, key, value)
        
        # 4. Commit perubahan
        db.commit()
        db.refresh(user)
        
        # 5. Response data yang sudah diformat skema
        user_data = UserSchema.model_validate(user).model_dump()
        return res.ok_response(data=user_data, message="Data user berhasil diubah")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.delete("/{id}")
def delete_user(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        user = db.query(models.User).filter(models.User.id == id).first()
        
        # 2. Validasi jika data tidak ditemukan
        if not user:
            return res.not_found_response("Data user tidak ditemukan")
            
        # 3. Hapus data dari DB
        db.delete(user)
        
        # 4. Commit perubahan
        db.commit()
        
        # 5. Kembalikan response sukses
        return res.ok_response(message="Data user berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")