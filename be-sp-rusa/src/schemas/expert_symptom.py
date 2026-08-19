from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# Skema minimal untuk digunakan sebagai nested relasi
class SymptomNested(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class DiseaseNested(BaseModel):
    id: int
    name: str
    handling: str

    model_config = ConfigDict(from_attributes=True)

# Skema utama dengan data relasi
class ExpertSymptom(BaseModel):
    id: int
    mb: float
    md: float
    symptom_id: int
    disease_id: int
    symptom: Optional[SymptomNested] = None
    disease: Optional[DiseaseNested] = None

    model_config = ConfigDict(from_attributes=True)

class ExpertSymptomCreate(BaseModel):
    mb: float
    md: float
    symptom_id: int
    disease_id: int

    model_config = ConfigDict(from_attributes=True)

class ExpertSymptomUpdate(BaseModel):
    mb: float
    md: float
    symptom_id: int
    disease_id: int

    model_config = ConfigDict(from_attributes=True)