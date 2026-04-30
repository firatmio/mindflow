import { useState, useRef, type KeyboardEvent } from "react"
import { Send } from "lucide-react"
import { useChat } from "../../context/ChatContext"

export default function ChatInput() {
  const { sendMessage, isAnalyzing } = useChat()
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || isAnalyzing) return
    setText("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    await sendMessage(trimmed)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-warm-200">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize() }}
          onKeyDown={handleKeyDown}
          placeholder="Bugün nasıl hissediyorsun?"
          rows={1}
          disabled={isAnalyzing}
          className="flex-1 resize-none rounded-2xl border border-warm-200 bg-white px-4 py-3 text-sm placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-calm-300 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isAnalyzing}
          className="p-3 rounded-full bg-calm-500 text-white hover:bg-calm-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
