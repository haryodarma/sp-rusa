from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class User(BaseModel):
    id: int
    name: str
    role: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    name: str
    role: str = "guest"
    password: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
