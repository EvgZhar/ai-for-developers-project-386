import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {

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
