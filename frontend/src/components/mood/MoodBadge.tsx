const colors: Record<string, string> = {
  mutlu: "bg-emotion-happy/20 text-green-700",
  "üzgün": "bg-emotion-sad/20 text-blue-700",
  stresli: "bg-emotion-stressed/20 text-red-700",
  dengeli: "bg-emotion-balanced/20 text-purple-700",
}

const emoji: Record<string, string> = {
  mutlu: "😊",
  "üzgün": "😢",
  stresli: "😰",
  dengeli: "😌",
}

export default function MoodBadge({ label }: { label: string }) {
  const colorClass = colors[label] ?? "bg-gray-100 text-gray-600"
  const icon = emoji[label] ?? "🙂"

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${colorClass}`}>
      {icon} {label}
    </span>
  )
}
