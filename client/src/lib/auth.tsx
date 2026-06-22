import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Profile } from '../api/types'
import { localProfiles, PROFILES_KEY } from './profiles'
export { localProfiles }

const CURRENT_PROFILE_KEY = 'calbook-current-profile-id'

function getCurrentProfileId(): string | null {
  return localStorage.getItem(CURRENT_PROFILE_KEY)
}

function setCurrentProfileId(id: string | null) {
  if (id) {
    localStorage.setItem(CURRENT_PROFILE_KEY, id)
  } else {
    localStorage.removeItem(CURRENT_PROFILE_KEY)
  }
}

interface AuthContextType {
  profile: Profile | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (profileId: string) => void
  loginAsGuest: (name: string) => Profile | null
  loginAsAdmin: () => void
  logout: () => void
  register: (name: string, locale: string, timeZone: string) => Profile
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const id = getCurrentProfileId()
    if (!id) return null
    return localProfiles.get(id) || null
  })

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CURRENT_PROFILE_KEY || e.key === PROFILES_KEY) {
        const id = getCurrentProfileId()
        setProfile(id ? localProfiles.get(id) || null : null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = (profileId: string) => {
    setCurrentProfileId(profileId)
    setProfile(localProfiles.get(profileId) || null)
  }

  const loginAsGuest = (name: string): Profile | null => {
    const profiles = localProfiles.list()
    const guest = profiles.find((p) => p.type === 'guest' && p.name === name)
    if (!guest) return null
    login(guest.id)
    return guest
  }

  const loginAsAdmin = () => {
    const admin = localProfiles.get('admin')
    if (admin) login(admin.id)
  }

  const logout = () => {
    setCurrentProfileId(null)
    setProfile(null)
  }

  const register = (name: string, locale: string, timeZone: string): Profile => {
    const profile = localProfiles.create({ name, locale, timeZone })
    login(profile.id)
    return profile
  }

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: profile !== null,
        isAdmin: profile?.type === 'admin',
        login,
        loginAsGuest,
        loginAsAdmin,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
