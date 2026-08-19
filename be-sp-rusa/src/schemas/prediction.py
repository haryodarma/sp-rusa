from pydantic import BaseModel, ConfigDict
from typing import Optional, List

# Skema minimal untuk digunakan sebagai nested relasi
class UserNested(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)

class DiseaseNested(BaseModel):
    id: int
    name: str
    handling: str

    model_config = ConfigDict(from_attributes=True)

class DeerNested(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class SymptomNested(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class UserSymptomNested(BaseModel):
    cf: float
    symptom_id: int
    symptom: Optional[SymptomNested] = None

    model_config = ConfigDict(from_attributes=True)

# Skema utama dengan data relasi
class Prediction(BaseModel):
    id: int
    cf: Optional[float] = None
    user_id: int
    disease_id: Optional[int] = None
    deer_id: int
    user: Optional[UserNested] = None
    disease: Optional[DiseaseNested] = None
    deer: Optional[DeerNested] = None
    user_symptoms: List[UserSymptomNested] = []

    model_config = ConfigDict(from_attributes=True)

class PredictionCreate(BaseModel):
   
    user_id: int
    deer_id: int
    user_symptoms: List[UserSymptomNested] = []

    model_config = ConfigDict(from_attributes=True)

class PredictionUpdate(BaseModel):
    cf: Optional[float] = None
    user_id: Optional[int] = None
    disease_id: Optional[int] = None
    deer_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)