'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Filter, Columns3, X, Calendar } from 'lucide-react'
import { useTranslate } from '@tolgee/react'
import {
  type Table,
  type Column,
  type FilterOp,
  type ColumnFilterValue,
  OPERATORS_BY_VARIANT,
  isActiveFilter,
  summarizeFilter,
} from '@samislam/react-datatable'
import { cn } from '@/lib/shadcn/utils'
import { Button } from '@/components/ui/shadcnui/button'
import { Input } from '@/components/ui/shadcnui/input'
import { SimpleTooltip } from '@/components/ui/shadcnui/tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/shadcnui/dropdown-menu'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyColumn = Column<any, unknown>

const FIELD =
  'border-border bg-background text-foreground h-8 w-full rounded-md border px-2 text-sm'

/** Whether an ISO timestamp falls within a `{from,to}` date-range filter — empty bounds are unbounded
 * and `to` is inclusive of the whole day. A table applies this to its date column's loaded rows. */
export const inDateRange = (iso: string, range: { from: string; to: string }): boolean => {
  const d = Date.parse(iso)
  if (Number.isNaN(d)) return true
  if (range.from && d < Date.parse(range.from)) return false
  if (range.to && d >= Date.parse(range.to) + 86_400_000) return false
  return true
}

/** i18n key per filter operator — localized where the operator dropdown renders. */
const OP_LABEL_KEY: Record<FilterOp, string> = {
  contains: '@t<dt-op-contains>',
  notContains: '@t<dt-op-not-contains>',
  equals: '@t<dt-op-equals>',
  notEquals: '@t<dt-op-not-equals>',
  startsWith: '@t<dt-op-starts-with>',
  endsWith: '@t<dt-op-ends-with>',
  gt: '@t<dt-op-gt>',
  gte: '@t<dt-op-gte>',
  lt: '@t<dt-op-lt>',
  lte: '@t<dt-op-lte>',
  between: '@t<dt-op-between>',
  inList: '@t<dt-op-in-list>',
  isTrue: '@t<dt-op-is-true>',
  isFalse: '@t<dt-op-is-false>',
  blank: '@t<dt-op-blank>',
  notBlank: '@t<dt-op-not-blank>',
}

/* ── A tiny click-outside popover (no shadcn Popover in the app) ───────────────────────────── */
function Popover({
  trigger,
  children,
  align = 'start',
  className,
}: {
  trigger: (p: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'start' | 'end'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={root} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open ? (
        <div
          className={cn(
            'bg-popover text-popover-foreground border-border absolute top-full z-50 mt-1.5 rounded-xl border p-3 shadow-lg',
            align === 'end' ? 'end-0' : 'start-0',
            className
          )}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      ) : null}
    </div>
  )
}

/* ── Typed filter widgets ─────────────────────────────────────────────────────────────────── */
function OpSelect({
  ops,
  value,
  onChange,
}: {
  ops: FilterOp[]
  value: FilterOp
  onChange: (op: FilterOp) => void
}) {
  const { t } = useTranslate()
  return (
    <select className={FIELD} value={value} onChange={(e) => onChange(e.target.value as FilterOp)}>
      {ops.map((op) => (
        <option key={op} value={op}>
          {t(OP_LABEL_KEY[op])}
        </option>
      ))}
    </select>
  )
}

const NO_VALUE: FilterOp[] = ['blank', 'notBlank']

function TextFilter({ column }: { column: AnyColumn }) {
  const { t } = useTranslate()
  const fv = (column.getFilterValue() as ColumnFilterValue) ?? { op: 'contains' as FilterOp }
  return (
    <div className="space-y-1.5">
      <OpSelect
        ops={OPERATORS_BY_VARIANT.text}
        value={fv.op}
        onChange={(op) => column.setFilterValue({ ...fv, op })}
      />
      {!NO_VALUE.includes(fv.op) ? (
        <input
          className={FIELD}
          value={(fv.value as string) ?? ''}
          onChange={(e) => column.setFilterValue({ ...fv, value: e.target.value })}
          placeholder={t('@t<dt-value>')}
        />
      ) : null}
    </div>
  )
}

