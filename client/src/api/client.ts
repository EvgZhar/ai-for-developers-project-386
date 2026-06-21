const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  profiles: {
    list: () => request<import('./types').Profile[]>('/api/profiles'),
    create: (body: import('./types').ProfileCreate) =>
      request<import('./types').Profile>('/api/profiles', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: import('./types').ProfileCreate) =>
      request<import('./types').Profile>(`/api/profiles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/api/profiles/${id}`, { method: 'DELETE' }),
  },
  eventTypes: {
    list: () => request<import('./types').EventType[]>('/api/event-types'),
    get: (id: string) => request<import('./types').EventType>(`/api/event-types/${id}`),
  },
  admin: {
    eventTypes: {
      list: () => request<import('./types').EventType[]>('/api/admin/event-types'),
      create: (body: import('./types').EventTypeCreate) =>
        request<import('./types').EventType>('/api/admin/event-types', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: import('./types').EventTypeUpdate) =>
        request<import('./types').EventType>(`/api/admin/event-types/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      delete: (id: string) =>
        request<void>(`/api/admin/event-types/${id}`, { method: 'DELETE' }),
    },
    schedule: {
      get: () => request<import('./types').Schedule>('/api/admin/schedule'),
      update: (body: import('./types').Schedule) =>
        request<import('./types').Schedule>('/api/admin/schedule', { method: 'PUT', body: JSON.stringify(body) }),
    },
    bookings: {
      list: (params?: { dateFrom?: string; dateTo?: string; status?: string }) => {
        const q = new URLSearchParams()
        if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
        if (params?.dateTo) q.set('dateTo', params.dateTo)
        if (params?.status) q.set('status', params.status)
        return request<import('./types').Booking[]>(`/api/admin/bookings?${q}`)
      },
      confirm: (id: string) => request<import('./types').Booking>(`/api/admin/bookings/${id}/confirm`, { method: 'POST' }),
      reject: (id: string) => request<import('./types').Booking>(`/api/admin/bookings/${id}/reject`, { method: 'POST' }),
      cancel: (id: string) => request<import('./types').Booking>(`/api/admin/bookings/${id}/cancel`, { method: 'POST' }),
    },
  },
  slots: {
    getAvailable: (eventTypeId: string, dateFrom: string, dateTo: string) => {
      const q = new URLSearchParams({ dateFrom, dateTo })
      return request<import('./types').AvailableSlot[]>(`/api/event-types/${eventTypeId}/slots?${q}`)
    },
  },
  bookings: {
    create: (body: import('./types').BookingCreate) =>
      request<import('./types').Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request<import('./types').Booking>(`/api/bookings/${id}`),
    listByGuest: (guestProfileId: string) => {
      const q = new URLSearchParams({ guestProfileId })
      return request<import('./types').Booking[]>(`/api/bookings?${q}`)
    },
    cancel: (id: string) => request<import('./types').Booking>(`/api/bookings/${id}/cancel`, { method: 'POST' }),
  },
}
