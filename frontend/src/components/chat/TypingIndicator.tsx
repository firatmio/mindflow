export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-warm-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-calm-400 rounded-full"
            style={{
              animation: "dots 1.4s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
