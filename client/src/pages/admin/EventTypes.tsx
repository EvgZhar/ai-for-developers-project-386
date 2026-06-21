import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import type { EventType } from '../../api/types'

export function EventTypes() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(30)

  const { data: types, isLoading } = useQuery({
    queryKey: ['admin-event-types'],
    queryFn: api.admin.eventTypes.list,
  })

  const createMutation = useMutation({
    mutationFn: (body: { title: string; description: string; durationMinutes: number }) =>
      api.admin.eventTypes.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { title?: string; description?: string; durationMinutes?: number; isActive?: boolean } }) =>
      api.admin.eventTypes.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.eventTypes.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-event-types'] }),
  })

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
      updateMutation.mutate({
        id: editing.id,
        body: { title, description, durationMinutes: duration },
      })
    } else {
      createMutation.mutate({ title, description, durationMinutes: duration })
    }
  }

  const toggleActive = (type: EventType) => {
    updateMutation.mutate({
      id: type.id,
      body: { isActive: !type.isActive },
    })
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
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Сохранить' : 'Создать'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-warm-300 border-t-warm-600 rounded-full" />
        </div>
      ) : !types?.length ? (
        <Card className="text-center py-12">
          <p className="text-clay-500">Нет типов событий</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {types.map((type) => (
            <Card key={type.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-clay-900">{type.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      type.isActive
                        ? 'bg-sage-100 text-sage-800'
                        : 'bg-clay-100 text-clay-500'
                    }`}>
                      {type.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                  <p className="text-sm text-clay-500 mt-1">{type.description}</p>
                  <span className="text-xs text-warm-500 font-medium mt-1 inline-block">
                    {type.durationMinutes} мин
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(type)}>
                    ✏️
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(type)}>
                    {type.isActive ? '🔒' : '🔓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('Удалить тип события?')) {
                        deleteMutation.mutate(type.id)
                      }
                    }}
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
