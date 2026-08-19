from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Enum, String
import enum
from .database import Base
from typing import List

class UserRole(enum.Enum):
    ADMIN = "admin"
    GUEST = "guest"


class User(Base):
    __tablename__="users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name : Mapped[str] = mapped_column(String(255),nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255),nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255),nullable=False)
    role: Mapped[UserRole] = mapped_column(nullable=False)
    predictions : Mapped[List["Prediction"]] = relationship(back_populates="user")
    

class Deer(Base):
    __tablename__="deers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255),nullable=False, unique=True)

    predictions : Mapped[List["Prediction"]] = relationship(back_populates="deer")

class Disease(Base):
    __tablename__ = "diseases"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name : Mapped[str] = mapped_column(String(255),nullable=False, unique=True)
    handling: Mapped[str] = mapped_column(String(255),nullable=False)

    predictions : Mapped[List["Prediction"]] = relationship(back_populates="disease")
    expert_symptoms : Mapped[List["ExpertSymptom"]] = relationship(back_populates="disease")

class Symptom(Base):
    __tablename__ = "symptoms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name : Mapped[str] = mapped_column(String(255),nullable=False, unique=True)

    expert_symptoms : Mapped[List["ExpertSymptom"]] = relationship(back_populates="symptom")
    user_symptoms : Mapped[List["UserSymptom"]] = relationship(back_populates="symptom")

class ExpertSymptom(Base):
    __tablename__ = "expert_symptoms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    mb : Mapped[float] = mapped_column(nullable=False)
    md : Mapped[float] = mapped_column(nullable=False)

    symptom_id : Mapped[int] = mapped_column(ForeignKey("symptoms.id"), nullable=False)
    disease_id : Mapped[int] = mapped_column(ForeignKey("diseases.id"), nullable=False)

    symptom: Mapped["Symptom"] = relationship(back_populates="expert_symptoms")
    disease : Mapped["Disease"] = relationship(back_populates="expert_symptoms")

class UserSymptom(Base):
    __tablename__ = "user_symptoms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cf: Mapped[float] = mapped_column(nullable=False)

    symptom_id: Mapped[int] = mapped_column(ForeignKey("symptoms.id"), nullable=False)
    prediction_id: Mapped[int] = mapped_column(ForeignKey("predictions.id"), nullable=False)


    symptom: Mapped["Symptom"] = relationship(back_populates="user_symptoms")
    prediction: Mapped["Prediction"] = relationship(back_populates="user_symptoms")

class Prediction(Base):
    __tablename__ = "predictions" 

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cf: Mapped[float | None] = mapped_column(nullable=True)

    user_id : Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    disease_id: Mapped[int|None] = mapped_column(ForeignKey("diseases.id"), nullable=True)
    deer_id : Mapped[int] = mapped_column(ForeignKey("deers.id"), nullable=False)

    user : Mapped["User"] = relationship(back_populates="predictions")
    disease : Mapped["Disease"] = relationship(back_populates="predictions")
    deer : Mapped["Deer"] = relationship(back_populates="predictions")

    user_symptoms : Mapped[List["UserSymptom"]] = relationship(back_populates="prediction")
    

