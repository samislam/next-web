import { parse } from 'date-fns'
import { format } from 'date-fns'
import { isValid } from 'date-fns'

const DATE_PATTERNS = [
  'yyyy-MM-dd',
  'yyyy-MM-dd HH:mm',
  'yyyy-MM-dd hh:mm a',
  'dd-MM-yyyy @HH:mm',
  'dd MMM yyyy HH:mm',
] as const

const parseDateValue = (value: string | Date) => {
  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  const normalizedValue = value.trim()

  for (const pattern of DATE_PATTERNS) {
    const parsedDate = parse(normalizedValue, pattern, new Date())

    if (isValid(parsedDate)) return parsedDate
  }

  const parsedDate = new Date(normalizedValue)

  return isValid(parsedDate) ? parsedDate : null
}

export const dateFormatter = (value: string | Date) => {
  const parsedDate = parseDateValue(value)

  if (!parsedDate) return String(value)

  return format(parsedDate, 'd MMM yyyy')
}

export const datetimeFormatter = (value: string | Date) => {
  const parsedDate = parseDateValue(value)

  if (!parsedDate) return String(value)

  return format(parsedDate, "d MMM yyyy 'at' HH:mm")
}
