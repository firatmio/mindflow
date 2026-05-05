import json

import httpx

OLLAMA_URL = "http://localhost:11434"
MODEL = "gemma3:4b"

SYSTEM_PROMPT = """Sen MindFlow adlı empatik bir mental sağlık destek chatbotusun.
Kullanıcı sana Türkçe olarak duygularını ve yaşadıklarını anlatacak.
Şu kurallara uy:
- Her zaman Türkçe yanıt ver
- Samimi, sıcak ve anlayışlı ol
- Yargılama, dinle ve destekle
- Yanıtını SADECE JSON formatında ver, başka hiçbir şey yazma

JSON formatı:
{
  "reply": "kullanıcıya verilecek empatik ve destekleyici yanıt (2-4 cümle)",
  "label": "mutlu veya üzgün veya stresli veya dengeli",
  "energy": 0-100 arası enerji tahmini (sayı),
  "stress": 0-100 arası stres tahmini (sayı),
  "isCritical": false
}

isCritical'ı sadece intihar düşüncesi, kendine zarar verme veya ciddi kriz durumunda true yap."""


def chat(user_message: str) -> dict:
    response = httpx.post(
        f"{OLLAMA_URL}/api/chat",
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "stream": False,
            "format": "json",
        },
        timeout=90.0,
    )
    response.raise_for_status()
    content = response.json()["message"]["content"]
    result = json.loads(content)
    return {
        "reply": str(result.get("reply", "Seni duyuyorum, devam et lütfen.")),
        "label": str(result.get("label", "dengeli")),
        "energy": int(result.get("energy", 50)),
        "stress": int(result.get("stress", 50)),
        "isCritical": bool(result.get("isCritical", False)),
    }
