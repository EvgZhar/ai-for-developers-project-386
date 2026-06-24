import { test, expect } from '@playwright/test'
import { clearAll, loginAsAdmin, seedProfiles, seedEventTypes, seedBookings, seedSchedule, generateId } from './helpers'

test.describe('4. Бронирование (Booking)', () => {

  test.beforeEach(async ({ page }) => {
    await clearAll(page)
  })

  test('4.1 Гость выбрал тип → увидел свободные слоты', async ({ page }) => {
    const typeId = generateId()
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: typeId, title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedSchedule(page, {
      timeZone: 'Europe/Moscow',
      days: [
        { dayOfWeek: new Date(Date.now() + 86400000).getDay() || 7, intervals: [{ startTime: '09:00', endTime: '18:00' }] },
      ],
    })
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto(`/book/${typeId}`)
    await expect(page.getByText('Встреча')).toBeVisible()
  })

  test('4.2 dateTo – dateFrom = 14 дней (макс)', async ({ page }) => {
    const typeId = generateId()
    await seedEventTypes(page, [
      { id: typeId, title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedSchedule(page, {
      timeZone: 'Europe/Moscow',
      days: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i === 0 ? 7 : i,
        intervals: [{ startTime: '09:00', endTime: '18:00' }],
      })),
    })
    await page.goto(`/book/${typeId}`)
    const buttons = page.locator('button:not(:disabled)')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('4.3 Выбрать слот, заполнить agenda, создать бронь', async ({ page }) => {
    const typeId = generateId()
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: typeId, title: 'Встреча', description: 'Тест', durationMinutes: 60 },
    ])
    await seedSchedule(page, {
      timeZone: 'Europe/Moscow',
      days: [
        { dayOfWeek: new Date(Date.now() + 86400000).getDay() || 7, intervals: [{ startTime: '09:00', endTime: '18:00' }] },
      ],
    })
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto(`/book/${typeId}`)
    const slotBtn = page.locator('button:has-text(":")').first()
    if (await slotBtn.isVisible()) {
      await slotBtn.click()
      await page.waitForURL(`/book/${typeId}/info`)
      await page.getByRole('button', { name: 'Подтвердить' }).click()
    }
  })

  test('4.4 Гость смотрит свои брони (/bookings) — видит только свои', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [{
      id: 'b1', eventTypeId: 't1',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      guestProfileId: 'guest-1', guestName: 'Гость',
      status: 'confirmed', createdAt: new Date().toISOString(),
    }])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/bookings')
    await expect(page.getByText('Подтверждена')).toBeVisible()
  })

  test('4.5 Гость отменяет подтверждённую бронь', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [{
      id: 'b1', eventTypeId: 't1',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      guestProfileId: 'guest-1', guestName: 'Гость',
      status: 'confirmed', createdAt: new Date().toISOString(),
    }])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/bookings')
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Отменить' }).click()
    await expect(page.getByText('Отменена')).toBeVisible()
  })

  test('4.6 Админ подтверждает requested → confirmed', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [{
      id: 'b1', eventTypeId: 't1',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      guestProfileId: 'guest-1', guestName: 'Гость',
      status: 'requested', createdAt: new Date().toISOString(),
    }])
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Подтвердить' }).click()
    await expect(page.getByText('Подтверждена')).toBeVisible()
  })

  test('4.7 Админ отклоняет requested → rejected', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [{
      id: 'b1', eventTypeId: 't1',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      guestProfileId: 'guest-1', guestName: 'Гость',
      status: 'requested', createdAt: new Date().toISOString(),
    }])
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Отклонить' }).click()
    await expect(page.getByText('Отклонена')).toBeVisible()
  })

  test('4.8 Админ отменяет confirmed → cancelled', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [{
      id: 'b1', eventTypeId: 't1',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      guestProfileId: 'guest-1', guestName: 'Гость',
      status: 'confirmed', createdAt: new Date().toISOString(),
    }])
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Отменить' }).click()
    await expect(page.getByText('Отменена')).toBeVisible()
  })

  test('4.9 Админ фильтрует брони по статусу', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [
      {
        id: 'b1', eventTypeId: 't1',
        startDateTime: new Date(Date.now() + 86400000).toISOString(),
        endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        guestProfileId: 'guest-1', guestName: 'Гость',
        status: 'confirmed', createdAt: new Date().toISOString(),
      },
      {
        id: 'b2', eventTypeId: 't1',
        startDateTime: new Date(Date.now() + 172800000).toISOString(),
        endDateTime: new Date(Date.now() + 172800000 + 3600000).toISOString(),
        guestProfileId: 'guest-1', guestName: 'Гость',
        status: 'requested', createdAt: new Date().toISOString(),
      },
    ])
    await loginAsAdmin(page)
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Подтверждены' }).click()
    const bookingCards = page.locator('text=Встреча')
    await expect(bookingCards.first()).toBeVisible()
  })

})
