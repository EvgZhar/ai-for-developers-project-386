import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

export function Landing() {
  const { data: types, isLoading } = useQuery({
    queryKey: ['event-types'],
    queryFn: api.eventTypes.list,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-warm-300 border-t-warm-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-clay-900 mb-3">
          Запланируйте встречу
        </h1>
        <p className="text-lg text-clay-500">
          Выберите тип встречи и удобное время
        </p>
      </div>

      <div className="space-y-4">
        {types?.map((type) => (
          <Card key={type.id} className="group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-clay-900">{type.title}</h3>
                <p className="text-sm text-clay-500 mt-1">{type.description}</p>
                <span className="text-xs text-warm-500 font-medium mt-2 inline-block">
                  {type.durationMinutes} мин
                </span>
              </div>
              <Link to={`/book/${type.id}`}>
                <Button size="sm">Выбрать</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/admin"
          className="text-sm text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2"
        >
          Войти как владелец
        </Link>
        <span className="mx-2 text-clay-300">·</span>
        <Link
          to="/bookings"
          className="text-sm text-clay-400 hover:text-warm-600 transition-colors underline underline-offset-2"
        >
          Мои бронирования
        </Link>
      </div>
    </div>
  )
}
