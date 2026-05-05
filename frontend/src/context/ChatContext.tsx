<<<<<<< HEAD
import { createContext, useContext, useState, type ReactNode } from "react"
import { sendChat } from "../api"
import { useApp } from "./AppContext"
import type { Message } from "../types"
=======
import { createContext, useContext, useState, type ReactNode } from "react";
import { analyzeEmotion, createJournal } from "../api";
import { useAuth } from "./AuthContext";
import type { Message, EmotionResult } from "../types";
>>>>>>> c92cb71 (checkpoint)

type ChatState = {
  messages: Message[];
  isAnalyzing: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
};

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
<<<<<<< HEAD
  const { openZen, addJournal } = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
=======
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
>>>>>>> c92cb71 (checkpoint)

  async function sendMessage(text: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
<<<<<<< HEAD
      const result = await sendChat(text)
=======
      const result = (await analyzeEmotion(text)) as EmotionResult & {
        text: string;
      };
>>>>>>> c92cb71 (checkpoint)

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: result.reply,
        label: result.label,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);

<<<<<<< HEAD
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
=======
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
        ).catch(() => {});
      }
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: "Bir hata oluştu, lütfen tekrar dene.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
>>>>>>> c92cb71 (checkpoint)
    } finally {
      setIsAnalyzing(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <ChatContext value={{ messages, isAnalyzing, sendMessage, clearChat }}>
      {children}
    </ChatContext>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
