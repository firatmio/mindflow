import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { sendChat } from "../api";
import { useApp } from "./AppContext";
import { useAuth } from "./AuthContext";
import { createChatSession, updateChatSession } from "../services/firestore";
import type { Message, ChatSession } from "../types";

type ChatState = {
  messages: Message[];
  isAnalyzing: boolean;
  panelMessageId: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  openPanel: (messageId: string) => void;
  closePanel: () => void;
};

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const {
    openZen,
    activeChatId,
    setActiveChatId,
    prependChat,
    updateChatInList,
    chats,
  } = useApp();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [panelMessageId, setPanelMessageId] = useState<string | null>(null);

  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    if (activeChatId === null) {
      setMessages([]);
      setPanelMessageId(null);
      return;
    }
    const chat = chatsRef.current.find((c) => c.id === activeChatId);
    if (chat) setMessages(chat.messages);
  }, [activeChatId]);

  async function sendMessage(text: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setIsAnalyzing(true);

    try {
      const result = await sendChat(text);

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        text: result.reply,
        label: result.label,
        energy: result.energy,
        stress: result.stress,
        timestamp: Date.now(),
      };
      const finalMessages = [...withUser, botMsg];
      setMessages(finalMessages);

      if (result.isCritical) openZen();

      if (user) {
        if (activeChatId === null) {
          const newId = await createChatSession(
            user.uid,
            result.reply,
            finalMessages,
          );
          const newChat: ChatSession = {
            id: newId,
            title: result.reply.slice(0, 60),
            createdAt: new Date().toISOString(),
            messages: finalMessages,
          };
          setActiveChatId(newId);
          prependChat(newChat);
        } else {
          await updateChatSession(user.uid, activeChatId, finalMessages);
          updateChatInList(activeChatId, finalMessages);
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
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <ChatContext
      value={{
        messages,
        isAnalyzing,
        panelMessageId,
        sendMessage,
        clearChat: () => setMessages([]),
        openPanel: (id) => setPanelMessageId(id),
        closePanel: () => setPanelMessageId(null),
      }}
    >
      {children}
    </ChatContext>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
