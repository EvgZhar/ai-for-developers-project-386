import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { setStoredLocale } from '../../lib/dateUtils'

export function AdminSettings() {
  const queryClient = useQueryClient()

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  })

  const adminProfile = profiles?.find((p) => p.type === 'admin')

  const [name, setName] = useState('')
  const [locale, setLocale] = useState('ru-RU')
  const [timeZone, setTimeZone] = useState('Europe/Moscow')

  useEffect(() => {
    if (adminProfile) {
      setName(adminProfile.name)
      setLocale(adminProfile.locale)
      setTimeZone(adminProfile.timeZone)
    }
  }, [adminProfile])

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; locale: string; timeZone: string }) =>
      api.profiles.update(adminProfile!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !adminProfile) return
    updateMutation.mutate({ name, locale, timeZone })
  }

  if (!adminProfile) {
    return (
      <div className="text-center py-16">
        <p className="text-clay-500">Профиль администратора не найден</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-clay-900 mb-6">Настройки</h1>

      <Card>
        <h2 className="font-semibold text-clay-900 mb-4">Профиль владельца</h2>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
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
      </Card>
    </div>
  )
}
