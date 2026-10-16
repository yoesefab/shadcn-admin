import { useEffect, useId, useRef, useState } from 'react'
import {
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const BUSINESS_TODAY = new Date(2026, 7, 27)

const cloneDate = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())
const sameDay = (first, second) => first.getTime() === second.getTime()
const startOfWeek = (date) => {
  const result = cloneDate(date)
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}
const toIsoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
const fromIsoDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatRange(from, to) {
  const fromDay = String(from.getDate()).padStart(2, '0')
  const toDay = String(to.getDate()).padStart(2, '0')
  if (
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth()
  ) {
    return `${fromDay}–${toDay} ${MONTHS[from.getMonth()]} ${from.getFullYear()}`
  }
  if (from.getFullYear() === to.getFullYear()) {
    return `${fromDay} ${MONTHS[from.getMonth()]}–${toDay} ${MONTHS[to.getMonth()]} ${to.getFullYear()}`
  }
  return `${fromDay} ${MONTHS[from.getMonth()]} ${from.getFullYear()}–${toDay} ${MONTHS[to.getMonth()]} ${to.getFullYear()}`
}

function parseRange(value) {
  const sameMonth = value.match(/^(\d{2})–(\d{2}) (\S+) (\d{4})$/)
  if (sameMonth) {
    const month = MONTHS.indexOf(sameMonth[3])
    if (month >= 0) {
      return {
        from: new Date(Number(sameMonth[4]), month, Number(sameMonth[1])),
        to: new Date(Number(sameMonth[4]), month, Number(sameMonth[2])),
      }
    }
  }

  const sameYear = value.match(/^(\d{2}) (\S+)–(\d{2}) (\S+) (\d{4})$/)
  if (sameYear) {
    const fromMonth = MONTHS.indexOf(sameYear[2])
    const toMonth = MONTHS.indexOf(sameYear[4])
    if (fromMonth >= 0 && toMonth >= 0) {
      const year = Number(sameYear[5])
      return {
        from: new Date(year, fromMonth, Number(sameYear[1])),
        to: new Date(year, toMonth, Number(sameYear[3])),
      }
    }
  }

  return { from: new Date(2026, 7, 1), to: cloneDate(BUSINESS_TODAY) }
}

function getPresetRange(name) {
  const from = cloneDate(BUSINESS_TODAY)
  const to = cloneDate(BUSINESS_TODAY)

  if (name === 'yesterday') {
    from.setDate(from.getDate() - 1)
    to.setDate(to.getDate() - 1)
  } else if (name === 'last7') {
    from.setDate(from.getDate() - 6)
  } else if (name === 'last14') {
    from.setDate(from.getDate() - 13)
  } else if (name === 'last30') {
    from.setDate(from.getDate() - 29)
  } else if (name === 'thisWeek') {
    return { from: startOfWeek(BUSINESS_TODAY), to }
  } else if (name === 'lastWeek') {
    const thisWeek = startOfWeek(BUSINESS_TODAY)
    from.setTime(thisWeek.getTime())
    from.setDate(from.getDate() - 7)
    to.setTime(from.getTime())
    to.setDate(to.getDate() + 6)
  } else if (name === 'thisMonth') {
    from.setDate(1)
  } else if (name === 'lastMonth') {
    from.setMonth(from.getMonth() - 1, 1)
    to.setDate(0)
  }

  return { from, to }
}

const PRESETS = [
  ['today', 'Aujourd’hui'],
  ['yesterday', 'Hier'],
  ['last7', '7 derniers jours'],
  ['last14', '14 derniers jours'],
  ['last30', '30 derniers jours'],
  ['thisWeek', 'Cette semaine'],
  ['lastWeek', 'Semaine dernière'],
  ['thisMonth', 'Ce mois-ci'],
  ['lastMonth', 'Mois dernier'],
]

