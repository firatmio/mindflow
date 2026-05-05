import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MessageCircle, Loader2, FileText } from "lucide-react"
import { useApp } from "../../context/AppContext"
import { useAuth } from "../../context/AuthContext"
import { generateReport } from "../../services/reportGenerator"

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Az önce"
  if (mins < 60) return `${mins} dk önce`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} sa önce`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} gün önce`
  return new Date(isoString).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
}

export default function Sidebar() {
  const { sidebarOpen, chats, activeChatId, chatsLoading, selectChat, startNewChat } = useApp()
  const { user } = useAuth()
  const [generatingReport, setGeneratingReport] = useState(false)

  async function handleReport() {
    if (generatingReport || chats.length === 0) return
    setGeneratingReport(true)
    // Kısa bekleme — "oluşturuyor" animasyonunun görünmesi için
    await new Promise((r) => setTimeout(r, 800))
    const html = generateReport(chats, user?.displayName ?? user?.email ?? "Kullanıcı")
    setGeneratingReport(false)
    if (!html) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(html)
    win.document.close()
  }

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 272, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="border-r border-warm-200 bg-warm-50 overflow-hidden flex-shrink-0 flex flex-col"
        >
          <div className="flex flex-col h-full" style={{ width: 272 }}>
            {/* Yeni sohbet */}
            <div className="p-3 border-b border-warm-200/60">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(99,182,160,0.12) 0%, rgba(99,182,160,0.06) 100%)",
                  color: "#3d8f78",
                  border: "1px solid rgba(99,182,160,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(99,182,160,0.2) 0%, rgba(99,182,160,0.12) 100%)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(99,182,160,0.12) 0%, rgba(99,182,160,0.06) 100%)"
                }}
              >
                <Plus className="w-4 h-4" />
                Yeni Sohbet
              </button>
            </div>

            {/* Chat listesi */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {chatsLoading && (
                <div className="flex items-center justify-center py-10 text-warm-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}

              {!chatsLoading && chats.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <MessageCircle className="w-8 h-8 text-warm-200 mx-auto" />
                  <p className="text-xs text-warm-300">Henüz sohbet yok</p>
                </div>
              )}

              {chats.map((chat) => {
                const isActive = chat.id === activeChatId
                return (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                    style={{
                      background: isActive ? "rgba(99,182,160,0.12)" : "transparent",
                      borderLeft: isActive
                        ? "2px solid rgba(99,182,160,0.6)"
                        : "2px solid transparent",
                    }}
                  >
                    <p
                      className="text-sm leading-snug line-clamp-2"
                      style={{ color: isActive ? "#2d6b58" : "#6b5f54" }}
                    >
                      {chat.title}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "#b8a898" }}>
                      {timeAgo(chat.createdAt)}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Rapor butonu — sabit altta */}
            <div className="p-3 border-t border-warm-200/60">
              <button
                onClick={handleReport}
                disabled={generatingReport || chats.length === 0}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "transparent",
                  color: "#9ca3af",
                  border: "1px solid #e5e7eb",
                }}
                onMouseEnter={(e) => {
                  if (!generatingReport && chats.length > 0) {
                    e.currentTarget.style.background = "#f9f7f5"
                    e.currentTarget.style.color = "#6b5f54"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#9ca3af"
                }}
              >
                {generatingReport ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Oluşturuyor...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    Raporu Görüntüle
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
