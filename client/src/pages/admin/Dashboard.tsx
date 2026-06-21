import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatusBadge } from '../../components/StatusBadge'
import { getStoredLocale, formatDate, formatTime } from '../../lib/dateUtils'
import type { BookingStatus } from '../../api/types'

export function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const queryClient = useQueryClient()
  const locale = getStoredLocale()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: () => api.admin.bookings.list(statusFilter ? { status: statusFilter } : undefined),
  })

  const { data: eventTypes } = useQuery({
    queryKey: ['event-types'],
    queryFn: api.eventTypes.list,
  })

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  })

  const getEventTitle = (id: string) => eventTypes?.find((t) => t.id === id)?.title || id

  const getGuestInfo = (id: string) => profiles?.find((p) => p.id === id)

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.admin.bookings.confirm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.admin.bookings.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.admin.bookings.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }),
  })

  const filterTabs: { label: string; value: BookingStatus | '' }[] = [
    { label: 'Все', value: '' },
    { label: 'Ожидают', value: 'requested' },
    { label: 'Подтверждены', value: 'confirmed' },
    { label: 'Отменены', value: 'cancelled' },
    { label: 'Отклонены', value: 'rejected' },
  ]

  return (
    <div>
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-warm-300 border-t-warm-600 rounded-full" />
        </div>
      ) : !bookings?.length ? (
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
                        loading={confirmMutation.isPending}
                        onClick={() => confirmMutation.mutate(booking.id)}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(booking.id)}
                      >
                        Отклонить
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(booking.id)}
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
