import { motion } from "framer-motion"
import type { EmotionResult } from "../../types"
import MoodBadge from "../mood/MoodBadge"

const barColor = {
  energy: "bg-calm-400",
  stress: "bg-red-300",
}

export default function EmotionCard({ emotion }: { emotion: EmotionResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white/80 backdrop-blur border border-warm-200 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        {emotion.label && <MoodBadge label={emotion.label} />}
        {emotion.score != null && (
          <span className="text-xs text-gray-400">
            {Math.round(emotion.score * 100)}% güven
          </span>
        )}
      </div>

      {emotion.energy != null && (
        <Bar label="Enerji" value={emotion.energy} color={barColor.energy} />
      )}
      {emotion.stress != null && (
        <Bar label="Stres" value={emotion.stress} color={barColor.stress} />
      )}

      {emotion.breakdown && Object.keys(emotion.breakdown).length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {Object.entries(emotion.breakdown).map(([key, val]) => (
            <span key={key} className="text-[11px] text-gray-500">
              {key} <span className="font-medium text-gray-700">%{Math.round(val)}</span>
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}
