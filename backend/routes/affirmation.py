#günlük olumlamalar
from fastapi import APIRouter
from services.gemini_service import generate_affirmation
from services.zenquotes_services import get_random_quote

router = APIRouter()


@router.get("/api/affirmation/today")
async def today_affirmation(recent_labels: str = ""):
    labels = [l.strip() for l in recent_labels.split(",") if l.strip()]
    quote = await get_random_quote()
    result = generate_affirmation(labels, quote["quote"], quote["author"])
    return {
        "affirmation": result["affirmation"],
        "suggestions": result["suggestions"],
        "quote": {
            "original": quote["quote"],
            "translated": result["translated_quote"],
            "author": quote["author"],
        },
    }
