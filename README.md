<div align="center">

<img src="./frontend/public/favicon.svg" alt="MindFlow Logo" width="80" />

# MindFlow

**Yapay zeka destekli duygu analizi ve farkındalık portalı**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Ollama](https://img.shields.io/badge/Ollama-gemma3:4b-black?style=flat-square)](https://ollama.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## Proje Hakkında

MindFlow, kullanıcıların duygusal durumlarını yapay zeka ile analiz edebileceği, geçmiş sohbetlerini takip edebileceği ve stres/kriz anlarında nefes egzersizleriyle rahatlayabileceği bir mental sağlık destek uygulamasıdır.

> Bu proje bir okul ödevi kapsamında geliştirilmiştir.

---

## Özellikler

| Özellik | Açıklama |
|---|---|
| **AI Sohbet** | Ollama `gemma3:4b` modeli ile empatik Türkçe yanıtlar |
| **Duygu Analizi** | Her mesaj için enerji, stres ve duygu durumu tespiti |
| **Duygu Paneli** | Mesaj bazlı kayarak açılan duygu raporu |
| **Zen Modu** | Kritik durum tespitinde otomatik açılan nefes egzersizi |
| **Lofi Müzik** | Zen modunda YouTube'dan lofi müzik |
| **Sohbet Geçmişi** | Firebase Firestore'da kullanıcı bazlı chat arşivi |
| **PDF Rapor** | Tüm sohbetlerden otomatik oluşturulan duygu raporu |
| **Google Auth** | Firebase Authentication ile Google girişi |

---

## Ekran Görüntüleri

<div style="display: flex; flex-direction: column; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="./assets/1.png" alt="Ekran Görüntüsü 1" />
    <img src="./assets/2.png" alt="Ekran Görüntüsü 2" />
    <img src="./assets/3.png" alt="Ekran Görüntüsü 3" />
    <img src="./assets/4.png" alt="Ekran Görüntüsü 4" />
</div>

---

## Mimari

```
mindflow/
├── backend/          # FastAPI + Ollama
│   ├── routes/       # API endpoint'leri
│   └── services/     # Ollama ve Firebase servisleri
└── frontend/         # React + TypeScript
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── services/
    │   └── types/
    └── public/
```

---

## Kurulum

### Gereksinimler

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) kurulu ve çalışır durumda
- Firebase projesi (Auth + Firestore)

### 1. Ollama Modeli

```bash
ollama pull gemma3:4b
ollama serve
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # .env dosyasını doldurun
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Firebase bilgilerini doldurun
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

---

## Teknoloji Yığını

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · Firebase SDK

**Backend:** FastAPI · Python · Ollama (gemma3:4b) · Firebase Admin SDK

**Altyapı:** Firebase Auth · Firestore · YouTube IFrame API

---

## Ekip

| Kişi | Sorumluluk |
|---|---|
| İclal Bülbül | Backend Mimarı |
| Alara Zere | AI Servisleri |
| Nisanur Balcıoğlu | Firebase Yönetimi |
| Betül Büyükgedikli | Backend-Frontend Bağlantısı |
| Fırat Tuna Arslan | Frontend & UI |
| Arda Balcı | Test & Raporlama |

---

<div align="center">
<sub>MindFlow · 2026</sub>
</div>
