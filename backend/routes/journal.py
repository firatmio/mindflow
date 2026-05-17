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

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field
from services.firebase_service import (
    add_journal_entry,
    get_journal_entries,
    verify_token,
)

router = APIRouter()


class JournalEntry(BaseModel):
    text: str = Field(..., min_length=1)
    label: str | None = None
    score: float | None = None
    energy: int | None = None
    stress: int | None = None
    breakdown: dict | None = None


def get_current_user(authorization: str) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token eksik veya hatalı format")
    token = authorization.split("Bearer ")[1]
    try:
        return verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")


@router.post("/api/journal")
def create_journal_entry(payload: JournalEntry, authorization: str = Header(None)):
    user = get_current_user(authorization)

    entry = {
        "user_id": user["uid"],
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
def list_journal_entries(authorization: str = Header(None)):
    user = get_current_user(authorization)
    entries = get_journal_entries(user_id=user["uid"])
    return {"items": entries}
