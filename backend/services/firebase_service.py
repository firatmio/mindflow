import firebase_admin
from firebase_admin import credentials, firestore, auth
from pathlib import Path

# firebase_key.json ile Firebase'e bağlan (uygulama zaten başlatılmışsa tekrar başlatma.)
KEY_PATH = Path(__file__).resolve().parent.parent / "firebase_key.json"

if not firebase_admin._apps:
    cred = credentials.Certificate(str(KEY_PATH))
    firebase_admin.initialize_app(cred)

db = firestore.client()


def add_journal_entry(entry: dict) -> dict:
    # Firestore'a yeni journal kaydı ekle, otomatik ID ata
    doc_ref = db.collection("journals").document()
    entry["id"] = doc_ref.id
    doc_ref.set(entry)
    return entry


def get_journal_entries(user_id: str, limit: int = 100) -> list:
    # Belirli kullanıcıya ait journal kayıtlarını tarihe göre sıralı getir
    docs = (
        db.collection("journals")
        .where("user_id", "==", user_id)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    return [doc.to_dict() for doc in docs]


def verify_token(token: str) -> dict:
    # Frontend'den gelen token'ı doğrula, kullanıcı bilgilerini döndür
    decoded = auth.verify_id_token(token)
    return {"uid": decoded["uid"], "email": decoded.get("email", "")}
