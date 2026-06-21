import { useLocation, Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatusBadge } from '../../components/StatusBadge'
import { getStoredLocale, formatDate, formatTime } from '../../lib/dateUtils'
import type { Booking, EventType, Profile } from '../../api/types'

interface LocationState {
  booking: Booking
  eventType: EventType
  profile: Profile
}

export function BookingConfirmation() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const locale = getStoredLocale()

  if (!state) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-clay-500 mb-4">Бронь не найдена</p>
        <Link to="/">
          <Button variant="secondary">На главную</Button>
        </Link>
      </div>
    )
  }

  const { booking, eventType } = state

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <Card className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-clay-900 mb-2">Бронь создана!</h1>
        <p className="text-clay-500 mb-6">Детали встречи отправлены</p>

        <div className="text-left space-y-3 p-4 bg-warm-50 rounded-lg mb-6">
          <div>
            <span className="text-xs text-clay-400 uppercase tracking-wider">Тип</span>
            <p className="text-sm font-medium text-clay-800">{eventType.title}</p>
          </div>
          <div>
            <span className="text-xs text-clay-400 uppercase tracking-wider">Дата и время</span>
            <p className="text-sm font-medium text-clay-800">
              {formatDate(booking.startDateTime, locale)}
              {' '}· {formatTime(booking.startDateTime, locale)}
            </p>
          </div>
          <div>
            <span className="text-xs text-clay-400 uppercase tracking-wider">Статус</span>
            <div className="mt-1"><StatusBadge status={booking.status} /></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to={`/bookings?guestProfileId=${booking.guestProfileId}`}>
            <Button variant="secondary" className="w-full">Мои бронирования</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full">На главную</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
