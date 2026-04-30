import { AuthProvider, useAuth } from "./context/AuthContext"
import { ChatProvider } from "./context/ChatContext"
import { AppProvider } from "./context/AppContext"
import { firebaseConfigured } from "./config/firebase"
import LoginScreen from "./components/auth/LoginScreen"
import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"
import ChatContainer from "./components/chat/ChatContainer"
import ChatInput from "./components/chat/ChatInput"
import ZenOverlay from "./components/zen/ZenOverlay"

function ChatApp() {
  return (
    <ChatProvider>
      <AppProvider>
        <div className="h-screen flex">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <Header />
            <ChatContainer />
            <ChatInput />
          </main>
        </div>
        <ZenOverlay />
      </AppProvider>
    </ChatProvider>
  )
}

function MainApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">🧘</div>
          <p className="text-warm-300 text-sm">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!firebaseConfigured) return <ChatApp />
  if (!user) return <LoginScreen />
  return <ChatApp />
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
