import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, TrendingDown, Brain } from "lucide-react"
import { useChat } from "../../context/ChatContext"

const moodEmoji: Record<string, string> = {
  mutlu: "😊",
  üzgün: "😔",
  stresli: "😰",
  dengeli: "🌿",
}

const moodColor: Record<string, { bg: string; text: string; border: string }> = {
  mutlu: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  üzgün: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  stresli: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  dengeli: { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs" style={{ color: "#6b7280" }}>
        <span>{label}</span>
        <span className="font-medium" style={{ color: "#374151" }}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function EmotionPanel() {
  const { messages, panelMessageId, closePanel } = useChat()

  const message = messages.find((m) => m.id === panelMessageId)
  const msgIndex = messages.findIndex((m) => m.id === panelMessageId)
  const prevUserMsg = msgIndex > 0 ? messages[msgIndex - 1] : null

  const colors = message?.label ? moodColor[message.label] : null

  return (
    <AnimatePresence>
      {panelMessageId && message && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="flex-shrink-0 overflow-y-auto"
          style={{
            width: 288,
            margin: "12px 12px 12px 0",
            borderRadius: 16,
            border: "1px solid #e8dfd4",
            background: "#ffffff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#f0e8e0" }}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" style={{ color: "#9ca3af" }} />
              <span className="text-sm font-medium" style={{ color: "#374151" }}>
                Duygu Raporu
              </span>
            </div>
            <button
              onClick={closePanel}
              className="p-1 rounded-lg cursor-pointer transition-colors hover:bg-warm-100"
              style={{ color: "#9ca3af" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {prevUserMsg && (
              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: "#fafaf9", color: "#6b7280", border: "1px solid #f0e8e0" }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "#b8a898" }}>
                  Analiz edilen metin
                </p>
                <p className="line-clamp-3">{prevUserMsg.text}</p>
              </div>
            )}

            {message.label && colors && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <span>{moodEmoji[message.label] ?? ""}</span>
                <span className="capitalize">{message.label}</span>
              </div>
            )}

            {(message.energy != null || message.stress != null) && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#b8a898" }}>
                  Seviyeler
                </p>
                {message.energy != null && (
                  <Bar
                    label="Enerji"
                    value={message.energy}
                    color="linear-gradient(90deg, #4ade80, #22c55e)"
                  />
                )}
                {message.stress != null && (
                  <Bar
                    label="Stres"
                    value={message.stress}
                    color="linear-gradient(90deg, #fca5a5, #f87171)"
                  />
                )}
              </div>
            )}

            <div
              className="rounded-xl p-3 space-y-1.5"
              style={{ background: "#f9f7f5", border: "1px solid #f0e8e0" }}
            >
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#b8a898" }}>
                Genel durum
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}>
                {(message.energy ?? 50) >= 50 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span>
                  {(message.stress ?? 0) >= 70
                    ? "Yüksek stres tespit edildi. Nefes egzersizleri faydalı olabilir."
                    : (message.energy ?? 50) < 40
                    ? "Düşük enerji seviyesi. Dinlenme önerilir."
                    : "Dengeli bir duygu durumu gözlemlendi."}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
