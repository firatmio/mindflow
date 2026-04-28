#duygu analizi endpointi
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.gemini_service import analyze_emotion

router = APIRouter()


class EmotionRequest(BaseModel):
    text: str = Field(..., min_length=1)


@router.post("/api/emotion/analyze")
def emotion_analyze(payload: EmotionRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Metin boş olamaz")
    result = analyze_emotion(payload.text)
    return {"text": payload.text, **result}
