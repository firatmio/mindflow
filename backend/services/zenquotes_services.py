#zenquotes api çağrıları burda olacak
import httpx


async def get_random_quote() -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get("https://zenquotes.io/api/random")
        data = response.json()[0]
        return {"quote": data["q"], "author": data["a"]}
