"""
response_helper_simple.py
Lengkap per status code, tanpa perlu install package tambahan (hanya pakai FastAPI bawaan).
Tinggal panggil function-nya dan isi data/message sesuai kebutuhan.
"""

from typing import Any
from fastapi.responses import JSONResponse
from fastapi import status


def _response(status_code: int, message: str, data: Any = None, errors: Any = None):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": status_code < 400,
            "status_code": status_code,
            "message": message,
            "data": data,
            "errors": errors,
        },
    )


# ---------------- 2xx: sukses ----------------
def ok_response(data: Any = None, message: str = "Berhasil"):
    return _response(status.HTTP_200_OK, message, data=data)


def created_response(data: Any = None, message: str = "Data berhasil dibuat"):
    return _response(status.HTTP_201_CREATED, message, data=data)


def accepted_response(data: Any = None, message: str = "Permintaan diterima dan sedang diproses"):
    return _response(status.HTTP_202_ACCEPTED, message, data=data)


def no_content_response(message: str = "Tidak ada konten"):
    # 204 tidak boleh punya body sesuai spec HTTP
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)


# ---------------- 4xx: error dari sisi client ----------------
def bad_request_response(message: str = "Permintaan tidak valid", errors: Any = None):
    return _response(status.HTTP_400_BAD_REQUEST, message, errors=errors)


def unauthorized_response(message: str = "Anda belum terautentikasi"):
    return _response(status.HTTP_401_UNAUTHORIZED, message)


def forbidden_response(message: str = "Anda tidak memiliki akses"):
    return _response(status.HTTP_403_FORBIDDEN, message)


def not_found_response(message: str = "Data tidak ditemukan"):
    return _response(status.HTTP_404_NOT_FOUND, message)


def conflict_response(message: str = "Data sudah ada / terjadi konflik", errors: Any = None):
    return _response(status.HTTP_409_CONFLICT, message, errors=errors)


def unprocessable_response(message: str = "Validasi gagal", errors: Any = None):
    return _response(status.HTTP_422_UNPROCESSABLE_ENTITY, message, errors=errors)


def too_many_requests_response(message: str = "Terlalu banyak permintaan, coba lagi nanti"):
    return _response(status.HTTP_429_TOO_MANY_REQUESTS, message)


# ---------------- 5xx: error dari sisi server ----------------
def internal_error_response(message: str = "Terjadi kesalahan pada server", errors: Any = None):
    return _response(status.HTTP_500_INTERNAL_SERVER_ERROR, message, errors=errors)


def service_unavailable_response(message: str = "Layanan sedang tidak tersedia"):
    return _response(status.HTTP_503_SERVICE_UNAVAILABLE, message)


# ---------------- custom, kalau butuh status code lain ----------------
def custom_response(status_code: int, message: str, data: Any = None, errors: Any = None):
    return _response(status_code, message, data=data, errors=errors)