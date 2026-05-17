import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Phase =
  | { type: "ready" }
  | { type: "inhale"; duration: number }
  | { type: "hold"; duration: number }
  | { type: "exhale"; duration: number }

const READY_DURATION = 3200

const breathCycle: Array<Exclude<Phase, { type: "ready" }>> = [
  { type: "inhale", duration: 4000 },
  { type: "hold", duration: 7000 },
  { type: "exhale", duration: 8000 },
]

const labels: Record<Phase["type"], string> = {
  ready: "Hazır ol...",
  inhale: "Nefes al...",
  hold: "Tut...",
  exhale: "Nefes ver...",
}

export default function BreathingCircle() {
  const [phase, setPhase] = useState<Phase>({ type: "ready" })
  const [cycleIdx, setCycleIdx] = useState(0)

  useEffect(() => {
    if (phase.type === "ready") {
      const t = setTimeout(() => {
        setCycleIdx(0)
        setPhase(breathCycle[0])
      }, READY_DURATION)
      return () => clearTimeout(t)
    }

    const duration = (phase as Exclude<Phase, { type: "ready" }>).duration
    const t = setTimeout(() => {
      const next = (cycleIdx + 1) % breathCycle.length
      setCycleIdx(next)
      setPhase(breathCycle[next])
    }, duration)
    return () => clearTimeout(t)
  }, [phase, cycleIdx])

  const isReady = phase.type === "ready"
  const isExpanded = phase.type === "inhale" || phase.type === "hold"
  const duration = isReady ? 0 : (phase as Exclude<Phase, { type: "ready" }>).duration

  return (
    <div className="flex flex-col items-center gap-10">
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="circle"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 70%)",
              }}
              animate={{ scale: isExpanded ? 2.4 : 1.2, opacity: isExpanded ? 1 : 0.4 }}
              transition={{ duration: duration / 1000, ease: "easeInOut" }}
            />
            <motion.div
              className="w-36 h-36 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, rgba(110,231,183,0.25) 0%, rgba(16,185,129,0.12) 50%, rgba(5,150,105,0.06) 100%)",
                border: "1.5px solid rgba(110,231,183,0.2)",
                boxShadow: "0 0 40px rgba(52,211,153,0.08), inset 0 0 30px rgba(52,211,153,0.04)",
              }}
              animate={{ scale: isExpanded ? 1.75 : 1 }}
              transition={{ duration: duration / 1000, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={phase.type}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="text-white/60 text-xl font-light tracking-widest"
        >
          {labels[phase.type]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
