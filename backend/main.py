# -------------------------------------------------------
# main.py — Kişi 1 (Backend Mimarı)
# -------------------------------------------------------
# FastAPI uygulamasının merkezi. Tüm router'lar buraya bağlanır.
#
# Endpoint özeti:
#   POST /api/emotion/analyze   → Gemini AI ile duygu analizi (Kişi 2)
#   GET  /api/affirmation/today → Gemini + ZenQuotes olumlamaları (Kişi 2)
#   POST /api/journal           → Firestore'a journal ekle (Kişi 3)
#   GET  /api/journal           → Firestore'dan journal listele (Kişi 3)
#   GET  /api/health            → API sağlık kontrolü
#
# Değişiklik geçmişi:
#   Kişi 2 (Alara): emotion ve affirmation route'ları eklendi
#   Kişi 3 (Nisa) : journal route'u Firestore'a taşındı,
#                   eski JSON tabanlı journal kodu kaldırıldı
# -------------------------------------------------------

from datetime import datetime, timezone
from pathlib import Path
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# Router'lar — her biri kendi dosyasında tanımlı
from routes.emotion import router as emotion_router          # Kişi 2 — Gemini duygu analizi
from routes.affirmation import router as affirmation_router  # Kişi 2 — Gemini + ZenQuotes olumlamalar
from routes.journal import router as journal_router          # Kişi 3 — Firestore journal


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


app = FastAPI(title="MindFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # production'da frontend URL'iyle değiştir
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tüm router'ları uygulamaya bağla
app.include_router(emotion_router)
app.include_router(affirmation_router)
app.include_router(journal_router)


@app.middleware("http")
async def add_response_time(request: Request, call_next):
    # Her yanıta X-Response-Time header'ı ekler (kaç ms sürdüğünü gösterir)
    start = time.time()
    response = await call_next(request)
    response.headers["X-Response-Time"] = f"{(time.time() - start) * 1000:.0f}ms"
    return response


@app.get("/api/health")
def health():
    # API'nin çalışıp çalışmadığını kontrol etmek için
    return {"message": "MindFlow API çalışıyor", "timestamp": datetime.now(timezone.utc).isoformat()}


# @app.get("/", include_in_schema=False)
# def landing_page():
#     return FileResponse(FRONTEND_DIR / "index.html")


# @app.get("/app", include_in_schema=False)
# @app.get("/dashboard", include_in_schema=False)
# def dashboard_page():
#     return FileResponse(FRONTEND_DIR / "dashboard.html")


# @app.get("/zen", include_in_schema=False)
# def zen_page():
#     return FileResponse(FRONTEND_DIR / "zen.html")

# yeni frontend yapısı için yukarıdaki statik dosya servis kodları kaldırıldı. Frontend ayrı bir sunucuda çalışacak.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)