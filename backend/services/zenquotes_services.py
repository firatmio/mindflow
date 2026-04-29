import asyncio
import httpx
from deep_translator import GoogleTranslator


def _translate_to_turkish(text: str) -> str:
    return GoogleTranslator(source="en", target="tr").translate(text)


async def get_random_quote() -> dict:
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.get("https://zenquotes.io/api/random")
        data = response.json()[0]
        original = data["q"]
        author = data["a"]
        translated = await asyncio.to_thread(_translate_to_turkish, original)
        return {"quote": original, "translated": translated, "author": author}
