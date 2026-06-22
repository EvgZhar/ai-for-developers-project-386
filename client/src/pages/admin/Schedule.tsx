import { useState, useEffect } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { getStoredLocale, getDayNames, getDayLabels } from '../../lib/dateUtils'
import { localSchedule } from '../../lib/schedule'
import type { TimeInterval } from '../../api/types'

interface DayState {
  dayOfWeek: number
  enabled: boolean
  intervals: TimeInterval[]
}

export function Schedule() {
  const [timeZone, setTimeZone] = useState('Europe/Moscow')
  const locale = getStoredLocale()
  const dayNames = getDayNames(locale)
  const dayShort = getDayLabels(locale)
  const [days, setDays] = useState<DayState[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      enabled: false,
      intervals: [{ startTime: '09:00', endTime: '18:00' }],
    }))
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const schedule = localSchedule.get()
    setTimeZone(schedule.timeZone)
    setDays(
      Array.from({ length: 7 }, (_, i) => {
        const existing = schedule.days.find((d) => d.dayOfWeek === i)
        return {
          dayOfWeek: i,
          enabled: !!existing,
          intervals: existing?.intervals || [{ startTime: '09:00', endTime: '18:00' }],
        }
      })
    )
  }, [])

  const toggleDay = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, enabled: !d.enabled } : d
      )
    )
  }

  const addInterval = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, intervals: [...d.intervals, { startTime: '09:00', endTime: '18:00' }] }
          : d
      )
    )
  }

  const updateInterval = (dayIndex: number, intervalIndex: number, field: keyof TimeInterval, value: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              intervals: d.intervals.map((int, j) =>
                j === intervalIndex ? { ...int, [field]: value } : int
              ),
            }
          : d
      )
    )
  }

  const removeInterval = (dayIndex: number, intervalIndex: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, intervals: d.intervals.filter((_, j) => j !== intervalIndex) }
          : d
      )
    )
  }

  const handleSave = () => {
    const filteredDays = days
      .filter((d) => d.enabled && d.intervals.length > 0)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        intervals: d.intervals,
      }))
    localSchedule.update({ timeZone, days: filteredDays })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-clay-900 mb-6">Расписание</h1>

      <Card className="mb-6">
        <label className="block text-sm font-medium text-clay-700 mb-1.5">
          Часовой пояс
        </label>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-clay-200 bg-white text-clay-900
            focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
        >
          <option value="Europe/Moscow">Europe/Moscow (MSK)</option>
          <option value="Europe/Kaliningrad">Europe/Kaliningrad</option>
          <option value="Europe/Samara">Europe/Samara</option>
          <option value="Asia/Yekaterinburg">Asia/Yekaterinburg</option>
          <option value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</option>
          <option value="Asia/Vladivostok">Asia/Vladivostok</option>
          <option value="Asia/Kamchatka">Asia/Kamchatka</option>
        </select>
      </Card>

      <div className="space-y-3">
        {days.map((day, index) => (
          <Card key={day.dayOfWeek} padding={false}>
            <div className="flex items-center gap-4 p-4">
              <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => toggleDay(index)}
                  className="w-5 h-5 rounded border-clay-300 text-warm-500 focus:ring-warm-300 cursor-pointer"
                />
                <span className="font-medium text-clay-900 whitespace-nowrap">
                  {dayNames[day.dayOfWeek]}
                </span>
                <span className="text-xs text-clay-400">({dayShort[day.dayOfWeek]})</span>
              </label>
              {day.enabled && (
                <button
                  onClick={() => addInterval(index)}
                  className="text-xs text-warm-600 hover:text-warm-700 font-medium shrink-0 cursor-pointer"
                >
                  + Добавить интервал
                </button>
              )}
            </div>
            {day.enabled && day.intervals.length > 0 && (
              <div className="px-4 pb-4 space-y-2 border-t border-clay-100 pt-3">
                {day.intervals.map((interval, intIndex) => (
                  <div key={intIndex} className="flex items-center gap-3">
                    <input
                      type="time"
                      value={interval.startTime}
                      onChange={(e) => updateInterval(index, intIndex, 'startTime', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-clay-200 bg-white text-clay-900 text-sm
                        focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
                    />
                    <span className="text-clay-400">—</span>
                    <input
                      type="time"
                      value={interval.endTime}
                      onChange={(e) => updateInterval(index, intIndex, 'endTime', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-clay-200 bg-white text-clay-900 text-sm
                        focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition-all"
                    />
                    {day.intervals.length > 1 && (
                      <button
                        onClick={() => removeInterval(index, intIndex)}
                        className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={handleSave}>
          Сохранить расписание
        </Button>
        {saved && (
          <span className="ml-3 text-sm text-sage-600">Сохранено</span>
        )}
      </div>
    </div>
  )
}
