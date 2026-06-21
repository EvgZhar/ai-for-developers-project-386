import type { BookingStatus } from '../api/types'

const statusConfig: Record<BookingStatus, { label: string; class: string }> = {
  requested: { label: 'Ожидает', class: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Подтверждена', class: 'bg-sage-100 text-sage-800' },
  rejected: { label: 'Отклонена', class: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Отменена', class: 'bg-clay-100 text-clay-600' },
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
      {cfg.label}
    </span>
  )
}
