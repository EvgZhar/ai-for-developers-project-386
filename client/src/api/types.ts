export type ProfileType = 'admin' | 'guest'

export type BookingStatus = 'requested' | 'confirmed' | 'rejected' | 'cancelled'

export interface Profile {
  id: string
  name: string
  type: ProfileType
  locale: string
  timeZone: string
}

export interface ProfileCreate {
  name: string
  locale: string
  timeZone: string
}

export interface TimeInterval {
  startTime: string
  endTime: string
}

export interface DaySchedule {
  dayOfWeek: number
  intervals: TimeInterval[]
}

export interface Schedule {
  timeZone: string
  days: DaySchedule[]
}

export interface EventType {
  id: string
  title: string
  description: string
  durationMinutes: number
}

export interface EventTypeUpdate {
  title?: string
  description?: string
  durationMinutes?: number
}

export interface EventTypeCreate {
  title: string
  description: string
  durationMinutes: number
}



export interface AvailableSlot {
  startDateTime: string
  endDateTime: string
}

export interface Booking {
  id: string
  eventTypeId: string
  startDateTime: string
  endDateTime: string
  agenda?: string
  guestProfileId: string
  guestName: string
  status: BookingStatus
  createdAt: string
  cancelledAt?: string
}

export interface BookingCreate {
  eventTypeId: string
  startDateTime: string
  agenda?: string
  guestProfileId: string
}
