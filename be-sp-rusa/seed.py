from sqlalchemy.orm import Session
from src.db.database import SessionLocal, engine
from src.db.models import Base, User, UserRole, Deer, Disease, Symptom, ExpertSymptom, Prediction, UserSymptom
from src.utils.auth_utils import hash_password

def seed_all():
    db: Session = SessionLocal()
    try:
        print("Memulai proses seeding...")

        # Hapus data lama (opsional, dari child ke parent untuk menghindari foreign key constraint error)
        db.query(UserSymptom).delete()
        db.query(Prediction).delete()
        db.query(ExpertSymptom).delete()
        db.query(Symptom).delete()
        db.query(Disease).delete()
        db.query(Deer).delete()
        
        # Admin mungkin sudah ada, jadi kita filter berdasarkan email agar tidak konflik unique constraint
        # Tapi lebih baik kita hapus user GUEST/ADMIN buatan seeder (asumsi) 
        db.query(User).filter(User.email.in_(["admin@mail.com", "budi@mail.com", "siti@mail.com"])).delete(synchronize_session=False)
        db.commit()

        # 1. Seed Users
        users = [
            User(name="Admin Utama", email="admin@mail.com", password=hash_password("admin123"), role=UserRole.ADMIN),
            User(name="Peternak Budi", email="budi@mail.com", password=hash_password("user123"), role=UserRole.GUEST),
            User(name="Peternak Siti", email="siti@mail.com", password=hash_password("user123"), role=UserRole.GUEST),
        ]
        db.add_all(users)
        db.flush() 

        # 2. Seed Deers
        deers = [
            Deer(name="Rusa Bawean"),
            Deer(name="Rusa Timor"),
            Deer(name="Rusa Totol"),
            Deer(name="Rusa Sambar"),
        ]
        db.add_all(deers)
        db.flush()

        # 3. Seed Diseases
        diseases = [
            Disease(name="Antraks", handling="Isolasi ketat, berikan antibiotik dosis tinggi, segera hubungi dinas terkait."),
            Disease(name="Scabies", handling="Pemberian salep ivermectin, pisahkan dari kawanan, dan bersihkan kandang."),
            Disease(name="Brucellosis", handling="Pemisahan individu terinfeksi, sanitasi kandang yang baik, vaksinasi jika perlu."),
            Disease(name="Pneumonia", handling="Berikan antibiotik pernapasan, pastikan kandang hangat dan sirkulasi udara baik."),
            Disease(name="Helminthiasis (Cacingan)", handling="Pemberian obat cacing secara berkala dan perhatikan kebersihan pakan."),
        ]
        db.add_all(diseases)
        db.flush()

        # 4. Seed Symptoms
        symptoms = [
            Symptom(name="Demam Tinggi Mendadak"),          # 0
            Symptom(name="Keluar Darah Hitam dari Lubang"), # 1
            Symptom(name="Gatal-gatal pada Kulit"),         # 2
            Symptom(name="Bulu Rontok"),                    # 3
            Symptom(name="Keguguran pada Induk"),           # 4
            Symptom(name="Nafsu Makan Berkurang"),          # 5
            Symptom(name="Batuk dan Sesak Nafas"),          # 6
            Symptom(name="Tubuh Kurus dan Lesu"),           # 7
            Symptom(name="Pucat pada Selaput Lendir"),      # 8
            Symptom(name="Diare Terus Menerus"),            # 9
        ]
        db.add_all(symptoms)
        db.flush()

        # 5. Seed ExpertSymptoms
        expert_symptoms = [
            ExpertSymptom(mb=0.8, md=0.1, symptom_id=symptoms[0].id, disease_id=diseases[0].id),
            ExpertSymptom(mb=1.0, md=0.0, symptom_id=symptoms[1].id, disease_id=diseases[0].id),
            ExpertSymptom(mb=0.4, md=0.2, symptom_id=symptoms[5].id, disease_id=diseases[0].id),
            
            ExpertSymptom(mb=0.9, md=0.1, symptom_id=symptoms[2].id, disease_id=diseases[1].id),
            ExpertSymptom(mb=0.8, md=0.2, symptom_id=symptoms[3].id, disease_id=diseases[1].id),
            
            ExpertSymptom(mb=0.9, md=0.2, symptom_id=symptoms[4].id, disease_id=diseases[2].id),
            ExpertSymptom(mb=0.5, md=0.3, symptom_id=symptoms[5].id, disease_id=diseases[2].id),
            
            ExpertSymptom(mb=0.9, md=0.1, symptom_id=symptoms[6].id, disease_id=diseases[3].id),
            ExpertSymptom(mb=0.7, md=0.2, symptom_id=symptoms[0].id, disease_id=diseases[3].id),
            
            ExpertSymptom(mb=0.8, md=0.1, symptom_id=symptoms[7].id, disease_id=diseases[4].id),
            ExpertSymptom(mb=0.7, md=0.2, symptom_id=symptoms[8].id, disease_id=diseases[4].id),
            ExpertSymptom(mb=0.8, md=0.2, symptom_id=symptoms[9].id, disease_id=diseases[4].id),
        ]
        db.add_all(expert_symptoms)
        db.flush()

        # 6. Seed Predictions
        predictions = [
            Prediction(cf=0.95, user_id=users[1].id, disease_id=diseases[1].id, deer_id=deers[0].id),
            Prediction(cf=0.88, user_id=users[2].id, disease_id=diseases[4].id, deer_id=deers[2].id), 
        ]
        db.add_all(predictions)
        db.flush()

        # 7. Seed UserSymptoms
        user_symptoms = [
            UserSymptom(cf=1.0, symptom_id=symptoms[2].id, prediction_id=predictions[0].id),
            UserSymptom(cf=1.0, symptom_id=symptoms[3].id, prediction_id=predictions[0].id),
            UserSymptom(cf=1.0, symptom_id=symptoms[7].id, prediction_id=predictions[1].id),
            UserSymptom(cf=1.0, symptom_id=symptoms[9].id, prediction_id=predictions[1].id),
        ]
        db.add_all(user_symptoms)

        db.commit()
        print("Seeding berhasil! Data master dan data dummy telah ditambahkan.")

    except Exception as e:
        print(f"Error saat seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()