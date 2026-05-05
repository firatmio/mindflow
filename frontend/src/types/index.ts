export type EmotionLabel = "mutlu" | "üzgün" | "stresli" | "dengeli"

export type ChatResponse = {
  reply: string
  label: EmotionLabel
  energy: number
  stress: number
  isCritical: boolean
}

export type Message = {
  id: string
  role: "user" | "bot"
  text: string
  label?: string
  timestamp: number
}

export type ChatSession = {
  id: string
  title: string
  createdAt: string
  messages: Message[]
}
