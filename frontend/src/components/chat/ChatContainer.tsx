import { useEffect, useRef } from "react"
import { useChat } from "../../context/ChatContext"
import ChatBubble from "./ChatBubble"
import TypingIndicator from "./TypingIndicator"

export default function ChatContainer() {
  const { messages, isAnalyzing } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAnalyzing])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-4">
            <div className="text-5xl">🍃</div>
            <h2 className="text-xl font-light text-calm-700">Merhaba!</h2>
            <p className="text-warm-300 text-sm max-w-sm">
              Bugün nasıl hissediyorsun? Duygularını benimle paylaş,
              sana destek olmak için buradayım.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isAnalyzing && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
