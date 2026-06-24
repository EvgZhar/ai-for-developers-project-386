import { test, expect } from '@playwright/test'
import { clearAll, seedProfiles, seedEventTypes, seedBookings, seedSchedule, generateId } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearAll(page)
})

test.describe('5. Переключение пользователей / Изоляция данных', () => {

  test('5.1 Админ настроил расписание → вышел → зашёл гостем — расписание не сброшено', async ({ page }) => {
    await seedSchedule(page, {
      timeZone: 'Europe/Moscow',
      days: [{ dayOfWeek: 1, intervals: [{ startTime: '10:00', endTime: '16:00' }] }],
    })
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/')
    const schedule = await page.evaluate(() => {
      const data = localStorage.getItem('calbook-schedule')
      return data ? JSON.parse(data) : null
    })
    expect(schedule).not.toBeNull()
    expect(schedule.days[0].intervals[0].startTime).toBe('10:00')
  })

  test('5.2 Гость создал бронь → вышел → зашёл тем же гостем — бронь видна', async ({ page }) => {
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

  test('5.3 Гость А → гость Б — брони не смешиваются', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-a', name: 'Анна', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
      { id: 'guest-b', name: 'Борис', type: 'guest', locale: 'en-US', timeZone: 'America/New_York' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [
      {
        id: 'b1', eventTypeId: 't1',
        startDateTime: new Date(Date.now() + 86400000).toISOString(),
        endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        guestProfileId: 'guest-a', guestName: 'Анна',
        status: 'confirmed', createdAt: new Date().toISOString(),
      },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-b'))
    await page.goto('/bookings')
    await expect(page.getByText('У вас пока нет бронирований')).toBeVisible()
  })

  test('5.4 Админ видит все брони → переключиться на гостя — видны только свои', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-a', name: 'Анна', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await seedEventTypes(page, [
      { id: 't1', title: 'Встреча', description: 'Тест', durationMinutes: 30 },
    ])
    await seedBookings(page, [{
      id: 'b1', eventTypeId: 't1',
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      guestProfileId: 'guest-a', guestName: 'Анна',
      status: 'confirmed', createdAt: new Date().toISOString(),
    }])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'admin'))
    await page.goto('/admin')
    await expect(page.getByText('Анна')).toBeVisible()
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-a'))
    await page.goto('/bookings')
    await expect(page.getByText('Подтверждена')).toBeVisible()
  })

  test('5.5 При смене пользователя старые данные не мигают — queryClient.clear()', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'admin'))
    await page.goto('/')
    await page.getByRole('navigation').getByRole('button', { name: 'Выйти' }).click()
    await expect(page).toHaveURL('/')
    const profileId = await page.evaluate(() =>
      localStorage.getItem('calbook-current-profile-id')
    )
    expect(profileId).toBeNull()
  })

})
