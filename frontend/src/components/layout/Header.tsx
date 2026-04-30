import { Menu, Flower2, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useApp } from "../../context/AppContext"

export default function Header() {
  const { user, logout } = useAuth()
  const { toggleSidebar, toggleZen } = useApp()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-white/60 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-warm-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-lg font-medium text-calm-700 tracking-tight">
          MindFlow
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleZen}
          className="p-2 rounded-lg hover:bg-calm-50 transition-colors cursor-pointer"
          title="Zen Modu"
        >
          <Flower2 className="w-5 h-5 text-calm-500" />
        </button>

        {user && (
          <div className="flex items-center gap-2 ml-2">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="w-7 h-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-warm-100 transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
