import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { LocalJournal } from "../types"

const JOURNAL_KEY = "mindflow_journals"
const YT_VIDEO_ID = "zPyg4N7bcHM"

// YouTube IFrame Player minimal tip tanımı
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, unknown>
          events?: { onReady?: () => void }
        },
      ) => YTPlayerInstance
    }
    onYouTubeIframeAPIReady: () => void
  }
}

type YTPlayerInstance = {
  playVideo(): void
  pauseVideo(): void
  destroy(): void
}

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
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const playerReadyRef = useRef(false)
  // zen modu player hazır olmadan açıldıysa bekletmek için
  const pendingPlayRef = useRef(false)

  useEffect(() => {
    function initPlayer() {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          mute: 0,
          loop: 1,
          playlist: YT_VIDEO_ID,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true
            // Player hazır olduğunda zen açıksa hemen çal
            if (pendingPlayRef.current) {
              playerRef.current?.playVideo()
              pendingPlayRef.current = false
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement("script")
        script.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(script)
      }
    }

    return () => {
      playerRef.current?.destroy()
    }
  }, [])

  // Zen açılınca çal, kapanınca durdur
  useEffect(() => {
    if (zenMode) {
      if (playerReadyRef.current) {
        playerRef.current?.playVideo()
      } else {
        pendingPlayRef.current = true
      }
    } else {
      pendingPlayRef.current = false
      playerRef.current?.pauseVideo()
    }
  }, [zenMode])

  // Journal değişince localStorage'a kaydet
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
