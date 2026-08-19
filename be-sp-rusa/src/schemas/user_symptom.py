from pydantic import BaseModel, ConfigDict
from typing import Optional

# Skema minimal untuk digunakan sebagai nested relasi


class SymptomNested(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

# Skema utama dengan data relasi
class UserSymptom(BaseModel):
    id: int
    cf: float
   
    symptom_id: int
    prediction_id: int
    symptom: Optional[SymptomNested] = None

    model_config = ConfigDict(from_attributes=True)

class UserSymptomCreate(BaseModel):
    cf: float
  
    symptom_id: int
    prediction_id: int

    model_config = ConfigDict(from_attributes=True)

class UserSymptomUpdate(BaseModel):
    cf: float
   
    symptom_id: int
    prediction_id: int

    model_config = ConfigDict(from_attributes=True)