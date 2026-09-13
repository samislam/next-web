import type { FilterFn } from '@tanstack/react-table'
import type { FilterVariant } from './types'

/** Every comparison operator the built-in filter widgets understand. */
export type FilterOp =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'inList'
  | 'isTrue'
  | 'isFalse'
  | 'blank'
  | 'notBlank'

/** The structured value a filtered column holds: an operator plus up to two operands. */
export type ColumnFilterValue = { op: FilterOp; value?: unknown; value2?: unknown }

/** Which operators each column type offers. */
export const OPERATORS_BY_VARIANT: Record<FilterVariant, FilterOp[]> = {
  text: [
    'contains',
    'notContains',
    'equals',
    'notEquals',
    'startsWith',
    'endsWith',
    'blank',
    'notBlank',
  ],
  number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between', 'blank', 'notBlank'],
  range: ['between', 'gte', 'lte'],
  select: ['inList'],
  boolean: ['isTrue', 'isFalse'],
}

export const OP_LABEL: Record<FilterOp, string> = {
  contains: 'Contains',
  notContains: 'Does not contain',
  equals: 'Equals',
  notEquals: 'Does not equal',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  between: 'Between',
  inList: 'Is any of',
  isTrue: 'Is true',
  isFalse: 'Is false',
  blank: 'Blank',
  notBlank: 'Not blank',
}

const asNum = (v: unknown) => (v === '' || v == null ? NaN : Number(v))
const asStr = (v: unknown) => (v == null ? '' : String(v)).toLowerCase()
const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0)

const NO_VALUE_OPS: FilterOp[] = ['blank', 'notBlank', 'isTrue', 'isFalse']

/** True when a filter is complete enough to actually narrow results (drives chips + active counts). */
export function isActiveFilter(fv?: ColumnFilterValue): boolean {
  if (!fv?.op) return false
  if (NO_VALUE_OPS.includes(fv.op)) return true
  if (isEmpty(fv.value)) return false
  if (fv.op === 'between' && isEmpty(fv.value2)) return false
  return true
}

/**
 * One `FilterFn` that interprets the structured {@link ColumnFilterValue}. Incomplete filters (an
 * operator with no operand yet) are treated as no-ops so the UI can keep the chosen operator without
 * blanking the table. Assign it to a column's `filterFn`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataTableFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const fv = filterValue as ColumnFilterValue | undefined
  if (!fv?.op) return true
  const { op, value, value2 } = fv
  // Incomplete filter → show everything.
  if (!NO_VALUE_OPS.includes(op) && isEmpty(value)) return true
  if (op === 'between' && isEmpty(value2)) return true

  const raw = row.getValue(columnId)
  switch (op) {
    case 'blank':
      return isEmpty(raw)
    case 'notBlank':
      return !isEmpty(raw)
    case 'contains':
      return asStr(raw).includes(asStr(value))
    case 'notContains':
      return !asStr(raw).includes(asStr(value))
    case 'equals':
      return asStr(raw) === asStr(value)
    case 'notEquals':
      return asStr(raw) !== asStr(value)
    case 'startsWith':
      return asStr(raw).startsWith(asStr(value))
    case 'endsWith':
      return asStr(raw).endsWith(asStr(value))
    case 'gt':
      return asNum(raw) > asNum(value)
    case 'gte':
      return asNum(raw) >= asNum(value)
    case 'lt':
      return asNum(raw) < asNum(value)
    case 'lte':
      return asNum(raw) <= asNum(value)
    case 'between': {
      const n = asNum(raw)
      return n >= asNum(value) && n <= asNum(value2)
    }
    case 'inList':
      return Array.isArray(value) ? value.length === 0 || value.includes(raw) : true
    case 'isTrue':
      return raw === true
    case 'isFalse':
      return raw === false
    default:
      return true
  }
}
dataTableFilterFn.autoRemove = (filterValue) => !(filterValue as ColumnFilterValue)?.op

/** A short human summary of a filter, for chips. */
export function summarizeFilter(fv?: ColumnFilterValue): string {
  if (!fv?.op) return ''
  const sym: Partial<Record<FilterOp, string>> = {
    gt: '>',
    gte: '≥',
    lt: '<',
    lte: '≤',
    equals: '=',
    notEquals: '≠',
  }
  switch (fv.op) {
    case 'between':
      return `${fv.value ?? ''}–${fv.value2 ?? ''}`
    case 'inList':
      return `${(fv.value as unknown[] | undefined)?.length ?? 0} selected`
    case 'isTrue':
      return 'true'
    case 'isFalse':
      return 'false'
    case 'blank':
      return 'blank'
    case 'notBlank':
      return 'not blank'
    default:
      return sym[fv.op]
        ? `${sym[fv.op]} ${fv.value ?? ''}`
        : `${OP_LABEL[fv.op].toLowerCase()} "${fv.value ?? ''}"`
  }
}
