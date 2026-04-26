#fastapi uygulaması ve tüm bağlantılar burda
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI("MindFlow API", version="1.0.0")

#frontedden gelen isteklere izin vermek için  
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MindFlow API çalışıyor"}
