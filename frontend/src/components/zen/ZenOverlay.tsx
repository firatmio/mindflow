import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useApp } from "../../context/AppContext"
import BreathingCircle from "./BreathingCircle"
import AmbientSound from "./AmbientSound"

export default function ZenOverlay() {
  const { zenMode, toggleZen } = useApp()

  return (
    <AnimatePresence>
      {zenMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center"
        >
          <button
            onClick={toggleZen}
            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <BreathingCircle />

          <div className="absolute bottom-8">
            <AmbientSound />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
