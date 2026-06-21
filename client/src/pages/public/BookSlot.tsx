import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { addDays, format, startOfDay, isSameDay, isBefore } from 'date-fns'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { getStoredLocale, getDayLabels, getMonthNames, formatShortDate } from '../../lib/dateUtils'

export function BookSlot() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()
  const today = startOfDay(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const locale = getStoredLocale()
  const dayLabels = getDayLabels(locale)
  const monthNames = getMonthNames(locale)

  const dateFrom = format(today, "yyyy-MM-dd'T'00:00:00'Z'")
  const dateTo = format(addDays(today, 14), "yyyy-MM-dd'T'23:59:59'Z'")

  const { data: type } = useQuery({
    queryKey: ['event-type', eventTypeId],
    queryFn: () => api.eventTypes.get(eventTypeId!),
    enabled: !!eventTypeId,
  })

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', eventTypeId, dateFrom, dateTo],
    queryFn: () => api.slots.getAvailable(eventTypeId!, dateFrom, dateTo),
    enabled: !!eventTypeId,
  })

  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  const daySlots = slots?.filter((s) => isSameDay(new Date(s.startDateTime), selectedDate)) || []

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button onClick={() => navigate('/')} className="text-sm text-clay-400 hover:text-warm-600 transition-colors mb-4 flex items-center gap-1">
          ← Назад
        </button>
        <h1 className="text-2xl font-bold text-clay-900">{type?.title || 'Загрузка...'}</h1>
        <p className="text-clay-500 mt-1">{type?.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-sm font-semibold text-clay-700 mb-4 uppercase tracking-wider">Дата</h2>
          <div className="grid grid-cols-7 gap-1">
            {dayLabels.map((d) => (
              <div key={d} className="text-center text-xs text-clay-400 font-medium py-1">{d}</div>
            ))}
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate)
              const isPast = isBefore(day, today) && !isSameDay(day, today)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPast && setSelectedDate(day)}
                  disabled={isPast}
                  className={`text-center py-2 rounded-lg text-sm transition-colors
                    ${isSelected ? 'bg-warm-500 text-white font-semibold shadow-sm' : ''}
                    ${!isSelected && !isPast ? 'hover:bg-warm-100 text-clay-700' : ''}
                    ${isPast ? 'text-clay-300 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
          <div className="mt-3 text-center text-xs text-clay-400">
            {monthNames[selectedDate.getMonth()]} {format(selectedDate, 'yyyy')}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-clay-700 mb-4 uppercase tracking-wider">
            Время — {formatShortDate(selectedDate, locale)}
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-3 border-warm-300 border-t-warm-600 rounded-full" />
            </div>
          ) : daySlots.length === 0 ? (
            <p className="text-clay-400 text-sm py-8 text-center">Нет доступных слотов на этот день</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {daySlots.map((slot) => (
                <button
                  key={slot.startDateTime}
                  onClick={() =>
                    navigate(`/book/${eventTypeId}/info`, {
                      state: { slot, eventType: type },
                    })
                  }
                  className="w-full text-left px-4 py-3 rounded-lg border border-clay-200 hover:border-warm-300 hover:bg-warm-50 transition-all text-sm text-clay-700 cursor-pointer"
                >
                  {format(new Date(slot.startDateTime), 'HH:mm')} — {format(new Date(slot.endDateTime), 'HH:mm')}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
