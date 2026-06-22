import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

export function Login() {
  const navigate = useNavigate()
  const { loginAsGuest } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const profile = loginAsGuest(name.trim())
    if (profile) {
      navigate('/', { replace: true })
    } else {
      setError('Пользователь с таким именем не найден')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Card>
        <h1 className="text-xl font-bold text-clay-900 mb-2">Вход как гость</h1>
        <p className="text-sm text-clay-500 mb-6">
          Введите имя, чтобы войти в существующий профиль
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-clay-700 mb-1.5">
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                placeholder:text-clay-400 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
              placeholder="Введите ваше имя"
              required
              autoFocus
            />
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
            Войти
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-clay-200 text-center">
          <p className="text-sm text-clay-500 mb-3">Нет профиля?</p>
          <Link to="/register">
            <Button variant="secondary" className="w-full">
              Зарегистрироваться
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-clay-400 hover:text-warm-600 transition-colors"
          >
            ← На главную
          </Link>
        </div>
      </Card>
    </div>
  )
}
