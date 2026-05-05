import { motion } from "framer-motion";
import type { Message } from "../../types";

const moodEmoji: Record<string, string> = {
  mutlu: "😊",
  üzgün: "😔",
  stresli: "😰",
  dengeli: "🌿",
};

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0 text-sm mb-1">
          🍃
        </div>
      )}

      <div className="max-w-[72%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed chat-içerigi ${
            isUser
              ? "bg-calm-500 text-white rounded-br-sm"
              : "bg-white border border-warm-200 text-gray-700 rounded-bl-sm shadow-sm"
          }`}
          style={{ userSelect: "text" }}
        >
          {message.text}
        </div>

        {!isUser && message.label && (
          <p className="text-[11px] text-gray-400 ml-1">
            {moodEmoji[message.label] ?? ""} {message.label}
          </p>
        )}
      </div>
    </motion.div>
  );
}
