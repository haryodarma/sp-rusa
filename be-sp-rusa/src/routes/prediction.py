from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from ..db import models, database
from ..utils import auth_utils, http_response as res
from ..schemas.prediction import (
    Prediction as PredictionSchema,
    PredictionCreate,
    PredictionUpdate,
)

router = APIRouter(
    prefix="/predictions",
    tags=["predictions"],
    dependencies=[Depends(auth_utils.verify_token)],
)


@router.get("/")
def get_all_predictions(
    db: Session = Depends(database.get_db),
    page: int = Query(default=1, ge=1, description="Halaman ke berapa"),
    limit: int = Query(default=10, ge=1, le=100, description="Jumlah data per halaman"),
    user_id: int = Query(default=None, description="Filter berdasarkan ID User"),
):
    try:
        # 0. Buat base query
        query = db.query(models.Prediction)
        if user_id:
            query = query.filter(models.Prediction.user_id == user_id)

        # 1. Hitung total data
        total = query.count()

        # 2. Ambil data beserta semua relasi (user, disease, deer, user_symptoms)
        offset = (page - 1) * limit
        predictions = (
            query.options(
                joinedload(models.Prediction.user),
                joinedload(models.Prediction.disease),
                joinedload(models.Prediction.deer),
                joinedload(models.Prediction.user_symptoms).joinedload(models.UserSymptom.symptom),
            )
            .offset(offset)
            .limit(limit)
            .all()
        )

        # 3. Mapping data menggunakan skema Pydantic
        predictions_data = [
            PredictionSchema.model_validate(p).model_dump() for p in predictions
        ]

        # 4. Kembalikan data beserta info pagination
        return res.ok_response(
            data={
                "items": predictions_data,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": -(-total // limit),
            }
        )
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")


