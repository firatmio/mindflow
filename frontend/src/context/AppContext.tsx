import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { listJournals, getAffirmation } from "../api"
import { useAuth } from "./AuthContext"
import type { JournalEntry, AffirmationResponse } from "../types"

type AppState = {
  sidebarOpen: boolean
  zenMode: boolean
  journals: JournalEntry[]
  affirmation: AffirmationResponse | null
  toggleSidebar: () => void
  toggleZen: () => void
  refreshJournals: () => Promise<void>
  refreshAffirmation: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [zenMode, setZenMode] = useState(false)
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [affirmation, setAffirmation] = useState<AffirmationResponse | null>(null)

  const refreshJournals = useCallback(async () => {
    if (!token) return
    try {
      const data = await listJournals(token)
      setJournals(data.items ?? data)
    } catch { /* silently fail */ }
  }, [token])

  const refreshAffirmation = useCallback(async () => {
    try {
      const recentLabels = journals
        .slice(0, 5)
        .map((j) => j.label)
        .filter((l): l is string => !!l)
      const data = await getAffirmation(recentLabels)
      setAffirmation(data)
    } catch { /* silently fail */ }
  }, [journals])

  useEffect(() => {
    if (token) {
      refreshJournals()
      refreshAffirmation()
    }
  }, [token, refreshJournals, refreshAffirmation])

  function toggleSidebar() {
    setSidebarOpen((p) => !p)
  }

  function toggleZen() {
    setZenMode((p) => !p)
  }

  return (
    <AppContext value={{
      sidebarOpen, zenMode, journals, affirmation,
      toggleSidebar, toggleZen, refreshJournals, refreshAffirmation,
    }}>
      {children}
    </AppContext>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
