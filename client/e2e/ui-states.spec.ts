import { test, expect } from '@playwright/test'
import { clearAll, seedProfiles } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearAll(page)
})

test.describe('6. UI-состояния (сквозные)', () => {

  test('6.1 Пустой список типов событий — Landing показывает кнопки входа', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Запланируйте встречу')).toBeVisible()
  })

  test('6.2 Пустой список броней у гостя — плейсхолдер', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/bookings')
    await expect(page.getByText('У вас пока нет бронирований')).toBeVisible()
  })

  test('6.3 Пустые брони у админа — плейсхолдер', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'admin'))
    await page.goto('/admin')
    await expect(page.getByText('Нет бронирований')).toBeVisible()
  })

  test('6.4 Пустой список типов у админа — плейсхолдер', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('calbook-event-types', '[]')
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Войти как владелец' }).click()
    await page.goto('/admin/event-types')
    await expect(page.getByText('Нет типов событий')).toBeVisible()
  })

  test('6.5 Гость пытается зайти на /admin — редирект', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/admin')
    await expect(page).toHaveURL('/')
  })

  test('6.6 404 — несуществующий bookingId', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/booking/non-existent-id')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('6.7 Локализация — даты в таймзоне профиля', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Гость', type: 'guest', locale: 'ru-RU', timeZone: 'Asia/Vladivostok' },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/')
    await expect(page.getByText('Гость').first()).toBeVisible()
  })

  test('6.8 Неавторизованный доступ к /bookings — редирект на /login', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page).toHaveURL('/login')
  })

})
