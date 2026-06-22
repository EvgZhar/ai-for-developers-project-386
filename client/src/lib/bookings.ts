import { addMinutes, isWithinInterval } from 'date-fns'
import type { Booking, BookingCreate, BookingStatus } from '../api/types'
import { localProfiles } from './profiles'
import { localEventTypes } from './eventTypes'

const KEY = 'calbook-bookings'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getStored(): Booking[] {
  try {
    const data = localStorage.getItem(KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch {
    return []
  }
}

function save(items: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export const localBookings = {
  list: getStored,

  listByStatus(status?: BookingStatus | ''): Booking[] {
    const items = getStored()
    if (!status) return items
    return items.filter((b) => b.status === status)
  },

  listByGuest(guestProfileId: string): Booking[] {
    return getStored().filter((b) => b.guestProfileId === guestProfileId)
  },

  get(id: string): Booking | undefined {
    return getStored().find((b) => b.id === id)
  },

  create(body: BookingCreate): Booking {
    const profile = localProfiles.get(body.guestProfileId)
    const eventType = localEventTypes.get(body.eventTypeId)
    const duration = eventType?.durationMinutes || 60
    const start = new Date(body.startDateTime)
    const end = addMinutes(start, duration)

    const booking: Booking = {
      id: generateId(),
      eventTypeId: body.eventTypeId,
      startDateTime: body.startDateTime,
      endDateTime: end.toISOString(),
      agenda: body.agenda,
      guestProfileId: body.guestProfileId,
      guestName: profile?.name || 'Гость',
      status: 'requested',
      createdAt: new Date().toISOString(),
    }

    const items = getStored()
    items.push(booking)
    save(items)
    return booking
  },

  confirm(id: string): Booking | undefined {
    const items = getStored()
    const idx = items.findIndex((b) => b.id === id)
    if (idx === -1) return undefined
    items[idx].status = 'confirmed'
    save(items)
    return items[idx]
  },

  reject(id: string): Booking | undefined {
    const items = getStored()
    const idx = items.findIndex((b) => b.id === id)
    if (idx === -1) return undefined
    items[idx].status = 'rejected'
    save(items)
    return items[idx]
  },

  cancel(id: string): Booking | undefined {
    const items = getStored()
    const idx = items.findIndex((b) => b.id === id)
    if (idx === -1) return undefined
    items[idx].status = 'cancelled'
    items[idx].cancelledAt = new Date().toISOString()
    save(items)
    return items[idx]
  },

  hasConflict(eventTypeId: string, startDateTime: string): boolean {
    const eventType = localEventTypes.get(eventTypeId)
    if (!eventType) return true
    const start = new Date(startDateTime)
    const end = addMinutes(start, eventType.durationMinutes)

    return getStored().some((b) => {
      if (b.status === 'cancelled' || b.status === 'rejected') return false
      const bStart = new Date(b.startDateTime)
      const bEnd = new Date(b.endDateTime)
      return isWithinInterval(start, { start: bStart, end: bEnd }) ||
             isWithinInterval(end, { start: bStart, end: bEnd }) ||
             (bStart >= start && bEnd <= end)
    })
  },
}