@router.get("/{id}")
def get_prediction(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB beserta semua relasi
        prediction = (
            db.query(models.Prediction)
            .options(
                joinedload(models.Prediction.user),
                joinedload(models.Prediction.disease),
                joinedload(models.Prediction.deer),
                joinedload(models.Prediction.user_symptoms).joinedload(models.UserSymptom.symptom),
            )
            .filter(models.Prediction.id == id)
            .first()
        )

        # 2. Validasi jika data tidak ditemukan
        if not prediction:
            return res.not_found_response("Data prediksi tidak ditemukan")

        # 3. Mapping data ke skema Pydantic
        prediction_data = PredictionSchema.model_validate(prediction).model_dump()

        # 4. Kembalikan data
        return res.ok_response(data=prediction_data)
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")


@router.post("/")
def create_prediction(
    request: PredictionCreate, db: Session = Depends(database.get_db)
):
    try:
        # Ambil data penyakit untuk referensi nama dan penanganan
        diseases = db.query(models.Disease).all()
        disease_map = {d.id: d for d in diseases}
        print(disease_map)

        # Ambil semua data relasi gejala dan penyakit dari tabel pakar
        symptom_ids = [us.symptom_id for us in request.user_symptoms]
        if not symptom_ids:
            return res.bad_request_response(message="Minimal harus memilih 1 gejala")

        expert_symptoms = (
            db.query(models.ExpertSymptom)
            .filter(models.ExpertSymptom.symptom_id.in_(symptom_ids))
            .all()
        )

        daftar_bpa = []
        for user_symptom in request.user_symptoms:
            symptom_id = user_symptom.symptom_id
            cf_user = user_symptom.cf
            
            # Filter relasi penyakit untuk gejala ini
            relasi_db = [es for es in expert_symptoms if es.symptom_id == symptom_id]
            
            if len(relasi_db) > 0:
                focal_set_list = []
                cf_akhir_list = []
                
                for relasi in relasi_db:
                    disease_id = relasi.disease_id
                    mb = relasi.mb
                    md = relasi.md
                    
                    cf_pakar = mb - md
                    cf_akhir = cf_pakar * cf_user
                    
                    focal_set_list.append(disease_id)
                    cf_akhir_list.append(cf_akhir)
                
                # Menggunakan rata-rata CF akhir sebagai nilai BPA focal set
                total_cf = 0
                for cf in cf_akhir_list:
                    total_cf += cf
                
                mass_focal = total_cf / len(cf_akhir_list)
                mass_theta = 1.0 - mass_focal
                
                focal_set = frozenset(focal_set_list)
                
                bpa = {
                    focal_set: mass_focal,
                    "theta": mass_theta
                }
                
                daftar_bpa.append(bpa)

        if len(daftar_bpa) == 0:
            return res.bad_request_response(message="Gejala yang dipilih tidak memiliki relasi penyakit")
            
        # Proses Kombinasi (Dempster-Shafer)
        bpa_gabungan = daftar_bpa[0]
        
        for i in range(1, len(daftar_bpa)):
            m1 = bpa_gabungan
            m2 = daftar_bpa[i]
            
            hasil_sementara = {}
            conflict_K = 0.0
            
            for focal1, mass1 in m1.items():
                for focal2, mass2 in m2.items():
                    perkalian = mass1 * mass2
                    
                    if focal1 == "theta" and focal2 == "theta":
                        irisan = "theta"
                    elif focal1 == "theta":
                        irisan = focal2
                    elif focal2 == "theta":
                        irisan = focal1
                    else:
                        irisan = focal1.intersection(focal2)
                        
                    if irisan != "theta" and len(irisan) == 0:
                        conflict_K += perkalian
                    else:
                        if irisan not in hasil_sementara:
                            hasil_sementara[irisan] = 0.0
                        hasil_sementara[irisan] += perkalian
                        
            pembagi = 1.0 - conflict_K
            hasil_normalisasi = {}
            
            if pembagi == 0:
                # Hindari division by zero jika conflict 100%
                hasil_normalisasi = hasil_sementara
            else:
                for irisan, mass in hasil_sementara.items():
                    hasil_normalisasi[irisan] = mass / pembagi
                    
            bpa_gabungan = hasil_normalisasi

        # Cari ranking
        ranking = []
        for focal_set, mass in bpa_gabungan.items():
            if focal_set != "theta":
                if len(focal_set) == 1: # Hanya ambil focal set tunggal (1 penyakit)
                    disease_id = list(focal_set)[0]
                    disease_info = disease_map.get(disease_id)
                    
                    if disease_info:
                        ranking.append({
                            "disease_id": disease_id,
                            "disease": disease_info.name,
                            "handling": disease_info.handling,
                            "mass": round(mass, 4),
                            "percentage": round(mass * 100, 2)
                        })
                        
        # Sort ranking berdasarkan nilai mass terbesar (tanpa lambda)
        for i in range(len(ranking)):
            for j in range(i + 1, len(ranking)):
                if ranking[j]["mass"] > ranking[i]["mass"]:
                    temp = ranking[i]
                    ranking[i] = ranking[j]
                    ranking[j] = temp
                    
        diagnosis_utama = ranking[0] if len(ranking) > 0 else None

        # --- SIMPAN KE DATABASE ---
        disease_id_prediksi = diagnosis_utama["disease_id"] if diagnosis_utama else None
        cf_prediksi = diagnosis_utama["mass"] if diagnosis_utama else None
        
        new_prediction = models.Prediction(
            user_id=request.user_id,
            deer_id=request.deer_id,
            disease_id=disease_id_prediksi,
            cf=cf_prediksi
        )
        db.add(new_prediction)
        db.flush() # Agar mendapatkan ID untuk prediction
        
        for us in request.user_symptoms:
            new_us = models.UserSymptom(
                cf=us.cf,
                symptom_id=us.symptom_id,
                prediction_id=new_prediction.id
            )
            db.add(new_us)
            
        db.commit()
        db.refresh(new_prediction)

        response_data = {
            "id": new_prediction.id,
            "diagnosis": diagnosis_utama,
            "ranking": ranking
        }

        return res.created_response(data=response_data, message="Data prediksi berhasil dibuat")

    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")


@router.put("/{id}")
def update_prediction(
    id: int, request: PredictionUpdate, db: Session = Depends(database.get_db)
):
    try:
        # 1. Cari data lama di DB
        prediction = (
            db.query(models.Prediction).filter(models.Prediction.id == id).first()
        )

        # 2. Validasi jika data tidak ditemukan
        if not prediction:
            return res.not_found_response("Data prediksi tidak ditemukan")

        # 3. Update field data
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(prediction, key, value)

        # 4. Commit perubahan
        db.commit()

        # 5. Load ulang dengan semua relasi
        prediction = (
            db.query(models.Prediction)
            .options(
                joinedload(models.Prediction.user),
                joinedload(models.Prediction.disease),
                joinedload(models.Prediction.deer),
                joinedload(models.Prediction.user_symptoms).joinedload(models.UserSymptom.symptom),
            )
            .filter(models.Prediction.id == id)
            .first()
        )

        # 6. Mapping response dengan skema Pydantic
        prediction_data = PredictionSchema.model_validate(prediction).model_dump()
        return res.ok_response(
            data=prediction_data, message="Data prediksi berhasil diubah"
        )
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")


@router.delete("/{id}")
def delete_prediction(id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Cari data di DB
        prediction = (
            db.query(models.Prediction).filter(models.Prediction.id == id).first()
        )

        # 2. Validasi jika data tidak ditemukan
        if not prediction:
            return res.not_found_response("Data prediksi tidak ditemukan")

        # 3. Hapus data dari DB
        db.delete(prediction)

        # 4. Commit perubahan
        db.commit()

        # 5. Kembalikan response sukses
        return res.ok_response(message="Data prediksi berhasil dihapus")
    except Exception as e:
        return res.internal_error_response(message=f"Terjadi kesalahan: {str(e)}")
