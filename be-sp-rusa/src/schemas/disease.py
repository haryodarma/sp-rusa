from pydantic import BaseModel, ConfigDict

class Disease(BaseModel):
    id: int
    name: str
    handling: str

    model_config = ConfigDict(from_attributes=True)

class DiseaseCreate(BaseModel):
    name: str
    handling: str

    model_config = ConfigDict(from_attributes=True)

class DiseaseUpdate(BaseModel):
    name: str
    handling: str

    model_config = ConfigDict(from_attributes=True)