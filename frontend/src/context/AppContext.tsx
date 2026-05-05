import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import { useAuth } from "./AuthContext"
import { fetchChatSessions } from "../services/firestore"
import type { ChatSession, Message } from "../types"

const YT_VIDEO_ID = "zPyg4N7bcHM"

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
  chats: ChatSession[]
  activeChatId: string | null
  chatsLoading: boolean
  toggleSidebar: () => void
  toggleZen: () => void
  openZen: () => void
  closeZen: () => void
  selectChat: (id: string) => void
  startNewChat: () => void
  setActiveChatId: (id: string | null) => void
  prependChat: (chat: ChatSession) => void
  updateChatInList: (chatId: string, messages: Message[]) => void
  refreshChats: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [zenMode, setZenMode] = useState(false)
  const [chats, setChats] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatsLoading, setChatsLoading] = useState(false)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const playerReadyRef = useRef(false)
  const pendingPlayRef = useRef(false)

  // YouTube IFrame Player
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

    return () => { playerRef.current?.destroy() }
  }, [])

  useEffect(() => {
    if (zenMode) {
      if (playerReadyRef.current) playerRef.current?.playVideo()
      else pendingPlayRef.current = true
    } else {
      pendingPlayRef.current = false
      playerRef.current?.pauseVideo()
    }
  }, [zenMode])

  // Firebase'den chat listesini yükle
  const refreshChats = useCallback(async () => {
    if (!user) return
    setChatsLoading(true)
    try {
      const data = await fetchChatSessions(user.uid)
      setChats(data)
    } catch { /* silent */ } finally {
      setChatsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      refreshChats()
    } else {
      setChats([])
      setActiveChatId(null)
    }
  }, [user, refreshChats])

  function selectChat(id: string) { setActiveChatId(id) }
  function startNewChat() { setActiveChatId(null) }

  function prependChat(chat: ChatSession) {
    setChats((prev) => [chat, ...prev])
  }

  function updateChatInList(chatId: string, messages: Message[]) {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages } : c)),
    )
  }

  return (
    <AppContext
      value={{
        sidebarOpen,
        zenMode,
        chats,
        activeChatId,
        chatsLoading,
        toggleSidebar: () => setSidebarOpen((p) => !p),
        toggleZen: () => setZenMode((p) => !p),
        openZen: () => setZenMode(true),
        closeZen: () => setZenMode(false),
        selectChat,
        startNewChat,
        setActiveChatId,
        prependChat,
        updateChatInList,
        refreshChats,
      }}
    >
      {children}
    </AppContext>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
