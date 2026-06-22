import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatusBadge } from '../../components/StatusBadge'
import { getStoredLocale, formatDate, formatTime } from '../../lib/dateUtils'
import { localProfiles } from '../../lib/auth'
import { localEventTypes } from '../../lib/eventTypes'
import { localBookings } from '../../lib/bookings'
import type { BookingStatus, Booking } from '../../api/types'

export function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const locale = getStoredLocale()
  const [refreshKey, setRefreshKey] = useState(0)

  const eventTypes = localEventTypes.list()
  const profiles = localProfiles.list()
  const bookings: Booking[] = localBookings.listByStatus(statusFilter)

  const getEventTitle = (id: string) => eventTypes?.find((t) => t.id === id)?.title || id
  const getGuestInfo = (id: string) => profiles?.find((p) => p.id === id)

  const handleConfirm = (id: string) => {
    localBookings.confirm(id)
    setRefreshKey((k) => k + 1)
  }

  const handleReject = (id: string) => {
    localBookings.reject(id)
    setRefreshKey((k) => k + 1)
  }

  const handleCancel = (id: string) => {
    localBookings.cancel(id)
    setRefreshKey((k) => k + 1)
  }

  const filterTabs: { label: string; value: BookingStatus | '' }[] = [
    { label: 'Все', value: '' },
    { label: 'Ожидают', value: 'requested' },
    { label: 'Подтверждены', value: 'confirmed' },
    { label: 'Отменены', value: 'cancelled' },
    { label: 'Отклонены', value: 'rejected' },
  ]

  return (
    <div key={refreshKey}>
      <h1 className="text-2xl font-bold text-clay-900 mb-6">Бронирования</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-warm-500 text-white'
                : 'bg-white text-clay-600 border border-clay-200 hover:bg-warm-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!bookings?.length ? (
        <Card className="text-center py-12">
          <p className="text-clay-500">Нет бронирований</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const guest = getGuestInfo(booking.guestProfileId)
            return (
            <Card key={booking.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-clay-900">{booking.guestName}</h3>
                    <span className="text-xs text-clay-400">·</span>
                    <span className="text-sm text-warm-600">{getEventTitle(booking.eventTypeId)}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-sm text-clay-500">
                    {formatDate(booking.startDateTime, locale)}
                    {' · '}
                    {formatTime(booking.startDateTime, locale)}
                    {' — '}
                    {formatTime(booking.endDateTime, locale)}
                  </p>
                  {guest && (
                    <p className="text-xs text-clay-400 mt-0.5">
                      {guest.timeZone} · {guest.locale}
                    </p>
                  )}
                  {booking.agenda && (
                    <p className="text-sm text-clay-400 mt-1 italic">{booking.agenda}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {booking.status === 'requested' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleConfirm(booking.id)}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(booking.id)}
                      >
                        Отклонить
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Отменить
                    </Button>
                  )}
                </div>
              </div>
            </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
