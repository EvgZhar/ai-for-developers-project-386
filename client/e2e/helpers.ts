import type { Page } from '@playwright/test'

const ADMIN_PROFILE = {
  id: 'admin',
  name: 'Владелец',
  type: 'admin',
  locale: 'ru-RU',
  timeZone: 'Europe/Moscow',
}

const CURRENT_PROFILE_KEY = 'calbook-current-profile-id'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function seedProfiles(page: Page, profiles: object[]) {
  await page.evaluate((data) => {
    localStorage.setItem('calbook-profiles', JSON.stringify(data))
  }, [ADMIN_PROFILE, ...profiles])
}

export async function seedEventTypes(page: Page, types: object[]) {
  await page.evaluate((data) => {
    localStorage.setItem('calbook-event-types', JSON.stringify(data))
  }, types)
}

export async function seedBookings(page: Page, bookings: object[]) {
  await page.evaluate((data) => {
    localStorage.setItem('calbook-bookings', JSON.stringify(data))
  }, bookings)
}

export async function seedSchedule(page: Page, schedule: object) {
  await page.evaluate((data) => {
    localStorage.setItem('calbook-schedule', JSON.stringify(data))
  }, schedule)
}

export async function loginAs(page: Page, profileId: string) {
  await page.evaluate((id) => {
    localStorage.setItem('calbook-current-profile-id', id)
  }, profileId)
  await page.goto('/')
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, 'admin')
}

export async function clearAll(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
  })
}

export function makeBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: generateId(),
    eventTypeId: '',
    startDateTime: new Date(Date.now() + 86400000).toISOString(),
    endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    agenda: '',
    guestProfileId: 'guest-1',
    guestName: 'Тестовый Гость',
    status: 'requested',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}
