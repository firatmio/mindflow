import asyncio
from datetime import date
from fastapi import APIRouter
from services.gemini_service import generate_affirmation
from services.zenquotes_services import get_random_quote

router = APIRouter()

# { (labels_key, date) -> response_dict }
_cache: dict = {}


@router.get("/api/affirmation/today")
async def today_affirmation(recent_labels: str = ""):
    labels = [l.strip() for l in recent_labels.split(",") if l.strip()]
    cache_key = (tuple(sorted(labels)), date.today())

    if cache_key in _cache:
        return _cache[cache_key]

    # ZenQuotes (fetch + çeviri) ve Gemini (olumla üretimi) paralel çalışır
    quote, result = await asyncio.gather(
        get_random_quote(),
        asyncio.to_thread(generate_affirmation, labels),
    )

    response = {
        "affirmation": result["affirmation"],
        "suggestions": result["suggestions"],
        "quote": {
            "original": quote["quote"],
            "translated": quote["translated"],
            "author": quote["author"],
        },
    }
    _cache[cache_key] = response
    return response
