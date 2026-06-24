import { test, expect } from '@playwright/test'
import { clearAll, loginAsAdmin, seedEventTypes, generateId } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearAll(page)
  await loginAsAdmin(page)
})

test.describe('3. Типы событий (Event Types)', () => {

  test('3.1 Создать тип события', async ({ page }) => {
    await page.goto('/admin/event-types')
    await page.getByRole('button', { name: '+ Создать' }).click()
    await page.locator('input[type="text"]').fill('Консультация')
    await page.locator('textarea').fill('Часовая консультация')
    await page.locator('input[type="number"]').fill('60')
    await page.getByRole('button', { name: 'Создать', exact: true }).click()
    await expect(page.getByText('Консультация').first()).toBeVisible()
    await expect(page.getByText('60 мин').first()).toBeVisible()
  })

  test('3.2 Создать с duration < 15 — минимальное значение 15', async ({ page }) => {
    await page.goto('/admin/event-types')
    await page.getByRole('button', { name: '+ Создать' }).click()
    await page.locator('input[type="text"]').fill('Короткая')
    await page.locator('textarea').fill('Тест')
    await page.locator('input[type="number"]').fill('5')
    await page.getByRole('button', { name: 'Создать', exact: true }).click()
    const saved = await page.evaluate(() => {
      const data = localStorage.getItem('calbook-event-types')
      if (!data) return null
      return JSON.parse(data)
    })
    expect(saved).not.toBeNull()
    if (saved) expect(saved[0].durationMinutes).toBeGreaterThanOrEqual(15)
  })

  test('3.3 Создать с пустым title — форма не отправляется (HTML5 validation)', async ({ page }) => {
    await page.goto('/admin/event-types')
    await page.getByRole('button', { name: '+ Создать' }).click()
    await page.getByRole('button', { name: 'Создать', exact: true }).click()
    await expect(page.getByText('Новый тип события')).toBeVisible()
  })

  test('3.4 Редактировать тип события', async ({ page }) => {
    const typeId = generateId()
    await seedEventTypes(page, [
      { id: typeId, title: 'Старое', description: 'Описание', durationMinutes: 30 },
    ])
    await page.goto('/admin/event-types')
    await page.getByRole('button', { name: '✏️' }).click()
    await page.locator('input[type="text"]').fill('Новое')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Новое')).toBeVisible()
    await expect(page.getByText('Старое')).not.toBeVisible()
  })

  test('3.5 Удалить тип события', async ({ page }) => {
    const typeId = generateId()
    await seedEventTypes(page, [
      { id: typeId, title: 'Удаляемый', description: 'Будет удалён', durationMinutes: 30 },
    ])
    await page.goto('/admin/event-types')
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: '🗑️' }).click()
    await expect(page.getByText('Удаляемый')).not.toBeVisible()
  })

  test('3.6 Удалить тип, на который есть брони — удаление не блокируется', async ({ page }) => {
    const typeId = generateId()
    await seedEventTypes(page, [
      { id: typeId, title: 'С бронями', description: 'Есть брони', durationMinutes: 30 },
    ])
    await page.evaluate((tid) => {
      const bookings = [{
        id: 'b1', eventTypeId: tid,
        startDateTime: new Date(Date.now() + 86400000).toISOString(),
        endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        guestProfileId: 'guest-1', guestName: 'Гость',
        status: 'confirmed', createdAt: new Date().toISOString(),
      }]
      localStorage.setItem('calbook-bookings', JSON.stringify(bookings))
    }, typeId)
    await page.goto('/admin/event-types')
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: '🗑️' }).click()
    await expect(page.getByText('С бронями')).not.toBeVisible()
  })

})
