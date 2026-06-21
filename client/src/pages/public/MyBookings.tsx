import { useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatusBadge } from '../../components/StatusBadge'
import { getStoredLocale, formatDate, formatTime } from '../../lib/dateUtils'

export function MyBookings() {
  const [searchParams] = useSearchParams()
  const guestProfileId = searchParams.get('guestProfileId')
  const locale = getStoredLocale()
  const queryClient = useQueryClient()

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  })

  const guestProfiles = profiles?.filter((p) => p.type === 'guest') || []
  const selectedProfileId = guestProfileId || guestProfiles[0]?.id || ''

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['guest-bookings', selectedProfileId],
    queryFn: () => api.bookings.listByGuest(selectedProfileId),
    enabled: !!selectedProfileId,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.bookings.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] })
    },
  })

  const { data: eventTypes } = useQuery({
    queryKey: ['event-types'],
    queryFn: api.eventTypes.list,
  })

  const getEventTitle = (id: string) => eventTypes?.find((t) => t.id === id)?.title || id

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-clay-900">Мои бронирования</h1>
        <Link to="/" className="text-sm text-clay-400 hover:text-warm-600 transition-colors">
          ← На главную
        </Link>
      </div>

      {selectedProfileId && (
        <div className="mb-6">
          <label className="text-xs text-clay-400 uppercase tracking-wider block mb-2">Профиль</label>
          <div className="flex gap-2 flex-wrap">
            {guestProfiles.map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <Link
                  to={`/bookings?guestProfileId=${p.id}`}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    p.id === selectedProfileId
                      ? 'bg-warm-500 text-white'
                      : 'bg-clay-100 text-clay-600 hover:bg-clay-200'
                  }`}
                >
                  {p.name}
                </Link>
                <Link
                  to={`/profile/${p.id}`}
                  className="text-xs text-clay-400 hover:text-warm-600 transition-colors px-1"
                  title="Настройки профиля"
                >
                  ✏️
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-warm-300 border-t-warm-600 rounded-full" />
        </div>
      ) : !bookings?.length ? (
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
                  loading={cancelMutation.isPending}
                  onClick={() => {
                    if (confirm('Отменить бронь?')) {
                      cancelMutation.mutate(booking.id)
                    }
                  }}
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
