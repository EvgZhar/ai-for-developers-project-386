import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/admin', label: 'Бронирования', icon: '📅' },
  { path: '/admin/schedule', label: 'Расписание', icon: '⏰' },
  { path: '/admin/event-types', label: 'Типы событий', icon: '📋' },
  { path: '/admin/settings', label: 'Настройки', icon: '⚙️' },
]

export function AdminLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-clay-900 text-clay-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-clay-700">
          <Link to="/admin" className="text-lg font-bold text-warm-300 hover:text-warm-200 transition-colors flex items-center gap-2">
            <span>📅</span>
            <span>CalBook</span>
          </Link>
          <span className="text-xs text-clay-400 mt-1 block">Панель управления</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-clay-800 text-warm-200'
                    : 'text-clay-300 hover:bg-clay-800 hover:text-clay-100'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-clay-700">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-clay-400 hover:text-clay-200 transition-colors"
          >
            ← На сайт
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-warm-50 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
