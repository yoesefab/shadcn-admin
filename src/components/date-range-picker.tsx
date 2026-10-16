import { useEffect, useRef, useState } from 'react'
import { fr } from 'date-fns/locale'
import { CalendarDays, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateInput } from '@/components/date-input'

type PresetName =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last14'
  | 'last30'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'

const PRESETS: { label: string; name: PresetName }[] = [
  { name: 'today', label: 'Aujourd’hui' },
  { name: 'yesterday', label: 'Hier' },
  { name: 'last7', label: '7 derniers jours' },
  { name: 'last14', label: '14 derniers jours' },
  { name: 'last30', label: '30 derniers jours' },
  { name: 'thisWeek', label: 'Cette semaine' },
  { name: 'lastWeek', label: 'Semaine dernière' },
  { name: 'thisMonth', label: 'Ce mois-ci' },
  { name: 'lastMonth', label: 'Mois dernier' },
]

type DateRangePickerProps = {
  align?: 'start' | 'center' | 'end'
  initialDateFrom?: Date
  initialDateTo?: Date
  locale?: string
  onUpdate?: (range: DateRange) => void
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function getPresetRange(name: PresetName): DateRange {
  const businessDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: string) =>
    Number(businessDate.find((item) => item.type === type)?.value)
  const today = new Date(part('year'), part('month') - 1, part('day'))
  const from = startOfDay(today)
  const to = endOfDay(today)
  if (name === 'yesterday') {
    from.setDate(from.getDate() - 1)
    to.setDate(to.getDate() - 1)
  }
  if (name === 'last7') from.setDate(from.getDate() - 6)
  if (name === 'last14') from.setDate(from.getDate() - 13)
  if (name === 'last30') from.setDate(from.getDate() - 29)
  const weekOffset = (from.getDay() + 6) % 7
  if (name === 'thisWeek') from.setDate(from.getDate() - weekOffset)
  if (name === 'lastWeek') {
    from.setDate(from.getDate() - weekOffset - 7)
    to.setDate(to.getDate() - weekOffset - 1)
  }
  if (name === 'thisMonth') from.setDate(1)
  if (name === 'lastMonth') {
    from.setMonth(from.getMonth() - 1, 1)
    to.setDate(0)
  }
  return { from, to }
}

function sameRange(first?: DateRange, second?: DateRange) {
  const sameDay = (left?: Date, right?: Date) =>
    left?.getFullYear() === right?.getFullYear() &&
    left?.getMonth() === right?.getMonth() &&
    left?.getDate() === right?.getDate()

  return sameDay(first?.from, second?.from) && sameDay(first?.to, second?.to)
}

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function DateRangePicker({
  align = 'end',
  initialDateFrom = startOfDay(new Date()),
  initialDateTo = initialDateFrom,
  locale = 'fr-MA',
  onUpdate,
}: DateRangePickerProps) {
  const openedRange = useRef<DateRange>({
    from: startOfDay(initialDateFrom),
    to: endOfDay(initialDateTo),
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(
    () => window.innerWidth < 960
  )
  const [range, setRange] = useState<DateRange>(() => ({
    from: startOfDay(initialDateFrom),
    to: endOfDay(initialDateTo),
  }))
  const [month, setMonth] = useState(initialDateFrom)

  useEffect(() => {
    const updateScreenSize = () => setIsSmallScreen(window.innerWidth < 960)
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const selectedPreset = PRESETS.find((preset) =>
    sameRange(range, getPresetRange(preset.name))
  )?.name
  const fullRangeLabel = range.from
    ? `${formatDate(range.from, locale)}${range.to ? ` – ${formatDate(range.to, locale)}` : ''}`
    : 'Période'
  const rangeLabel =
    range.from &&
    range.to &&
    range.from.getMonth() === range.to.getMonth() &&
    range.from.getFullYear() === range.to.getFullYear()
      ? `${range.from.getDate()} – ${formatDate(range.to, locale)}`
      : fullRangeLabel

  const setPreset = (name: PresetName) => {
    const next = getPresetRange(name)
    setRange(next)
    if (next.from) setMonth(next.from)
  }
  const cancel = () => {
    setRange(openedRange.current)
    setIsOpen(false)
  }
  const apply = () => {
    setIsOpen(false)
    if (!sameRange(range, openedRange.current)) onUpdate?.(range)
  }

  return (
    <Popover
      modal
      onOpenChange={(open) => {
        if (open) openedRange.current = range
        else if (isOpen) setRange(openedRange.current)
        setIsOpen(open)
      }}
      open={isOpen}
    >
      <PopoverTrigger asChild>
        <Button
          aria-label='Choisir une période'
          className='w-full min-w-0 justify-between px-3'
          title={fullRangeLabel}
          variant='outline'
        >
          <CalendarDays className='size-4 shrink-0' />
          <span className='min-w-0 flex-1 truncate text-start'>
            {rangeLabel}
          </span>
          {isOpen ? (
            <ChevronUp className='size-4 shrink-0 opacity-60' />
          ) : (
            <ChevronDown className='size-4 shrink-0 opacity-60' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className='max-h-[calc(100vh-5rem)] w-auto max-w-[calc(100vw-1rem)] overflow-y-auto p-0'
        sideOffset={8}
      >
        <div className='flex p-2'>
          <div className='min-w-0'>
            <div className='flex flex-col items-center justify-end gap-3 px-3 pt-2 pb-1 lg:flex-row lg:items-start'>
              <div className='flex items-center gap-2'>
                <DateInput
                  onChange={(from) =>
                    setRange((current) => ({
                      from,
                      to: !current.to || from > current.to ? from : current.to,
                    }))
                  }
                  value={range.from}
                />
                <span className='text-muted-foreground'>–</span>
                <DateInput
                  onChange={(to) =>
                    setRange((current) => ({
                      from:
                        current.from && current.from <= to ? current.from : to,
                      to,
                    }))
                  }
                  value={range.to}
                />
              </div>
            </div>
            {isSmallScreen ? (
              <Select
                onValueChange={(value) => setPreset(value as PresetName)}
                value={selectedPreset}
              >
                <SelectTrigger className='mx-auto my-2 w-[190px]'>
                  <SelectValue placeholder='Période rapide' />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Calendar
              labels={{
                labelNav: () => 'Navigation du calendrier',
                labelNext: () => 'Mois suivant',
                labelPrevious: () => 'Mois précédent',
              }}
              locale={fr}
              mode='range'
              month={month}
              numberOfMonths={isSmallScreen ? 1 : 2}
              onMonthChange={setMonth}
              onSelect={(nextRange) => nextRange?.from && setRange(nextRange)}
              selected={range}
            />
          </div>
          {!isSmallScreen ? (
            <div className='flex min-w-44 flex-col gap-1 border-s px-2 py-3'>
              {PRESETS.map((preset) => (
                <Button
                  className='justify-start px-2'
                  key={preset.name}
                  onClick={() => setPreset(preset.name)}
                  variant='ghost'
                >
                  <Check
                    className={cn(
                      'size-4',
                      selectedPreset === preset.name
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {preset.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        <div className='flex justify-end gap-2 border-t p-3'>
          <Button onClick={cancel} variant='ghost'>
            Annuler
          </Button>
          <Button onClick={apply}>Mettre à jour</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export type { DateRange }
