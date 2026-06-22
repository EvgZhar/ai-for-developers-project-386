import { addDays, addMinutes, startOfDay } from 'date-fns'
import { localSchedule } from './schedule'
import { localEventTypes } from './eventTypes'
import { localBookings } from './bookings'
import type { AvailableSlot } from '../api/types'

export const localSlots = {
  getAvailable(eventTypeId: string, dateFrom: string, dateTo: string): AvailableSlot[] {
    const eventType = localEventTypes.get(eventTypeId)
    if (!eventType) return []

    const schedule = localSchedule.get()
    const from = startOfDay(new Date(dateFrom))
    const to = new Date(dateTo)
    const slots: AvailableSlot[] = []

    let current = from
    while (current <= to) {
      const dayOfWeek = (current.getDay() + 6) % 7 + 1
      const daySchedule = schedule.days.find((d) => d.dayOfWeek === dayOfWeek)

      if (daySchedule) {
        for (const interval of daySchedule.intervals) {
          const [startH, startM] = interval.startTime.split(':').map(Number)
          const [endH, endM] = interval.endTime.split(':').map(Number)

          const dayStart = new Date(current)
          dayStart.setHours(startH, startM, 0, 0)

          const dayEnd = new Date(current)
          dayEnd.setHours(endH, endM, 0, 0)

          let slotStart = new Date(dayStart)
          while (addMinutes(slotStart, eventType.durationMinutes) <= dayEnd) {
            const slotEnd = addMinutes(slotStart, eventType.durationMinutes)
            const startISO = slotStart.toISOString()
            const endISO = slotEnd.toISOString()

            if (!localBookings.hasConflict(eventTypeId, startISO)) {
              slots.push({
                startDateTime: startISO,
                endDateTime: endISO,
              })
            }

            slotStart = slotEnd
          }
        }
      }

      current = addDays(current, 1)
    }

    return slots
  },
}
