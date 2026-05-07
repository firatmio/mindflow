# MindFlow — Frontend

React 19 + TypeScript + Vite ile geliştirilmiş kullanıcı arayüzü.
Firebase Authentication (Google) ve Firestore ile entegredir.

---

## Klasör Yapısı

```
frontend/src/
├── api/
│   └── index.ts               # Backend API istemcisi
├── components/
│   ├── auth/
│   │   └── LoginScreen.tsx    # Google ile giriş ekranı
│   ├── chat/
│   │   ├── ChatContainer.tsx  # Mesaj listesi + scroll
│   │   ├── ChatBubble.tsx     # Tek mesaj balonu (hover → üç nokta)
│   │   ├── ChatInput.tsx      # Metin girişi
│   │   ├── EmotionPanel.tsx   # Sağdan kayan duygu raporu paneli
│   │   └── TypingIndicator.tsx
│   ├── layout/
│   │   ├── Header.tsx         # Üst bar (sidebar toggle, zen butonu)
│   │   └── Sidebar.tsx        # Chat listesi + Raporu Görüntüle
│   └── zen/
│       ├── ZenOverlay.tsx     # Tam ekran zen modu
│       └── BreathingCircle.tsx # 4-7-8 nefes animasyonu
├── config/
│   └── firebase.ts            # Firebase başlatma (Auth + Firestore)
├── context/
│   ├── AuthContext.tsx        # Kullanıcı oturumu
│   ├── AppContext.tsx         # Chat listesi, zen modu, YT müzik
│   └── ChatContext.tsx        # Mesajlar, duygu paneli, Firebase kayıt
├── services/
│   ├── firestore.ts           # Firestore CRUD (chat session'ları)
│   └── reportGenerator.ts     # PDF rapor HTML üretici
└── types/
    └── index.ts               # TypeScript tip tanımları
```

---

## Veri Akışı

```
Kullanıcı mesaj yazar
  → ChatContext.sendMessage()
  → Backend POST /api/chat
  → Ollama gemma3:4b yanıt üretir
  → { reply, label, energy, stress, isCritical }
  → Mesaj ekrana yansır
  → isCritical = true → Zen modu açılır
  → Firestore'a kaydedilir (users/{uid}/chats/{chatId})
  → Sidebar güncellenir
```

---

## Temel Bileşenler

### `EmotionPanel`
Bot mesajına hover → `···` butonu → tıkla → sağdan panel kayar.
Chat alanı flex layout sayesinde panelle çakışmadan daralır.
İçerik: analiz edilen metin, duygu etiketi, enerji/stres barları.

### `ZenOverlay`
`isCritical: true` geldiğinde otomatik açılır ya da header'daki 🌸 butonuyla manuel açılır.
Açılışta YouTube IFrame API üzerinden lofi müzik çalar, kapanınca durur.
`Hazır ol → Nefes al → Tut → Nefes ver` döngüsü.

### `Sidebar`
- Üst: **Yeni Sohbet** butonu
- Orta: Firebase'den çekilen chat listesi (başlık + zaman damgası)
- Alt: **Raporu Görüntüle** → `reportGenerator` ile HTML oluşturulur → yeni sekmede açılır → `Ctrl+P` ile PDF

---

## Ortam Değişkenleri

`.env` dosyası oluşturup şu değerleri girin:

```env
VITE_API_BASE_URL=http://localhost:8000

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Firebase değerlerini Console → Proje Ayarları → Genel → SDK yapılandırması bölümünden alabilirsiniz.

---

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Üretim build'i
```

---

## Başlıca Bağımlılıklar

| Paket | Amaç |
|---|---|
| `react` 19 | UI framework |
| `typescript` | Tip güvenliği |
| `vite` | Build aracı |
| `tailwindcss` | Stil |
| `framer-motion` | Animasyonlar |
| `firebase` | Auth + Firestore |
| `lucide-react` | İkon seti |
| `recharts` | Grafik (opsiyonel) |