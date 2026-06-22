import type { Schedule, DaySchedule } from '../api/types'

const KEY = 'calbook-schedule'

function defaultSchedule(): Schedule {
  const days: DaySchedule[] = Array.from({ length: 5 }, (_, i) => ({
    dayOfWeek: i + 1,
    intervals: [{ startTime: '09:00', endTime: '18:00' }],
  }))
  return { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, days }
}

function getStored(): Schedule {
  try {
    const data = localStorage.getItem(KEY)
    if (!data) {
      const s = defaultSchedule()
      localStorage.setItem(KEY, JSON.stringify(s))
      return s
    }
    return JSON.parse(data)
  } catch {
    return defaultSchedule()
  }
}

function save(s: Schedule) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export const localSchedule = {
  get: getStored,

  update(s: Schedule): Schedule {
    save(s)
    return s
  },
}
