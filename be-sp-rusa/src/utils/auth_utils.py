from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
import jwt
from datetime import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from config import settings

password_hash = PasswordHash((Argon2Hasher(),))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password:str):
    return password_hash.hash(password)

def verify_password(plain_password:str, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def create_token(payload:dict, expire_time , key:str):
    data = payload.copy()
    expire = datetime.now() + expire_time
    data.update({"exp":expire})
    return jwt.encode(payload=data, key=key, algorithm=settings.ALGORITHM)

def verify_token(token : str = Depends(oauth2_scheme))-> dict :
    try:
        # Decode & verifikasi token
        payload = jwt.decode(token, key = settings.ACCESS_TOKEN_SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token sudah kadaluarsa",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token tidak valid",
            headers={"WWW-Authenticate": "Bearer"},
        )

def decode_token(token:str, key:str):
   
    return jwt.decode(token, key,algorithms=[settings.ALGORITHM])