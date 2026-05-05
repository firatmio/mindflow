import { useState } from "react"
import { motion } from "framer-motion"
import { MoreHorizontal } from "lucide-react"
import { useChat } from "../../context/ChatContext"
import type { Message } from "../../types"

const moodEmoji: Record<string, string> = {
  mutlu: "😊",
  üzgün: "😔",
  stresli: "😰",
  dengeli: "🌿",
}

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const hasEmotion = !isUser && !!message.label
  const { openPanel, panelMessageId } = useChat()
  const [hovered, setHovered] = useState(false)
  const isOpen = panelMessageId === message.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0 text-sm mb-1">
          🍃
        </div>
      )}

      <div className="max-w-[68%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-calm-500 text-white rounded-br-sm"
              : "bg-white border border-warm-200 text-gray-700 rounded-bl-sm shadow-sm"
          }`}
        >
          {message.text}
        </div>

        {!isUser && message.label && (
          <p className="text-[11px] text-gray-400 ml-1">
            {moodEmoji[message.label] ?? ""} {message.label}
          </p>
        )}
      </div>

      {/* Üç nokta butonu — sadece duygu verisi olan bot mesajlarında */}
      {hasEmotion && (
        <button
          onClick={() => openPanel(message.id)}
          className="flex-shrink-0 mb-1 p-1 rounded-lg transition-all cursor-pointer"
          style={{
            opacity: hovered || isOpen ? 1 : 0,
            background: isOpen ? "rgba(99,182,160,0.15)" : "transparent",
            color: isOpen ? "#3d8f78" : "#9ca3af",
          }}
          title="Duygu raporunu gör"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}
