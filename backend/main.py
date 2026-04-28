from datetime import datetime
from pathlib import Path
import json
import re
import time
from typing import List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_DIR = BASE_DIR / "backend" / "data"
DATA_FILE = DATA_DIR / "mindflow_mock.json"


class JournalEntry(BaseModel):
    text: str = Field(..., min_length=1)
    label: str | None = None
    score: float | None = None
    energy: int | None = None
    stress: int | None = None


# --- Kişi 2 (Alara) değişiklikleri ---
# 1. FastAPI başlatma düzeltildi: "MindFlow API" → title="MindFlow API"
# 2. Duygu analizi ve olumlamalar routes/ altına taşındı, buradan import edildi
# 3. Static mount'lar kapatıldı (frontend/css, js, assets klasörleri yok — Vite kullanılıyor)
# 4. /api/emotion/analyze → routes/emotion.py (Gemini AI ile)
# 5. /api/affirmation/today → routes/affirmation.py (Gemini + ZenQuotes ile)
# ------------------------------------
from routes.emotion import router as emotion_router
from routes.affirmation import router as affirmation_router

app = FastAPI(title="MindFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
# app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
# app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

app.include_router(emotion_router)
app.include_router(affirmation_router)

@app.middleware("http")
async def add_response_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Response-Time"] = f"{(time.time() - start) * 1000:.0f}ms"
    return response


def load_store() -> dict:
    if not DATA_FILE.exists():
        return {"journal": []}
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


def save_store(store: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")


def analyze_text(text: str) -> dict:
    normalized = text.lower()
    keyword_sets = {
        "stressed": ["stres", "kayg", "endiş", "bunald", "panik", "yorgun", "gergin"],
        "sad": ["üzgün", "kırgın", "yalnız", "mutsuz", "yıprand", "ağlad", "umutsuz"],
        "calm": ["rahat", "sakin", "huzur", "dingin", "nefes", "iyi hiss", "toparland"],
        "happy": ["mutlu", "heyecan", "güzel", "harika", "iyi", "sevin", "başard"],
    }
    scores = {label: 0 for label in keyword_sets}
    for label, keywords in keyword_sets.items():
        for keyword in keywords:
            scores[label] += normalized.count(keyword)

    if not any(scores.values()):
        if len(normalized) < 40:
            scores["calm"] = 1
        else:
            scores["stressed"] = 1 if "!" in text else 0
            scores["calm"] = 1 if "." in text else 0

    label = max(scores, key=scores.get)
    if label == "happy":
        result = "mutlu"
        insight = "Metin olumlu ve enerjik bir tona sahip."
        suggestions = ["Bu enerjiyi sürdürmek için kısa bir yürüyüş yap.", "Bugün seni iyi hissettiren 3 şeyi not et."]
        energy = 82
        stress = 18
    elif label == "sad":
        result = "üzgün"
        insight = "Metin duygusal olarak zorlayıcı ve hassas bir dönem gösteriyor."
        suggestions = ["Biraz su iç ve 4-6 nefes döngüsü yap.", "Seni yoran şeyi tek cümleyle yazıp dışarı bırak."]
        energy = 34
        stress = 71
    elif label == "stressed":
        result = "stresli"
        insight = "Metinde baskı, gerginlik veya kaygı sinyalleri öne çıkıyor."
        suggestions = ["3 dakika boyunca nefese odaklan.", "Bugünün en küçük önceliğini seç ve sadece onu bitir."]
        energy = 41
        stress = 86
    else:
        result = "dengeli"
        insight = "Metin dengeli, sakin ve toparlayıcı bir ruh hali gösteriyor."
        suggestions = ["Bu sakinliği korumak için kısa bir mola ver.", "Günün sonuna doğru minnettarlık notu ekle."]
        energy = 67
        stress = 28

    return {
        "label": result,
        "score": round(max(scores.values()) / max(1, len(text.split())), 2),
        "insight": insight,
        "suggestions": suggestions,
        "energy": energy,
        "stress": stress,
        "breakdown": {
            "mutlu": scores["happy"],
            "üzgün": scores["sad"],
            "stresli": scores["stressed"],
            "sakin": scores["calm"],
        },
    }


def build_affirmation(entries: List[dict]) -> str:
    if not entries:
        return "Bugün zihnini yumuşakça dinle. Küçük ilerlemeler bile değerlidir."

    labels = [entry.get("label", "") for entry in entries[-7:]]
    stressed_count = labels.count("stresli")
    sad_count = labels.count("üzgün")
    happy_count = labels.count("mutlu")
    if stressed_count >= 3:
        return "Bugün yükün biraz ağır olabilir, ama tek bir adım bile ilerlemedir. Nefes al ve yavaşla."
    if sad_count >= 2:
        return "Zorlanman değerini azaltmaz. Şefkatle yaklaş, ihtiyaçlarını nazikçe duy."
    if happy_count >= 3:
        return "İyi hissettiğin anları fark et. Bu enerji senin için güvenli bir dayanak oluyor."
    return "Dengeyi arıyorsun ve bu gayet doğal. Bugün kendine karşı nazik kal."


@app.get("/", include_in_schema=False)
def landing_page():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/app", include_in_schema=False)
@app.get("/dashboard", include_in_schema=False)
def dashboard_page():
    return FileResponse(FRONTEND_DIR / "dashboard.html")


@app.get("/zen", include_in_schema=False)
def zen_page():
    return FileResponse(FRONTEND_DIR / "zen.html")


@app.get("/api/health")
def health():
    return {"message": "MindFlow API çalışıyor", "timestamp": datetime.utcnow().isoformat()}


# @app.post("/api/emotion/analyze") — routes/emotion.py'a taşındı


@app.post("/api/journal")
def create_journal_entry(payload: JournalEntry):
    entry = {
        "id": f"entry-{int(datetime.utcnow().timestamp() * 1000)}",
        "text": payload.text,
        "label": payload.label or analyze_text(payload.text)["label"],
        "score": payload.score or analyze_text(payload.text)["score"],
        "energy": payload.energy or analyze_text(payload.text)["energy"],
        "stress": payload.stress or analyze_text(payload.text)["stress"],
        "created_at": datetime.utcnow().isoformat(),
    }
    store = load_store()
    store.setdefault("journal", []).insert(0, entry)
    save_store(store)
    return entry


@app.get("/api/journal")
def list_journal_entries():
    store = load_store()
    return {"items": store.get("journal", [])[:100]}


# @app.get("/api/affirmation/today") — routes/affirmation.py'a taşındı
