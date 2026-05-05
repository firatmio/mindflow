import { createContext, useContext, useState, type ReactNode } from "react"
import { sendChat } from "../api"
import { useApp } from "./AppContext"
import type { Message } from "../types"

type ChatState = {
  messages: Message[]
  isAnalyzing: boolean
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

const ChatContext = createContext<ChatState | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { openZen, addJournal } = useApp()
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
      const result = await sendChat(text)

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: result.reply,
        label: result.label,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, botMsg])

      // localStorage'a kaydet
      addJournal({
        text,
        label: result.label,
        energy: result.energy,
        stress: result.stress,
      })

      // Kritik durum → zen modunu otomatik aç
      if (result.isCritical) {
        openZen()
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: "Bağlantı hatası oluştu. Ollama'nın çalıştığından emin ol ve tekrar dene.",
          timestamp: Date.now(),
        },
      ])
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
