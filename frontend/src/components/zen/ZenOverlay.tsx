import { motion, AnimatePresence } from "framer-motion"
import { X, Music } from "lucide-react"
import { useApp } from "../../context/AppContext"
import BreathingCircle from "./BreathingCircle"

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1.5,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
}))

export default function ZenOverlay() {
  const { zenMode, closeZen } = useApp()

  return (
    <AnimatePresence>
      {zenMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, #060e0a 0%, #0c1e13 30%, #081912 55%, #050d09 80%, #060e0b 100%)",
          }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: "rgba(134, 239, 172, 0.35)",
                boxShadow: "0 0 6px rgba(134, 239, 172, 0.4)",
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 10, -5, 0],
                opacity: [0, 0.5, 0.2, 0],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: 600,
              height: 300,
              background:
                "radial-gradient(ellipse at center bottom, rgba(52,211,153,0.07) 0%, transparent 70%)",
            }}
          />

          <button
            onClick={closeZen}
            className="absolute top-6 right-6 p-2.5 rounded-full transition-all cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)"
              e.currentTarget.style.color = "rgba(255,255,255,0.8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)"
              e.currentTarget.style.color = "rgba(255,255,255,0.4)"
            }}
          >
            <X className="w-4 h-4" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="absolute top-10 text-center"
          >
            <p
              className="text-xs tracking-[0.35em] uppercase mb-1.5"
              style={{ color: "rgba(134,239,172,0.35)" }}
            >
              MindFlow · Zen
            </p>
            <h1
              className="text-2xl font-light tracking-wide"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Güvendesin
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <BreathingCircle />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute bottom-10 flex flex-col items-center gap-2.5"
          >
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "rgba(134,239,172,0.4)" }}
            >
              <Music className="w-3 h-3" />
              <span>Lofi müzik çalıyor</span>
            </div>
            <p
              className="text-[11px] tracking-widest"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              Bu an geçecek · Sen değerlisin
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
