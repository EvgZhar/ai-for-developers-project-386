import type { Profile } from '../api/types'

export const PROFILES_KEY = 'calbook-profiles'

const ADMIN_PROFILE: Profile = {
  id: 'admin',
  name: 'Владелец',
  type: 'admin',
  locale: 'ru-RU',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getStoredProfiles(): Profile[] {
  try {
    const data = localStorage.getItem(PROFILES_KEY)
    if (!data) {
      const profiles = [ADMIN_PROFILE]
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
      return profiles
    }
    return JSON.parse(data)
  } catch {
    return [ADMIN_PROFILE]
  }
}

function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export const localProfiles = {
  list: getStoredProfiles,

  get(id: string): Profile | undefined {
    return getStoredProfiles().find((p) => p.id === id)
  },

  create(data: { name: string; locale: string; timeZone: string }): Profile {
    const profiles = getStoredProfiles()
    const profile: Profile = {
      id: generateId(),
      name: data.name,
      type: 'guest',
      locale: data.locale,
      timeZone: data.timeZone,
    }
    profiles.push(profile)
    saveProfiles(profiles)
    return profile
  },

  update(id: string, data: { name: string; locale: string; timeZone: string }): Profile | undefined {
    const profiles = getStoredProfiles()
    const idx = profiles.findIndex((p) => p.id === id)
    if (idx === -1) return undefined
    profiles[idx] = { ...profiles[idx], ...data }
    saveProfiles(profiles)
    return profiles[idx]
  },

  delete(id: string): boolean {
    const profiles = getStoredProfiles()
    const idx = profiles.findIndex((p) => p.id === id)
    if (idx === -1) return false
    profiles.splice(idx, 1)
    saveProfiles(profiles)
    return true
  },
}
