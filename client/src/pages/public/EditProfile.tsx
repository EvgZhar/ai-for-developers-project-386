import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { setStoredLocale } from '../../lib/dateUtils'

export function EditProfile() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [locale, setLocale] = useState('ru-RU')
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  })

  const profile = profiles?.find((p) => p.id === profileId)

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setLocale(profile.locale)
      setTimeZone(profile.timeZone)
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; locale: string; timeZone: string }) =>
      api.profiles.update(profileId!, body),
    onSuccess: (_data, variables) => {
      setStoredLocale(variables.locale)
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.profiles.delete(profileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      navigate('/bookings', { replace: true })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateMutation.mutate({ name, locale, timeZone })
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-clay-500 mb-4">Профиль не найден</p>
        <Link to="/bookings">
          <Button variant="secondary">Мои бронирования</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Link
        to={`/bookings?guestProfileId=${profileId}`}
        className="text-sm text-clay-400 hover:text-warm-600 transition-colors mb-4 flex items-center gap-1"
      >
        ← Мои бронирования
      </Link>

      <Card>
        <h1 className="text-xl font-bold text-clay-900 mb-6">Настройки профиля</h1>

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
              required
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

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={updateMutation.isPending}>
              Сохранить
            </Button>
            {updateMutation.isSuccess && (
              <span className="text-sm text-sage-600">Сохранено</span>
            )}
            {updateMutation.isError && (
              <span className="text-sm text-red-500">{updateMutation.error?.message}</span>
            )}
          </div>
        </form>

        <hr className="my-6 border-clay-200" />

        <div>
          <h2 className="text-sm font-medium text-red-600 mb-2">Опасная зона</h2>
          <p className="text-xs text-clay-500 mb-3">
            Удаление профиля приведёт к потере доступа к истории бронирований.
          </p>
          <Button
            variant="danger"
            size="sm"
            loading={deleteMutation.isPending}
            onClick={() => {
              if (confirm('Удалить профиль? Это действие необратимо.')) {
                deleteMutation.mutate()
              }
            }}
          >
            Удалить профиль
          </Button>
        </div>
      </Card>
    </div>
  )
}
