import { useState } from 'react'
import { cn } from '@/lib/utils'

type DatePart = 'day' | 'month' | 'year'
type DateParts = { day: number; month: number; year: number }

type DateInputProps = {
  className?: string
  onChange: (date: Date) => void
  value?: Date
}

function toParts(value?: Date): DateParts {
  const date = value ?? new Date()
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

function isValidDate(parts: DateParts) {
  const date = new Date(parts.year, parts.month - 1, parts.day)
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day
  )
}

export function DateInput({ className, onChange, value }: DateInputProps) {
  const timestamp = value?.getTime()
  const [draft, setDraft] = useState(() => ({
    timestamp,
    parts: toParts(value),
  }))
  const parts = draft.timestamp === timestamp ? draft.parts : toParts(value)
  const setParts = (next: DateParts) => setDraft({ timestamp, parts: next })

  const updatePart = (part: DatePart, rawValue: string) => {
    if (!/^\d*$/.test(rawValue)) return
    const next = { ...parts, [part]: Number(rawValue) }
    setParts(next)
    if (rawValue && isValidDate(next)) {
      onChange(new Date(next.year, next.month - 1, next.day))
    }
  }

  const restoreInvalidValue = () => {
    if (!isValidDate(parts)) setParts(toParts(value))
  }

  const handleArrowKey = (
    event: React.KeyboardEvent<HTMLInputElement>,
    part: DatePart
  ) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const nextDate = new Date(parts.year, parts.month - 1, parts.day)
    const direction = event.key === 'ArrowUp' ? 1 : -1
    if (part === 'day') nextDate.setDate(nextDate.getDate() + direction)
    if (part === 'month') nextDate.setMonth(nextDate.getMonth() + direction)
    if (part === 'year')
      nextDate.setFullYear(nextDate.getFullYear() + direction)
    setParts(toParts(nextDate))
    onChange(nextDate)
  }

  const inputProps = (part: DatePart, label: string, maxLength: number) => ({
    'aria-label': label,
    className: cn(
      'border-0 bg-transparent p-0 text-center outline-none',
      part === 'year' ? 'w-10' : 'w-6'
    ),
    inputMode: 'numeric' as const,
    maxLength,
    onBlur: restoreInvalidValue,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      updatePart(part, event.target.value),
    onFocus: (event: React.FocusEvent<HTMLInputElement>) =>
      event.target.select(),
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) =>
      handleArrowKey(event, part),
    value: parts[part] || '',
  })

  return (
    <div
      className={cn(
        'flex h-9 items-center rounded-md border border-input bg-transparent px-2 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30',
        className
      )}
    >
      <input {...inputProps('day', 'Jour', 2)} />
      <span className='text-muted-foreground'>/</span>
      <input {...inputProps('month', 'Mois', 2)} />
      <span className='text-muted-foreground'>/</span>
      <input {...inputProps('year', 'Année', 4)} />
    </div>
  )
}
