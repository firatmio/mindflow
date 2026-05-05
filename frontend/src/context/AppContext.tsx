import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { LocalJournal } from "../types"

const JOURNAL_KEY = "mindflow_journals"
// Ücretsiz lofi müzik — site açılışında önbelleğe alınır
const LOFI_URL = "https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3"

type AppState = {
  sidebarOpen: boolean
  zenMode: boolean
  journals: LocalJournal[]
  toggleSidebar: () => void
  toggleZen: () => void
  openZen: () => void
  closeZen: () => void
  addJournal: (entry: Omit<LocalJournal, "id" | "created_at">) => void
}

const AppContext = createContext<AppState | null>(null)

function loadJournals(): LocalJournal[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [zenMode, setZenMode] = useState(false)
  const [journals, setJournals] = useState<LocalJournal[]>(loadJournals)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Müziği site yüklenince önbelleğe al
  useEffect(() => {
    const audio = new Audio(LOFI_URL)
    audio.loop = true
    audio.volume = 0.35
    audio.preload = "auto"
    audioRef.current = audio
    return () => {
      audio.pause()
    }
  }, [])

  // Zen modu açılınca çal, kapanınca durdur
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (zenMode) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [zenMode])

  // Journal değişince localStorage'a yaz
  useEffect(() => {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journals))
  }, [journals])

  function addJournal(entry: Omit<LocalJournal, "id" | "created_at">) {
    const newEntry: LocalJournal = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setJournals((prev) => [newEntry, ...prev].slice(0, 100))
  }

  function toggleSidebar() { setSidebarOpen((p) => !p) }
  function toggleZen() { setZenMode((p) => !p) }
  function openZen() { setZenMode(true) }
  function closeZen() { setZenMode(false) }

  return (
    <AppContext value={{ sidebarOpen, zenMode, journals, toggleSidebar, toggleZen, openZen, closeZen, addJournal }}>
      {children}
    </AppContext>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
