import type { EventType, EventTypeCreate } from '../api/types'

const KEY = 'calbook-event-types'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getStored(): EventType[] {
  try {
    const data = localStorage.getItem(KEY)
    if (!data) {
      const defaults: EventType[] = [
        { id: generateId(), title: 'Встреча', description: 'Короткая встреча', durationMinutes: 30 },
        { id: generateId(), title: 'Встреча', description: 'Полноценная встреча', durationMinutes: 60 },
        { id: generateId(), title: 'Консультация', description: 'Быстрая консультация', durationMinutes: 15 },
        { id: generateId(), title: 'Консультация', description: 'Консультация', durationMinutes: 30 },
      ]
      localStorage.setItem(KEY, JSON.stringify(defaults))
      return defaults
    }
    return JSON.parse(data)
  } catch {
    return []
  }
}

function save(items: EventType[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export const localEventTypes = {
  list: getStored,

  get(id: string): EventType | undefined {
    return getStored().find((t) => t.id === id)
  },

  create(body: EventTypeCreate): EventType {
    const items = getStored()
    const item: EventType = {
      id: generateId(),
      title: body.title,
      description: body.description,
      durationMinutes: body.durationMinutes,
    }
    items.push(item)
    save(items)
    return item
  },

  update(id: string, body: Partial<EventTypeCreate>): EventType | undefined {
    const items = getStored()
    const idx = items.findIndex((t) => t.id === id)
    if (idx === -1) return undefined
    items[idx] = { ...items[idx], ...body }
    save(items)
    return items[idx]
  },

  delete(id: string): boolean {
    const items = getStored()
    const idx = items.findIndex((t) => t.id === id)
    if (idx === -1) return false
    items.splice(idx, 1)
    save(items)
    return true
  },
}
