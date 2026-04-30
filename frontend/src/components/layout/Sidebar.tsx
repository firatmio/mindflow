import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "../../context/AppContext"
import AffirmationCard from "../affirmation/AffirmationCard"
import MoodChart from "../mood/MoodChart"
import MoodBadge from "../mood/MoodBadge"

export default function Sidebar() {
  const { sidebarOpen, journals, affirmation } = useApp()

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="border-r border-warm-200 bg-warm-50 overflow-hidden flex-shrink-0"
        >
          <div className="w-80 h-full overflow-y-auto p-4 space-y-5">
            <AffirmationCard data={affirmation} />

            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Ruh Hali Grafiği
              </h3>
              <MoodChart journals={journals} />
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Günlük Geçmişi
              </h3>
              <div className="space-y-2">
                {journals.length === 0 && (
                  <p className="text-xs text-warm-300 text-center py-4">
                    Henüz günlük yok
                  </p>
                )}
                {journals.slice(0, 20).map((j, i) => (
                  <div
                    key={j.id ?? i}
                    className="bg-white rounded-lg p-3 border border-warm-200/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      {j.label && <MoodBadge label={j.label} />}
                      {j.created_at && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(j.created_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {j.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
