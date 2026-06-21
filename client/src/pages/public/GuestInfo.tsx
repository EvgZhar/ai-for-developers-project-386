import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { setStoredLocale } from '../../lib/dateUtils'
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

  const [name, setName] = useState('')
  const [agenda, setAgenda] = useState('')
  const [locale] = useState('ru-RU')
  const [timeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const createProfile = useMutation({
    mutationFn: (body: { name: string; locale: string; timeZone: string }) =>
      api.profiles.create(body),
  })

  const createBooking = useMutation({
    mutationFn: (body: { eventTypeId: string; startDateTime: string; agenda?: string; guestProfileId: string }) =>
      api.bookings.create(body),
  })

  if (!state) {
    navigate(`/book/${eventTypeId}`)
    return null
  }

  const { slot, eventType } = state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const profile = await createProfile.mutateAsync({ name, locale, timeZone })
      setStoredLocale(locale)
      const booking = await createBooking.mutateAsync({
        eventTypeId: eventTypeId!,
        startDateTime: slot.startDateTime,
        agenda: agenda || undefined,
        guestProfileId: profile.id,
      })
      navigate(`/booking/${booking.id}`, {
        state: { booking, eventType, profile },
      })
    } catch {
      // error handled by mutation state
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
            />
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
              loading={createProfile.isPending || createBooking.isPending}
              disabled={!name.trim()}
            >
              Подтвердить бронь
            </Button>
            {createBooking.isError && (
              <span className="text-sm text-red-500">
                Ошибка: {createBooking.error?.message || 'Не удалось создать бронь'}
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