function MonthCalendar({
  month,
  range,
  onSelect,
  onPrevious,
  onNext,
  showPrevious,
  showNext,
}) {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = startOfWeek(firstOfMonth)
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = cloneDate(gridStart)
    day.setDate(day.getDate() + index)
    return day
  })

  return (
    <section className='date-range-month'>
      <header>
        {showPrevious ? (
          <Button
            aria-label='Mois précédent'
            onClick={onPrevious}
            size='icon'
            type='button'
            variant='ghost'
          >
            <CaretLeft aria-hidden='true' />
          </Button>
        ) : (
          <span />
        )}
        <strong>{`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}</strong>
        {showNext ? (
          <Button
            aria-label='Mois suivant'
            onClick={onNext}
            size='icon'
            type='button'
            variant='ghost'
          >
            <CaretRight aria-hidden='true' />
          </Button>
        ) : (
          <span />
        )}
      </header>
      <div aria-hidden='true' className='date-range-weekdays'>
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div
        aria-label={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
        className='date-range-days'
        role='grid'
      >
        {days.map((day) => {
          const outsideMonth = day.getMonth() !== month.getMonth()
          const isStart = sameDay(day, range.from)
          const isEnd = sameDay(day, range.to)
          const isBetween = day > range.from && day < range.to
          return (
            <Button
              aria-label={day.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              className={`${outsideMonth ? 'is-outside ' : ''}${isBetween ? 'is-between ' : ''}${isStart ? 'is-start ' : ''}${isEnd ? 'is-end' : ''}`}
              disabled={outsideMonth}
              key={toIsoDate(day)}
              onClick={() => onSelect(day)}
              role='gridcell'
              size='sm'
              type='button'
              variant='ghost'
            >
              {day.getDate()}
            </Button>
          )
        })}
      </div>
    </section>
  )
}

export function DateRangePicker({ label, onChange, value }) {
  const popoverId = useId()
  const rootRef = useRef(null)
  const committedRange = parseRange(value)
  const [isOpen, setIsOpen] = useState(false)
  const [draftRange, setDraftRange] = useState(committedRange)
  const [selectingEnd, setSelectingEnd] = useState(false)
  const [viewMonth, setViewMonth] = useState(
    new Date(
      committedRange.to.getFullYear(),
      committedRange.to.getMonth() - 1,
      1
    )
  )

  useEffect(() => {
    const nextRange = parseRange(value)
    setDraftRange(nextRange)
    setViewMonth(
      new Date(nextRange.to.getFullYear(), nextRange.to.getMonth() - 1, 1)
    )
  }, [value])

  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const openPicker = () => {
    setDraftRange(parseRange(value))
    setSelectingEnd(false)
    setIsOpen((current) => !current)
  }

  const selectDay = (day) => {
    if (!selectingEnd) {
      setDraftRange({ from: day, to: day })
      setSelectingEnd(true)
      return
    }
    setDraftRange(
      day < draftRange.from
        ? { from: day, to: draftRange.from }
        : { from: draftRange.from, to: day }
    )
    setSelectingEnd(false)
  }

  const secondMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    1
  )
  const selectedPreset = PRESETS.find(([name]) => {
    const preset = getPresetRange(name)
    return (
      sameDay(preset.from, draftRange.from) && sameDay(preset.to, draftRange.to)
    )
  })?.[0]

  return (
    <div
      className='dashboard-filter dashboard-filter--period date-range-picker'
      ref={rootRef}
    >
      <span>{label}</span>
      <Button
        aria-controls={popoverId}
        aria-expanded={isOpen}
        className='dashboard-filter-control date-range-trigger'
        onClick={openPicker}
        type='button'
        variant='outline'
      >
        <CalendarBlank aria-hidden='true' />
        <span>{value}</span>
        <CaretDown aria-hidden='true' className='dashboard-filter-caret' />
      </Button>
      {isOpen ? (
        <div
          aria-label='Choisir une période'
          className='date-range-popover'
          id={popoverId}
          role='dialog'
        >
          <div className='date-range-inputs'>
            <label>
              <span>Du</span>
              <input
                aria-label='Date de début'
                onChange={(event) => {
                  if (!event.target.value) return
                  const from = fromIsoDate(event.target.value)
                  setDraftRange({
                    from,
                    to: from > draftRange.to ? from : draftRange.to,
                  })
                }}
                type='date'
                value={toIsoDate(draftRange.from)}
              />
            </label>
            <span aria-hidden='true'>–</span>
            <label>
              <span>Au</span>
              <input
                aria-label='Date de fin'
                onChange={(event) => {
                  if (!event.target.value) return
                  const to = fromIsoDate(event.target.value)
                  setDraftRange({
                    from: to < draftRange.from ? to : draftRange.from,
                    to,
                  })
                }}
                type='date'
                value={toIsoDate(draftRange.to)}
              />
            </label>
          </div>
          <div className='date-range-body'>
            <div className='date-range-calendars'>
              <MonthCalendar
                month={viewMonth}
                onNext={() => setViewMonth(secondMonth)}
                onPrevious={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                onSelect={selectDay}
                range={draftRange}
                showPrevious
              />
              <MonthCalendar
                month={secondMonth}
                onNext={() => setViewMonth(secondMonth)}
                onPrevious={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                onSelect={selectDay}
                range={draftRange}
                showNext
                showPrevious
              />
            </div>
            <div aria-label='Périodes rapides' className='date-range-presets'>
              {PRESETS.map(([name, presetLabel]) => (
                <Button
                  className={selectedPreset === name ? 'is-selected' : ''}
                  key={name}
                  onClick={() => {
                    setDraftRange(getPresetRange(name))
                    setSelectingEnd(false)
                  }}
                  size='sm'
                  type='button'
                  variant='ghost'
                >
                  <Check aria-hidden='true' />
                  {presetLabel}
                </Button>
              ))}
            </div>
          </div>
          <footer className='date-range-actions'>
            <Button
              className='date-range-cancel'
              onClick={() => {
                setDraftRange(parseRange(value))
                setIsOpen(false)
              }}
              type='button'
              variant='outline'
            >
              Annuler
            </Button>
            <Button
              className='date-range-apply'
              onClick={() => {
                onChange(formatRange(draftRange.from, draftRange.to))
                setIsOpen(false)
              }}
              type='button'
            >
              Mettre à jour
            </Button>
          </footer>
        </div>
      ) : null}
    </div>
  )
}
