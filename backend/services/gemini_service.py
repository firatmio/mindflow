#gemini api çağrıları — duygu analizi ve olumlamalar
import json
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_emotion(text: str) -> dict:
    prompt = f"""
Sen bir duygu analizi asistanısın. Aşağıdaki Türkçe metni analiz et ve JSON formatında yanıt ver.

Metin: "{text}"

Şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{{
  "label": "mutlu | üzgün | stresli | dengeli",
  "score": 0.0 ile 1.0 arası güven skoru,
  "insight": "metnin duygusal tonu hakkında 1-2 cümle Türkçe yorum",
  "suggestions": ["öneri 1", "öneri 2"],
  "energy": 0 ile 100 arası enerji seviyesi,
  "stress": 0 ile 100 arası stres seviyesi,
  "breakdown": {{
    "mutlu": 0 ile 100 arası,
    "üzgün": 0 ile 100 arası,
    "stresli": 0 ile 100 arası,
    "sakin": 0 ile 100 arası
  }}
}}
"""
    response = model.generate_content(prompt)
    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def generate_affirmation(recent_labels: list[str], quote: str = "", author: str = "") -> dict:
    label_summary = ", ".join(recent_labels) if recent_labels else "belirsiz"
    prompt = f"""
Sen deneyimli, empatik bir psikologsun. Kullanıcının son günlerdeki ruh hali: {label_summary}.

Aşağıdaki özlü sözü Türkçeye çevir ve bu söze dayanarak kullanıcıya özel bir rehberlik mesajı yaz.

Özlü söz: "{quote}" — {author}

Şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{{
  "translated_quote": "özlü sözün doğal Türkçe çevirisi",
  "affirmation": "kullanıcının ruh haline özel, samimi ve psikolog gibi yazılmış 2-3 cümlelik mesaj",
  "suggestions": ["somut ve uygulanabilir öneri 1", "somut ve uygulanabilir öneri 2"]
}}
"""
    response = model.generate_content(prompt)
    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
