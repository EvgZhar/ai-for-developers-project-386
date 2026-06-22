import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { localEventTypes } from '../../lib/eventTypes'
import type { EventType } from '../../api/types'

export function EventTypes() {
  const [types, setTypes] = useState<EventType[]>(() => localEventTypes.list())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(30)

  const refresh = () => setTypes(localEventTypes.list())

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setTitle('')
    setDescription('')
    setDuration(30)
  }

  const startEdit = (type: EventType) => {
    setEditing(type)
    setTitle(type.title)
    setDescription(type.description)
    setDuration(type.durationMinutes)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    if (editing) {
      localEventTypes.update(editing.id, { title, description, durationMinutes: duration })
    } else {
      localEventTypes.create({ title, description, durationMinutes: duration })
    }
    refresh()
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Удалить тип события?')) {
      localEventTypes.delete(id)
      refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-clay-900">Типы событий</h1>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          + Создать
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="font-semibold text-clay-900 mb-4">
            {editing ? 'Редактировать' : 'Новый тип события'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-clay-700 mb-1">Название</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                  placeholder:text-clay-400 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-clay-700 mb-1">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                  placeholder:text-clay-400 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-clay-700 mb-1">Длительность (мин)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(15, parseInt(e.target.value) || 15))}
                min={15}
                className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
                  focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editing ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!types?.length ? (
        <Card className="text-center py-12">
          <p className="text-clay-500">Нет типов событий</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {types.map((type) => (
            <Card key={type.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-clay-900">{type.title}</h3>
                    <span className="text-xs text-warm-500 font-medium">
                      · {type.durationMinutes} мин
                    </span>
                  </div>
                  <p className="text-sm text-clay-500 mt-1">{type.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(type)}>
                    ✏️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(type.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
