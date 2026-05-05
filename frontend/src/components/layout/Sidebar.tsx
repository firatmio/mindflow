import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import MoodChart from "../mood/MoodChart";
import MoodBadge from "../mood/MoodBadge";

export default function Sidebar() {
  const { sidebarOpen, journals } = useApp();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 288, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="border-r border-warm-200 bg-warm-50 overflow-hidden flex-shrink-0"
        >
          <div className="w-72 h-full overflow-y-auto p-4 space-y-5">
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Ruh Hali Grafiği
              </h3>
              <MoodChart journals={journals} />
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Günlük Geçmişi
              </h3>
              <div className="space-y-2">
                {journals.length === 0 && (
                  <p className="text-xs text-warm-300 text-center py-6">
                    Henüz günlük yok
                  </p>
                )}
                {journals.slice(0, 20).map((j) => (
                  <div
                    key={j.id}
                    className="bg-white rounded-lg p-3 border border-warm-200/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      {j.label && <MoodBadge label={j.label} />}
                      <span className="text-[10px] text-gray-400 chat-içerigi">
                        {new Date(j.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p
                      className="text-xs text-gray-500 line-clamp-2"
                      style={{ userSelect: "text" }}
                    >
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
  );
}
