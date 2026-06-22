import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function PublicLayout() {
  const navigate = useNavigate()
  const { profile, isAuthenticated, isAdmin, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-clay-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-warm-600 hover:text-warm-700 transition-colors">
            <span className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span>CalBook</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-clay-600 hover:text-warm-600 transition-colors"
            >
              Типы встреч
            </Link>
            {isAuthenticated && (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="text-clay-600 hover:text-warm-600 transition-colors"
                  >
                    Панель управления
                  </Link>
                ) : (
                  <Link
                    to="/bookings"
                    className="text-clay-600 hover:text-warm-600 transition-colors"
                  >
                    Мои бронирования
                  </Link>
                )}
                <span className="text-clay-400 text-xs">{profile?.name}</span>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="text-clay-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Выйти
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-clay-200 py-4 text-center text-xs text-clay-400">
        CalBook — планирование встреч
      </footer>
    </div>
  )
}
