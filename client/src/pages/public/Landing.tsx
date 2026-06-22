import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { useAuth } from '../../lib/auth'
import { localEventTypes } from '../../lib/eventTypes'

export function Landing() {
  const navigate = useNavigate()
  const { profile, isAuthenticated, isAdmin, loginAsAdmin, logout } = useAuth()
  const [types] = useState(() => localEventTypes.list())

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-clay-900 mb-3">
          Запланируйте встречу
        </h1>
        <p className="text-lg text-clay-500">
          Выберите тип встречи и удобное время
        </p>
      </div>

      <div className="space-y-4">
        {types?.map((type) => (
          <Card key={type.id} className="group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-lg font-semibold text-clay-900">{type.title}</h3>
                  <span className="text-sm text-warm-500 font-medium">· {type.durationMinutes} мин</span>
                </div>
                <p className="text-sm text-clay-500">{type.description}</p>
              </div>
              <Link to={`/book/${type.id}`}>
                <Button size="sm">Выбрать</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center space-y-2">
        {isAuthenticated ? (
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-clay-500">
              {isAdmin ? '👑' : '👤'} {profile?.name}
            </span>
            <span className="text-clay-300">·</span>
            {isAdmin ? (
              <Link
                to="/admin"
                className="text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2"
              >
                Панель управления
              </Link>
            ) : (
              <Link
                to="/bookings"
                className="text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2"
              >
                Мои бронирования
              </Link>
            )}
            <span className="text-clay-300">·</span>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="text-clay-400 hover:text-red-500 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Выйти
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm">
            <button
              onClick={() => { loginAsAdmin(); navigate('/admin') }}
              className="text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Войти как владелец
            </button>
            <span className="text-clay-300">·</span>
            <Link
              to="/login"
              className="text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2"
            >
              Войти как гость
            </Link>
            <span className="text-clay-300">·</span>
            <Link
              to="/bookings"
              className="text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2"
            >
              Мои бронирования
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
