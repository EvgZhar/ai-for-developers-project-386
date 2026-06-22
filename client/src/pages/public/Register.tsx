import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [locale, setLocale] = useState('ru-RU')
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      register(name.trim(), locale, timeZone)
      navigate('/', { replace: true })
    } catch {
      setError('Не удалось создать профиль')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Card>
        <h1 className="text-xl font-bold text-clay-900 mb-2">Регистрация</h1>
        <p className="text-sm text-clay-500 mb-6">
          Создайте гостевой профиль для бронирования встреч
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-clay-700 mb-1.5">
              Имя <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                placeholder:text-clay-400 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
              placeholder="Иван Иванов"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-clay-700 mb-1.5">
              Локаль
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
            >
              <option value="ru-RU">Русский (ru-RU)</option>
              <option value="en-US">English (en-US)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-clay-700 mb-1.5">
              Часовой пояс
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
            >
              <option value="Europe/Kaliningrad">Europe/Kaliningrad</option>
              <option value="Europe/Moscow">Europe/Moscow (MSK)</option>
              <option value="Europe/Samara">Europe/Samara</option>
              <option value="Asia/Yekaterinburg">Asia/Yekaterinburg</option>
              <option value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</option>
              <option value="Asia/Irkutsk">Asia/Irkutsk</option>
              <option value="Asia/Vladivostok">Asia/Vladivostok</option>
              <option value="Asia/Kamchatka">Asia/Kamchatka</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!name.trim()}
          >
            Создать профиль
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-clay-200 text-center">
          <p className="text-sm text-clay-500 mb-3">Уже есть профиль?</p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Войти
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
