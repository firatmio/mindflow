import { createContext, useContext, useState, type ReactNode } from "react"
import { analyzeEmotion, createJournal } from "../api"
import { useAuth } from "./AuthContext"
import type { Message, EmotionResult } from "../types"

type ChatState = {
  messages: Message[]
  isAnalyzing: boolean
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

const ChatContext = createContext<ChatState | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function sendMessage(text: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsAnalyzing(true)

    try {
      const result = await analyzeEmotion(text) as EmotionResult & { text: string }

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: result.insight || "Duygularını analiz ettim.",
        emotion: result,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, botMsg])

      if (token) {
        await createJournal(
          {
            text,
            label: result.label ?? null,
            score: result.score ?? null,
            energy: result.energy ?? null,
            stress: result.stress ?? null,
            breakdown: result.breakdown ?? null,
          },
          token,
        ).catch(() => {})
      }
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: "Bir hata oluştu, lütfen tekrar dene.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsAnalyzing(false)
    }
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <ChatContext value={{ messages, isAnalyzing, sendMessage, clearChat }}>
      {children}
    </ChatContext>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
