from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.ollama_service import chat

router = APIRouter()


class ChatRequest(BaseModel):
    text: str = Field(..., min_length=1)


@router.post("/api/chat")
def chat_endpoint(payload: ChatRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Metin boş olamaz")
    result = chat(payload.text)
    return result
