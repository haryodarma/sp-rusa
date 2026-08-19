from pydantic import BaseModel, ConfigDict

class Symptom(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class SymptomCreate(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)

class SymptomUpdate(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)
