import { motion } from "framer-motion"
import type { Message } from "../../types"
import EmotionCard from "./EmotionCard"

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[75%] space-y-2`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-calm-500 text-white rounded-br-sm"
              : "bg-white border border-warm-200 text-gray-700 rounded-bl-sm"
          }`}
        >
          {message.text}
        </div>

        {message.emotion && <EmotionCard emotion={message.emotion} />}

        {message.emotion?.suggestions && message.emotion.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {message.emotion.suggestions.map((s, i) => (
              <span
                key={i}
                className="inline-block text-xs bg-calm-50 text-calm-700 border border-calm-200 rounded-full px-3 py-1"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
