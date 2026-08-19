from pydantic import BaseModel, ConfigDict

class Deer(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class DeerCreate(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)

class DeerUpdate(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)