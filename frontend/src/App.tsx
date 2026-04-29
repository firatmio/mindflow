import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { analyzeEmotion, createJournal, getAffirmation, health, listJournals } from './api'

type EmotionState = {
  text: string
  label?: string
  score?: number
  energy?: number
  stress?: number
  breakdown?: Record<string, number>
}

type AffirmationState = {
  affirmation: string
  suggestions: string[]
  quote: { original: string; translated?: string; author?: string }
}

type JournalItem = {
  id?: string
  text: string
  label?: string
  score?: number
  energy?: number
  stress?: number
  created_at?: string
}

function App() {
  const [journalText, setJournalText] = useState('')
  const [apiMessage, setApiMessage] = useState('Bağlantı bekleniyor...')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('firebaseToken') ?? '')
  const [emotion, setEmotion] = useState<EmotionState | null>(null)
  const [affirmation, setAffirmation] = useState<AffirmationState | null>(null)
  const [journalItems, setJournalItems] = useState<JournalItem[]>([])

  const recentLabels = useMemo(() => (emotion?.label ? [emotion.label] : []), [emotion])

  useEffect(() => {
    void loadHealth()
    void loadAffirmation([])
    if (token) {
      void loadJournals(token)
    }
  }, [])

  async function loadHealth() {
    try {
      const data = await health()
      setApiMessage(data.message ?? 'API çalışıyor')
    } catch (error) {
      setApiMessage('Backend erişilemiyor. URL ve portu kontrol et.')
    }
  }

  async function loadAffirmation(labels: string[]) {
    try {
      const data = await getAffirmation(labels)
      setAffirmation(data)
    } catch {
      setAffirmation(null)
    }
  }

  async function loadJournals(currentToken: string) {
    try {
      const data = await listJournals(currentToken)
      const items = Array.isArray(data.items) ? data.items : []
      setJournalItems(items)
    } catch {
      setJournalItems([])
    }
  }

  async function handleAnalyze() {
    if (!journalText.trim()) return
    setLoading(true)
    try {
      const data = await analyzeEmotion(journalText)
      setEmotion(data)
      await loadAffirmation(data.label ? [data.label] : [])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveJournal() {
    if (!journalText.trim()) return
    setLoading(true)
    try {
      const payload = {
        text: journalText,
        label: emotion?.label ?? null,
        score: emotion?.score ?? null,
        energy: emotion?.energy ?? null,
        stress: emotion?.stress ?? null,
        breakdown: emotion?.breakdown ?? null,
      }
      await createJournal(payload, token || undefined)
      if (token) {
        await loadJournals(token)
      }
      setJournalText('')
    } finally {
      setLoading(false)
    }
  }

  function handleTokenSave() {
    localStorage.setItem('firebaseToken', token)
    if (token) {
      void loadJournals(token)
    }
  }

  return (
    <div className="mindflow-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">MindFlow</span>
          <h1>Duygu analizi, olumlama ve günlük takibi</h1>
          <p>
            Gününü yaz, duygu analizini backend&apos;den al, ardından günün olumlamasını ve kayıtlarını takip et.
          </p>
        </div>
        <div className="status-pill">{apiMessage}</div>
      </section>

      <section className="grid-layout">
        <article className="panel panel-editor">
          <div className="panel-header">
            <div>
              <h2>Günlük Alanı</h2>
              <p>Metni yaz ve backend duygu analizini çalıştır.</p>
            </div>
            <button className="ghost-btn" type="button" onClick={() => setJournalText('')}>
              Temizle
            </button>
          </div>

          <textarea
            className="journal-input"
            value={journalText}
            onChange={(event) => setJournalText(event.target.value)}
            placeholder="Bugün neler hissettin?"
            rows={10}
          />

          <div className="button-row">
            <button type="button" className="primary-btn" onClick={handleAnalyze} disabled={loading}>
              Duygu Analiz Et
            </button>
            <button type="button" className="secondary-btn" onClick={handleSaveJournal} disabled={loading}>
              Günlüğü Kaydet
            </button>
            <button type="button" className="secondary-btn" onClick={() => void loadAffirmation(recentLabels)} disabled={loading}>
              Olumlamayı Yenile
            </button>
          </div>
        </article>

        <aside className="panel panel-side">
          <div className="panel-header">
            <div>
              <h2>Bağlantı</h2>
              <p>Firebase token varsa günlükleri çekebilirsin.</p>
            </div>
          </div>

          <label className="field-label" htmlFor="firebaseToken">
            Firebase Token
          </label>
          <div className="token-row">
            <input
              id="firebaseToken"
              className="token-input"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Bearer token buraya"
            />
            <button type="button" className="ghost-btn" onClick={handleTokenSave}>
              Kaydet
            </button>
          </div>

          <div className="mini-card">
            <span>Duygu</span>
            <strong>{emotion?.label ?? 'Henüz analiz yok'}</strong>
          </div>
          <div className="mini-card">
            <span>Skor</span>
            <strong>{emotion?.score?.toFixed(2) ?? '—'}</strong>
          </div>
          <div className="mini-card">
            <span>Enerji / Stres</span>
            <strong>{emotion ? `${emotion.energy ?? '—'} / ${emotion.stress ?? '—'}` : '—'}</strong>
          </div>
        </aside>
      </section>

      <section className="grid-layout lower-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Günün Olumlaması</h2>
              <p>Backend cevap verirse AI destekli olumlama gösterilir.</p>
            </div>
          </div>

          {affirmation ? (
            <div className="affirmation-box">
              <p className="affirmation-text">{affirmation.affirmation}</p>
              <p className="quote-text">“{affirmation.quote.original}”</p>
              <p className="quote-author">{affirmation.quote.author}</p>
              <ul className="suggestion-list">
                {affirmation.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="empty-state">Olumlama henüz yüklenmedi.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Son Günlükler</h2>
              <p>Token varsa backend&apos;den gelen kayıtları listeler.</p>
            </div>
          </div>

          {journalItems.length ? (
            <div className="journal-list">
              {journalItems.map((item, index) => (
                <div className="journal-item" key={`${item.created_at ?? 'entry'}-${index}`}>
                  <strong>{item.label ?? 'dengeli'}</strong>
                  <p>{item.text}</p>
                  <small>
                    Skor: {item.score ?? '—'} | Enerji: {item.energy ?? '—'} | Stres: {item.stress ?? '—'}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Henüz kayıt yok veya token girilmedi.</p>
          )}
        </article>
      </section>

      <section className="panel chart-panel">
        <div className="panel-header">
          <div>
            <h2>Hızlı Mood Özeti</h2>
            <p>Duygu etiketi varsa basit bar grafiği gösterilir.</p>
          </div>
        </div>

        <div className="chart-bars">
          {emotion?.breakdown
            ? Object.entries(emotion.breakdown).map(([label, value]) => (
                <div className="bar-row" key={label}>
                  <span>{label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.min(value, 100)}%` }} />
                  </div>
                  <strong>{value}</strong>
                </div>
              ))
            : <p className="empty-state">Grafik için duygu analizi yap.</p>}
        </div>
      </section>
    </div>
  )
}

export default App
