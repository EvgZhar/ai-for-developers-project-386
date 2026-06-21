export function getStoredLocale(): string {
  return localStorage.getItem('userLocale') || 'ru-RU'
}

export function setStoredLocale(locale: string) {
  localStorage.setItem('userLocale', locale)
}

export function getWeekStartDay(locale: string): number {
  try {
    const region = new Intl.Locale(locale).region || 'RU'
    const regionLocale = new Intl.Locale('en-' + region)
    const formatter = new Intl.DateTimeFormat(regionLocale.toString(), { weekday: 'long' })
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2026, 0, 4 + i)
      return formatter.format(d)
    })
    return days.indexOf('Monday') !== -1 ? days.indexOf('Monday') : 1
  } catch {
    return 1
  }
}

export function getDayLabels(locale: string): string[] {
  const start = getWeekStartDay(locale)
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 0, 4 + i)
    return formatter.format(d).slice(0, 2)
  })
  return [...days.slice(start), ...days.slice(0, start)]
}

export function getDayNames(locale: string): string[] {
  const start = getWeekStartDay(locale)
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 0, 4 + i)
    return formatter.format(d).replace(/^./, (c) => c.toUpperCase())
  })
  return [...days.slice(start), ...days.slice(0, start)]
}

export function getMonthNames(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1)
    return formatter.format(d).replace(/^./, (c) => c.toUpperCase())
  })
}

export function formatDate(date: string | Date, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(date: string | Date, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })
}
