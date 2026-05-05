import time
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from routes.emotion import router as chat_router
from routes.journal import router as journal_router

app = FastAPI(title="MindFlow API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(journal_router)


@app.middleware("http")
async def add_response_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Response-Time"] = f"{(time.time() - start) * 1000:.0f}ms"
    return response


@app.get("/api/health")
def health():
    return {"message": "MindFlow API çalışıyor", "timestamp": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
