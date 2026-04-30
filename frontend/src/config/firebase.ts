import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

export const firebaseConfigured = !!apiKey

function init() {
  if (!firebaseConfigured) return { auth: null }
  const app = initializeApp({
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
  return { auth: getAuth(app) }
}

const { auth } = init()
export { auth }
export const googleProvider = new GoogleAuthProvider()
