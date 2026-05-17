import { AuthProvider, useAuth } from "./context/AuthContext"
import { AppProvider } from "./context/AppContext"
import { ChatProvider } from "./context/ChatContext"
import LoginScreen from "./components/auth/LoginScreen"
import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"
import ChatContainer from "./components/chat/ChatContainer"
import ChatInput from "./components/chat/ChatInput"
import EmotionPanel from "./components/chat/EmotionPanel"
import ZenOverlay from "./components/zen/ZenOverlay"

function ChatApp() {
  return (
    <AppProvider>
      <div
        id="yt-player"
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", bottom: 0, left: 0 }}
      />
      <ChatProvider>
        <div className="h-screen flex">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <Header />
            <div className="flex-1 flex min-h-0">
              <ChatContainer />
              <EmotionPanel />
            </div>
            <ChatInput />
          </main>
        </div>
        <ZenOverlay />
      </ChatProvider>
    </AppProvider>
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
