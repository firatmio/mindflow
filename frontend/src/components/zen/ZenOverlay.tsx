import { motion, AnimatePresence } from "framer-motion"
import { X, Music } from "lucide-react"
import { useApp } from "../../context/AppContext"
import BreathingCircle from "./BreathingCircle"

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
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
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0d1b3e 70%, #0a0a1a 100%)",
          }}
        >
          {/* Yüzen partiküller */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/10"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Arka plan hale efekti */}
          <div
            className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{
              width: 500,
              height: 500,
              background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            }}
          />

          {/* Kapat butonu */}
          <button
            onClick={closeZen}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Üst başlık */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute top-10 text-center"
          >
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-1">MindFlow</p>
            <h1 className="text-white/80 text-xl font-light tracking-wide">Güvendesin</h1>
          </motion.div>

          {/* Nefes çemberi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <BreathingCircle />
          </motion.div>

          {/* Alt bilgi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="absolute bottom-10 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Music className="w-3.5 h-3.5" />
              <span>Lofi müzik çalıyor</span>
            </div>
            <p className="text-white/20 text-[11px] tracking-widest">
              Bu an geçecek · Sen değerlisin
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
