export type EmotionLabel = "mutlu" | "üzgün" | "stresli" | "dengeli"

export type EmotionResult = {
  label?: EmotionLabel
  score?: number
  energy?: number
  stress?: number
  insight?: string
  suggestions?: string[]
  breakdown?: Record<string, number>
}

export type AffirmationResponse = {
  affirmation: string
  suggestions: string[]
  quote: { original: string; translated?: string; author?: string }
}

export type JournalEntry = {
  id?: string
  text: string
  label?: string | null
  score?: number | null
  energy?: number | null
  stress?: number | null
  breakdown?: Record<string, number> | null
  created_at?: string
}

export type Message = {
  id: string
  role: "user" | "bot"
  text: string
  emotion?: EmotionResult
  timestamp: number
}
