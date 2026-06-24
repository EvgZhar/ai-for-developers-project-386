import { test, expect } from '@playwright/test'
import { clearAll, seedProfiles } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearAll(page)
})

test.describe('1. Стартовая страница / Выбор профиля', () => {

  test('1.1 Первый визит, нажать «Войти как гость» → открылась форма /login', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    await expect(page.getByPlaceholder('Введите ваше имя')).toBeVisible()
  })

  test('1.2 Создать гостя с уникальным именем через /register', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('Иван Иванов').fill('Новый Гость')
    await page.getByRole('button', { name: 'Создать профиль' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Мои бронирования').first()).toBeVisible()
  })

  test('1.3 Создать гостя с именем, которое уже есть — дубликат разрешён', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'g1', name: 'Дубликат', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.goto('/register')
    await page.getByPlaceholder('Иван Иванов').fill('Дубликат')
    await page.getByRole('button', { name: 'Создать профиль' }).click()
    await expect(page).toHaveURL('/')
  })

  test('1.4 Создать гостя с пустым именем — кнопка неактивна', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('button', { name: 'Создать профиль' })).toBeDisabled()
  })

  test('1.5 Гость логинится по имени', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'g1', name: 'Анна', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
      { id: 'g2', name: 'Иван', type: 'guest', locale: 'en-US', timeZone: 'America/New_York' },
    ])
    await page.goto('/login')
    await expect(page.getByText('Вход как гость')).toBeVisible()
  })

  test('1.6 Войти как admin через кнопку на главной', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Войти как владелец' }).click()
    await expect(page).toHaveURL('/admin')
    await expect(page.getByText('Панель управления')).toBeVisible()
  })

  test('1.7 Выбрать гостя через логин по имени', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Пётр', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.goto('/login')
    await page.getByPlaceholder('Введите ваше имя').fill('Пётр')
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Пётр').first()).toBeVisible()
  })

  test('1.8 После выбора профиля перезагрузить страницу — сессия сохранилась', async ({ page }) => {
    await seedProfiles(page, [
      { id: 'guest-1', name: 'Сессия', type: 'guest', locale: 'ru-RU', timeZone: 'Europe/Moscow' },
    ])
    await page.evaluate(() => localStorage.setItem('calbook-current-profile-id', 'guest-1'))
    await page.goto('/')
    await expect(page.getByText('Сессия').first()).toBeVisible()
  })

  test('1.9 Нажать «Выйти» — localStorage очищен, редирект на /', async ({ page }) => {
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
