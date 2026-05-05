export type EmotionLabel = "mutlu" | "üzgün" | "stresli" | "dengeli"

export type ChatResponse = {
  reply: string
  label: EmotionLabel
  energy: number
  stress: number
  isCritical: boolean
}

export type LocalJournal = {
  id: string
  text: string
  label?: string
  energy?: number
  stress?: number
  created_at: string
}

export type Message = {
  id: string
  role: "user" | "bot"
  text: string
  label?: string
  timestamp: number
}
