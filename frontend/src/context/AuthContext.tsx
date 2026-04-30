import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth"
import { auth, googleProvider, firebaseConfigured } from "../config/firebase"

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const t = await u.getIdToken()
        setToken(t)
        localStorage.setItem("firebaseToken", t)
      } else {
        setToken(null)
        localStorage.removeItem("firebaseToken")
      }
      setLoading(false)
    })
  }, [])

  async function loginWithGoogle() {
    if (!auth) return
    await signInWithPopup(auth, googleProvider)
  }

  async function logout() {
    if (!auth) return
    await signOut(auth)
  }

  return (
    <AuthContext value={{ user, token, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