function NumberFilter({ column }: { column: AnyColumn }) {
  const { t } = useTranslate()
  const fv = (column.getFilterValue() as ColumnFilterValue) ?? { op: 'gt' as FilterOp }
  return (
    <div className="space-y-1.5">
      <OpSelect
        ops={OPERATORS_BY_VARIANT.number}
        value={fv.op}
        onChange={(op) => column.setFilterValue({ ...fv, op })}
      />
      {!NO_VALUE.includes(fv.op) ? (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            className={FIELD}
            value={(fv.value as string) ?? ''}
            onChange={(e) => column.setFilterValue({ ...fv, value: e.target.value })}
            placeholder={fv.op === 'between' ? t('@t<dt-from>') : t('@t<dt-value>')}
          />
          {fv.op === 'between' ? (
            <input
              type="number"
              className={FIELD}
              value={(fv.value2 as string) ?? ''}
              onChange={(e) => column.setFilterValue({ ...fv, value2: e.target.value })}
              placeholder={t('@t<dt-to>')}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function EnumFilter({ column }: { column: AnyColumn }) {
  const { t } = useTranslate()
  const fv = column.getFilterValue() as ColumnFilterValue | undefined
  const selected = (fv?.value as unknown[]) ?? []
  const options = Array.from(column.getFacetedUniqueValues().keys()).sort()
  const toggle = (opt: unknown) => {
    const next = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]
    column.setFilterValue(next.length ? { op: 'inList' as FilterOp, value: next } : undefined)
  }
  if (options.length === 0)
    return <p className="text-muted-foreground text-xs">{t('@t<dt-no-values>')}</p>
  return (
    <div className="max-h-52 space-y-0.5 overflow-auto">
      {options.map((opt) => (
        <label
          key={String(opt)}
          className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="size-3.5"
          />
          <span className="truncate capitalize">{String(opt)}</span>
        </label>
      ))}
    </div>
  )
}

function BooleanFilter({ column }: { column: AnyColumn }) {
  const { t } = useTranslate()
  const fv = column.getFilterValue() as ColumnFilterValue | undefined
  const cur = fv?.op === 'isTrue' ? 'true' : fv?.op === 'isFalse' ? 'false' : 'any'
  const set = (v: string) =>
    column.setFilterValue(
      v === 'any' ? undefined : { op: (v === 'true' ? 'isTrue' : 'isFalse') as FilterOp }
    )
  const boolLabel: Record<string, string> = {
    any: '@t<dt-bool-any>',
    true: '@t<dt-bool-true>',
    false: '@t<dt-bool-false>',
  }
  return (
    <div className="border-border flex overflow-hidden rounded-md border">
      {['any', 'true', 'false'].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => set(v)}
          className={cn(
            'flex-1 px-2 py-1 text-xs capitalize transition-colors',
            cur === v
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t(boolLabel[v])}
        </button>
      ))}
    </div>
  )
}

/** Dispatches to the right widget by the column's `meta.filterVariant`. */
export function ColumnFilter({ column }: { column: AnyColumn }) {
  switch (column.columnDef.meta?.filterVariant) {
    case 'select':
      return <EnumFilter column={column} />
    case 'boolean':
      return <BooleanFilter column={column} />
    case 'number':
    case 'range':
      return <NumberFilter column={column} />
    default:
      return <TextFilter column={column} />
  }
}

/* ── The toolbar ──────────────────────────────────────────────────────────────────────────── */
type ToolbarProps<TData> = {
  table: Table<TData>
  /** Generic search — wire to the backend `?search=`. */
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  /** Human label for a column (defaults to its id). */
  columnLabel?: (column: AnyColumn) => string
  /** Extra content pinned to the end (e.g. a loaded-count). */
  right?: ReactNode
  /** Date-range filter (ISO `yyyy-mm-dd`, empty = unbounded). Renders the control only when the
   * `onDateRange` setter is provided — the owning table applies it to its date column. */
  dateRange?: { from: string; to: string }
  onDateRange?: (r: { from: string; to: string }) => void
}

export function DataTableToolbar<TData>(props: ToolbarProps<TData>) {
  const { t } = useTranslate()
  const { table, search, onSearchChange, searchPlaceholder, right, dateRange, onDateRange } = props
  const dateActive = Boolean(dateRange?.from || dateRange?.to)
  const label = (c: AnyColumn) => props.columnLabel?.(c) ?? c.id
  const filterable = table
    .getAllColumns()
    .filter((c) => c.getCanFilter() && !!c.columnDef.meta?.filterVariant) as AnyColumn[]
  const active = filterable.filter((c) => isActiveFilter(c.getFilterValue() as ColumnFilterValue))
  const grouping = table.getState().grouping

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          icon="lucide:Search"
          placeholder={searchPlaceholder ?? t('@t<dt-search>')}
          rootClassname="bg-card border-border h-9 w-full sm:w-72 rounded-xl shadow-none"
        />

        {/* Date range */}
        {onDateRange ? (
          <Popover
            align="start"
            className="w-64"
            trigger={({ toggle }) => (
              <SimpleTooltip text={t('@t<dt-date-range>')}>
                <Button
                  type="button"
                  variant={dateActive ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={toggle}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </SimpleTooltip>
            )}
          >
            {(close) => (
              <div className="space-y-2">
                <div className="text-sm font-semibold">{t('@t<dt-date-range>')}</div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs">{t('@t<dt-from>')}</label>
                  <input
                    type="date"
                    className={FIELD}
                    value={dateRange?.from ?? ''}
                    onChange={(e) => onDateRange({ from: e.target.value, to: dateRange?.to ?? '' })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs">{t('@t<dt-to>')}</label>
                  <input
                    type="date"
                    className={FIELD}
                    value={dateRange?.to ?? ''}
                    onChange={(e) =>
                      onDateRange({ from: dateRange?.from ?? '', to: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  disabled={!dateActive}
                  onClick={() => {
                    onDateRange({ from: '', to: '' })
                    close()
                  }}
                  className="border-border text-foreground hover:bg-accent w-full rounded-lg border py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('@t<dt-clear>')}
                </button>
              </div>
            )}
          </Popover>
        ) : null}

        {/* Filters */}
        {filterable.length > 0 ? (
          <Popover
            align="start"
            className="w-72"
            trigger={({ toggle }) => (
              <SimpleTooltip text={t('@t<dt-filters>')}>
                <Button
                  type="button"
                  variant={active.length ? 'default' : 'outline'}
                  size="icon"
                  className="relative h-9 w-9 rounded-xl"
                  onClick={toggle}
                >
                  <Filter className="h-4 w-4" />
                  {active.length ? (
                    <span className="bg-destructive text-destructive-foreground absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                      {active.length}
                    </span>
                  ) : null}
                </Button>
              </SimpleTooltip>
            )}
          >
            <div>
              <div className="mb-2 text-sm font-semibold">{t('@t<dt-filters>')}</div>
              <div className="max-h-[60vh] space-y-3 overflow-auto">
                {filterable.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-semibold capitalize">
                        {label(c)}
                      </span>
                      {isActiveFilter(c.getFilterValue() as ColumnFilterValue) ? (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground text-[11px]"
                          onClick={() => c.setFilterValue(undefined)}
                        >
                          {t('@t<dt-clear>')}
                        </button>
                      ) : null}
                    </div>
                    <ColumnFilter column={c} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={active.length === 0}
                onClick={() => filterable.forEach((c) => c.setFilterValue(undefined))}
                className="border-border text-foreground hover:bg-accent mt-3 w-full rounded-lg border py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('@t<dt-reset-filters>')}
              </button>
            </div>
          </Popover>
        ) : null}

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SimpleTooltip text={t('@t<dt-columns>')}>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
                <Columns3 className="h-4 w-4" />
              </Button>
            </SimpleTooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>{t('@t<dt-columns>')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={c.getIsVisible()}
                  onCheckedChange={(v) => c.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {label(c as AnyColumn)}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {right ? <div className="ms-auto">{right}</div> : null}
      </div>

      {/* Grouping chips */}
      {grouping.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">{t('@t<dt-grouped-by>')}</span>
          {grouping.map((id) => {
            const c = table.getColumn(id) as AnyColumn | undefined
            return (
              <span
                key={id}
                className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-0.5 ps-2.5 pe-1 text-xs font-semibold"
              >
                <span className="capitalize">{c ? label(c) : id}</span>
                <button
                  type="button"
                  aria-label={t('@t<dt-ungroup>')}
                  className="hover:text-foreground rounded-full p-0.5"
                  onClick={() => c?.toggleGrouping()}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      ) : null}

      {/* Active-filter chips */}
      {active.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {active.map((c) => (
            <span
              key={c.id}
              className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full py-0.5 ps-2.5 pe-1 text-xs"
            >
              <span className="font-semibold capitalize">{label(c)}</span>
              <span className="text-muted-foreground">
                {summarizeFilter(c.getFilterValue() as ColumnFilterValue)}
              </span>
              <button
                type="button"
                aria-label={t('@t<dt-remove-filter>')}
                className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                onClick={() => c.setFilterValue(undefined)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
