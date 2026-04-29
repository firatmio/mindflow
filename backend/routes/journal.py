# -------------------------------------------------------
# routes/journal.py — Kişi 3 (Firebase & Veri Yönetimi)
# -------------------------------------------------------
# Bu dosya journal (günlük) ile ilgili 2 endpoint içeriyor:
#   POST /api/journal  → yeni günlük ekle
#   GET  /api/journal  → kullanıcının tüm günlüklerini getir
#
# Her iki endpoint de Authorization header'ı bekler:
#   Authorization: Bearer <firebase_token>
# Token yoksa veya geçersizse 401 hatası döner.
#
# KİŞİ 4 DİKKAT: Her API isteğinde header'a token eklemelisin.
# Firebase'den token almak için: firebase.auth().currentUser.getIdToken()
# -------------------------------------------------------

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from services.firebase_service import add_journal_entry, get_journal_entries, verify_token

router = APIRouter()


class JournalEntry(BaseModel):
    # Frontend'den gelen journal verisinin şekli
    # Kişi 2'nin duygu analizi sonucu bu modele uygun olmalı
    text: str = Field(..., min_length=1)    # günlük metni (zorunlu)
    label: str | None = None                # duygu etiketi: mutlu | üzgün | stresli | dengeli
    score: float | None = None              # güven skoru (0.0 - 1.0)
    energy: int | None = None               # enerji seviyesi (0 - 100)
    stress: int | None = None               # stres seviyesi (0 - 100)
    breakdown: dict | None = None           # duygu dağılımı: {"mutlu": 80, "üzgün": 10, ...}


def get_current_user(authorization: str) -> dict:
    # Header'dan "Bearer <token>" formatındaki token'ı al ve Firebase ile doğrula
    # Başarılıysa {"uid": "...", "email": "..."} döner
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token eksik veya hatalı format")
    token = authorization.split("Bearer ")[1]
    try:
        return verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")


@router.post("/api/journal")
def create_journal_entry(
    payload: JournalEntry,
    authorization: str = Header(None)   # KİŞİ 4: her istekte bu header'ı gönder
):
    # Token'dan kullanıcıyı bul, Firestore'a user_id ile kaydet
    user = get_current_user(authorization)

    entry = {
        "user_id": user["uid"],                      # kimin yazdığı — başka kullanıcılar göremez
        "text": payload.text,
        "label": payload.label or "dengeli",
        "score": payload.score or 0.5,
        "energy": payload.energy or 50,
        "stress": payload.stress or 50,
        "breakdown": payload.breakdown or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return add_journal_entry(entry)


@router.get("/api/journal")
def list_journal_entries(
    authorization: str = Header(None)   # KİŞİ 4: her istekte bu header'ı gönder
):
    # Sadece giriş yapmış kullanıcının kendi günlüklerini döndür
    user = get_current_user(authorization)
    entries = get_journal_entries(user_id=user["uid"])
    return {"items": entries}
