const months = [
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

/** Sort the fixture's Casablanca display dates chronologically without parsing them as UTC instants. */
export function frenchDateOrder(value: string): number {
  const match = value.match(
    /(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s+à\s+(\d{2}):(\d{2}))?/
  )
  if (!match) return 0
  const [, day, month, year, hour = '0', minute = '0'] = match
  return (
    Number(year) * 100000000 +
    (months.indexOf(month) + 1) * 1000000 +
    Number(day) * 10000 +
    Number(hour) * 100 +
    Number(minute)
  )
}
