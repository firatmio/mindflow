# MindFlow — Backend

FastAPI tabanlı REST API. Localde Ollama üzerinde çalışan `gemma3:4b` modelini kullanarak kullanıcı mesajlarını analiz eder ve empatik yanıtlar üretir.

---

## Klasör Yapısı

```
backend/
├── main.py                  # FastAPI uygulaması, CORS, router bağlantıları
├── config.py                # Ortam değişkenleri
├── requirements.txt         # Python bağımlılıkları
├── .env.example             # Örnek ortam değişkenleri
├── routes/
│   ├── emotion.py           # POST /api/chat — AI sohbet endpoint'i
│   └── journal.py           # Firestore journal endpoint'leri
└── services/
    ├── ollama_service.py    # Local Ollama API entegrasyonu
    └── firebase_service.py  # Firestore CRUD işlemleri
```

---

## API Endpoint'leri

### `POST /api/chat`

Kullanıcı mesajını Ollama modeline gönderir, duygu analizi ve empatik yanıt döner.

**İstek:**
```json
{
  "text": "Bugün çok yoruldum, hiçbir şey yapmak istemiyorum."
}
```

**Yanıt:**
```json
{
  "reply": "Seni duyuyorum, bazen bedenimiz ve zihnimiz mola isteyebilir...",
  "label": "üzgün",
  "energy": 28,
  "stress": 65,
  "isCritical": false
}
```

| Alan | Tip | Açıklama |
|---|---|---|
| `reply` | string | AI'ın empatik yanıtı |
| `label` | string | `mutlu / üzgün / stresli / dengeli` |
| `energy` | int | 0–100 arası enerji tahmini |
| `stress` | int | 0–100 arası stres tahmini |
| `isCritical` | bool | Kriz durumu tespiti (zen modu tetikler) |

### `GET /api/health`

API'nin çalışıp çalışmadığını kontrol eder.

---

## Ortam Değişkenleri

`.env` dosyası oluşturup şu değerleri girin:

```env
FIREBASE_CREDENTIALS_PATH=./firebase_key.json
```

> `firebase_key.json` dosyasını Firebase Console → Proje Ayarları → Hizmet Hesapları bölümünden indirin.

---

## Ollama Prompt Tasarımı

Model her yanıtını **zorunlu olarak JSON formatında** üretir:

```
isCritical = true yalnızca şu durumlarda:
  - İntihar düşüncesi
  - Kendine zarar verme
  - Ciddi psikolojik kriz
```

`format: "json"` parametresiyle Ollama'nın JSON dışı çıktı üretmesi engellenir.

---

## Bağımlılıklar

```
fastapi       — Web framework
uvicorn       — ASGI sunucusu
python-dotenv — .env dosyası okuma
firebase-admin — Firestore erişimi
httpx         — Ollama HTTP istekleri
```