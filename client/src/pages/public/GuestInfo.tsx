import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { setStoredLocale } from '../../lib/dateUtils'
import { useAuth, localProfiles } from '../../lib/auth'
import { localBookings } from '../../lib/bookings'
import type { AvailableSlot, EventType } from '../../api/types'

interface LocationState {
  slot: AvailableSlot
  eventType: EventType
}

export function GuestInfo() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const { profile, isAuthenticated } = useAuth()

  const [name, setName] = useState(profile?.name || '')
  const [agenda, setAgenda] = useState('')
  const [locale] = useState('ru-RU')
  const [timeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!state) {
    navigate(`/book/${eventTypeId}`)
    return null
  }

  const { slot, eventType } = state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      let guestProfileId: string

      if (isAuthenticated && profile) {
        guestProfileId = profile.id
      } else {
        const newProfile = localProfiles.create({ name, locale, timeZone })
        guestProfileId = newProfile.id
      }

      setStoredLocale(locale)
      const booking = localBookings.create({
        eventTypeId: eventTypeId!,
        startDateTime: slot.startDateTime,
        agenda: agenda || undefined,
        guestProfileId,
      })

      navigate(`/booking/${booking.id}`, {
        state: { booking, eventType },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать бронь')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-clay-400 hover:text-warm-600 transition-colors mb-4 flex items-center gap-1"
      >
        ← Назад
      </button>

      <Card>
        <h1 className="text-xl font-bold text-clay-900 mb-6">Ваши данные</h1>

        <div className="mb-6 p-4 bg-warm-50 rounded-lg border border-warm-200">
          <p className="text-sm font-medium text-clay-700">{eventType.title}</p>
          <p className="text-xs text-clay-500 mt-1">
            {new Date(slot.startDateTime).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {' '}· {new Date(slot.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            {' — '}
            {new Date(slot.endDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-clay-700 mb-1.5">
              Ваше имя <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                placeholder:text-clay-400 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
              placeholder="Иван Иванов"
              required
              disabled={isAuthenticated}
            />
            {isAuthenticated && (
              <p className="text-xs text-clay-400 mt-1">
                Используется текущий профиль
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-clay-700 mb-1.5">
              Заметка к встрече
            </label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                placeholder:text-clay-400 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all resize-none"
              placeholder="О чём хотите поговорить?"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              loading={loading}
              disabled={!name.trim()}
            >
              Подтвердить бронь
            </Button>
            {error && (
              <span className="text-sm text-red-500">{error}</span>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
