import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { sendChat } from "../api"
import { useApp } from "./AppContext"
import { useAuth } from "./AuthContext"
import { createChatSession, updateChatSession } from "../services/firestore"
import type { Message, ChatSession } from "../types"

type ChatState = {
  messages: Message[]
  isAnalyzing: boolean
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

const ChatContext = createContext<ChatState | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { openZen, activeChatId, setActiveChatId, prependChat, updateChatInList, chats } = useApp()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Sidebar'dan chat seçilince o chatin mesajlarını yükle
  const chatsRef = useRef(chats)
  useEffect(() => { chatsRef.current = chats }, [chats])

  useEffect(() => {
    if (activeChatId === null) {
      setMessages([])
      return
    }
    const chat = chatsRef.current.find((c) => c.id === activeChatId)
    if (chat) setMessages(chat.messages)
  }, [activeChatId])

  async function sendMessage(text: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: Date.now(),
    }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
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
      const finalMessages = [...withUser, botMsg]
      setMessages(finalMessages)

      if (result.isCritical) openZen()

      if (user) {
        if (activeChatId === null) {
          // Yeni sohbet — AI'ın ilk yanıtı başlık oluyor
          const newId = await createChatSession(user.uid, result.reply, finalMessages)
          const newChat: ChatSession = {
            id: newId,
            title: result.reply.slice(0, 60),
            createdAt: new Date().toISOString(),
            messages: finalMessages,
          }
          setActiveChatId(newId)
          prependChat(newChat)
        } else {
          // Var olan sohbeti güncelle
          await updateChatSession(user.uid, activeChatId, finalMessages)
          updateChatInList(activeChatId, finalMessages)
        }
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

  return (
    <ChatContext value={{ messages, isAnalyzing, sendMessage, clearChat: () => setMessages([]) }}>
      {children}
    </ChatContext>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
