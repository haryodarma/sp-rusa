from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Tentukan variabel dan tipe datanya
    DATABASE_URL: str
    SECRET_KEY: str 
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: str | int
    REFRESH_TOKEN_EXPIRE_DAYS: str | int
    ACCESS_TOKEN_SECRET_KEY: str | int
    REFRESH_TOKEN_SECRET_KEY: str | int

    DEBUG: bool = False  


    # Konfigurasi agar membaca file .env
    model_config = SettingsConfigDict(env_file=".env")

# Buat instance tunggal untuk digunakan di seluruh aplikasi
settings = Settings()