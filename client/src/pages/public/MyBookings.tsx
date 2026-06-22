import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatusBadge } from '../../components/StatusBadge'
import { getStoredLocale, formatDate, formatTime } from '../../lib/dateUtils'
import { useAuth, localProfiles } from '../../lib/auth'
import { localEventTypes } from '../../lib/eventTypes'
import { localBookings } from '../../lib/bookings'

export function MyBookings() {
  const { profile } = useAuth()
  const locale = getStoredLocale()
  const currentProfileId = profile?.id || ''
  const [refreshKey, setRefreshKey] = useState(0)

  const eventTypes = useMemo(() => localEventTypes.list(), [])

  const bookings = useMemo(
    () => (currentProfileId ? localBookings.listByGuest(currentProfileId) : []),
    [currentProfileId, refreshKey]
  )

  const guestProfiles = localProfiles.list().filter((p) => p.type === 'guest')

  const getEventTitle = (id: string) => eventTypes?.find((t) => t.id === id)?.title || id

  const handleCancel = (id: string) => {
    if (confirm('Отменить бронь?')) {
      localBookings.cancel(id)
      setRefreshKey((k) => k + 1)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-clay-900">Мои бронирования</h1>
        <Link to="/" className="text-sm text-clay-400 hover:text-warm-600 transition-colors">
          ← На главную
        </Link>
      </div>

      {profile && (
        <div className="mb-6">
          <label className="text-xs text-clay-400 uppercase tracking-wider block mb-2">Профиль</label>
          <div className="flex gap-2 flex-wrap">
            {guestProfiles.map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    p.id === currentProfileId
                      ? 'bg-warm-500 text-white'
                      : 'bg-clay-100 text-clay-600'
                  }`}
                >
                  {p.name}
                  {p.id === currentProfileId && ' ✓'}
                </span>
                {p.id === currentProfileId && (
                  <Link
                    to={`/profile/${p.id}`}
                    className="text-xs text-clay-400 hover:text-warm-600 transition-colors px-1"
                    title="Настройки профиля"
                  >
                    ✏️
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!bookings?.length ? (
        <Card className="text-center py-12">
          <p className="text-clay-500 mb-4">У вас пока нет бронирований</p>
          <Link to="/">
            <Button variant="secondary">Забронировать встречу</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-clay-900">{getEventTitle(booking.eventTypeId)}</h3>
                <p className="text-sm text-clay-500 mt-0.5">
                  {formatDate(booking.startDateTime, locale)}
                  {' · '}
                  {formatTime(booking.startDateTime, locale)}
                  {' — '}
                  {formatTime(booking.endDateTime, locale)}
                </p>
                <div className="mt-2"><StatusBadge status={booking.status} /></div>
              </div>
              {booking.status === 'confirmed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(booking.id)}
                >
                  Отменить
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
