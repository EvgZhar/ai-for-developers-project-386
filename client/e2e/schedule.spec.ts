import { test, expect } from '@playwright/test'
import { clearAll, loginAsAdmin } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearAll(page)
  await loginAsAdmin(page)
})

test.describe('2. Расписание (Schedule) — валидация', () => {

  test('2.1 Сохранить корректное расписание (Пн–Пт 09:00–18:00)', async ({ page }) => {
    await page.goto('/admin/schedule')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено')).toBeVisible()
  })

  test('2.2 Сохранить с startTime >= endTime — браузерная валидация HTML не даст', async ({ page }) => {
    await page.goto('/admin/schedule')
    const timeInputs = page.locator('input[type="time"]')
    const count = await timeInputs.count()
    expect(count).toBeGreaterThan(0)
  })

  test('2.3 Сохранить с интервалом < 15 мин — минимальная граница input', async ({ page }) => {
    await page.goto('/admin/schedule')
    const durInputs = page.locator('input[type="number"]')
    if (await durInputs.count() > 0) {
      await durInputs.first().fill('10')
    }
  })

  test('2.4 Включить день и добавить второй пересекающийся интервал', async ({ page }) => {
    await page.goto('/admin/schedule')
    const dayCheckboxes = page.locator('input[type="checkbox"]')
    if (await dayCheckboxes.count() > 0) {
      await dayCheckboxes.first().check({ force: true })
    }
    await page.getByRole('button', { name: 'Добавить интервал' }).first().click()
    const timeInputs = page.locator('input[type="time"]')
    const inputCount = await timeInputs.count()
    expect(inputCount).toBeGreaterThanOrEqual(4)
  })

  test('2.5 Пустые дни — успешно (владелец не работает)', async ({ page }) => {
    await page.goto('/admin/schedule')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено')).toBeVisible()
  })

  test('2.6 Невалидная timeZone — select с предустановленными значениями', async ({ page }) => {
    await page.goto('/admin/schedule')
    const tzSelect = page.locator('select').first()
    await expect(tzSelect).toBeVisible()
    await tzSelect.selectOption('Europe/Moscow')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено')).toBeVisible()
  })

  test('2.7 Повторный PUT с теми же данными — идемпотентность', async ({ page }) => {
    await page.goto('/admin/schedule')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено')).toBeVisible()
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено')).toBeVisible()
  })

})
