from fastapi import APIRouter, Depends, Cookie
from sqlalchemy.orm import Session
from ..db import models, database
from ..utils import auth_utils, http_response as res
from pydantic import BaseModel

from ..schemas.user import UserLogin, User, UserCreate
from config import settings

from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register")
def register(request: UserCreate, db: Session = Depends(database.get_db)):
    try:
        user_data = request.model_dump()
        user_data["password"] = auth_utils.hash_password(user_data["password"])
        db.add(models.User(**user_data))
        db.commit()
        return res.created_response(data=user_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/login")
def login(request: UserLogin, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari User
        user = db.query(models.User).filter(models.User.email == request.email).first()
        if not user:
            return res.not_found_response("User tidak ditemukan")

        # 2. Verifikasi Password
        if not auth_utils.verify_password(request.password, user.password):
            return res.unauthorized_response("Email atau password salah")
        
        # 3. Buat Token
        access_token = auth_utils.create_token(
            payload={"email": user.email, "username": user.name, "role": user.role.value},
            key=settings.ACCESS_TOKEN_SECRET_KEY,
            expire_time=timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        )
        refresh_token = auth_utils.create_token(
            payload={"email": user.email, "username": user.name, "role": user.role.value},
            key=settings.REFRESH_TOKEN_SECRET_KEY,
            expire_time=timedelta(days=int(settings.REFRESH_TOKEN_EXPIRE_DAYS))
        )

        # 4. Response Data
        return res.ok_response(
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            },
            message="Login berhasil"
        )
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")

@router.post("/refresh")
def refresh(request: RefreshRequest, db: Session = Depends(database.get_db)):
    try:
        # 1. Validasi Refresh Token
        payload = auth_utils.decode_token(request.refresh_token, settings.REFRESH_TOKEN_SECRET_KEY)
        email = payload.get("email")
        
        # 2. Cek User di DB
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return res.not_found_response("User tidak ditemukan")
            
        # 3. Generate Access Token Baru
        access_token = auth_utils.create_token(
            payload={"email": user.email, "username": user.name, "role": user.role.value},
            key=settings.ACCESS_TOKEN_SECRET_KEY,
            expire_time=timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        )
        
        return res.ok_response(
            data={"access_token": access_token, "token_type": "bearer"}
        )
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
