'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ColumnFiltersState, SortingState } from '@samislam/react-datatable'

// TanStack's OnChangeFn takes either the next value or an updater function of the previous value.
type Updater<T> = T | ((old: T) => T)
type OnChangeFn<T> = (updater: Updater<T>) => void

const applyUpdater = <T>(updater: Updater<T>, prev: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(prev) : updater

type Options = {
  /** Namespaces the query params when a page hosts more than one persisted table. */
  key?: string
  defaultSorting?: SortingState
  defaultColumnFilters?: ColumnFiltersState
}

/**
 * Persists a `@samislam/react-datatable` table's **column filters + sorting in the URL**, so they
 * survive a refresh and are shareable. State is seeded once from the URL on mount (falling back to the
 * given defaults), and written back on every change via `history.replaceState` — no server round-trip
 * and no history-stack spam. Spread the result into `useDataTable`:
 *
 * ```ts
 * const urlState = useUrlDataTableState({ defaultSorting: [{ id: 'created', desc: true }] })
 * const table = useDataTable({ data, columns, ...urlState })
 * ```
 */
export function useUrlDataTableState(options: Options = {}) {
  const searchParams = useSearchParams()
  const filtersKey = options.key ? `${options.key}.filters` : 'filters'
  const sortKey = options.key ? `${options.key}.sort` : 'sort'

  const initial = useMemo(() => {
    const parse = <T>(raw: string | null): T | undefined => {
      if (!raw) return undefined
      try {
        return JSON.parse(raw) as T
      } catch {
        return undefined
      }
    }
    return {
      columnFilters:
        parse<ColumnFiltersState>(searchParams.get(filtersKey)) ??
        options.defaultColumnFilters ??
        [],
      sorting: parse<SortingState>(searchParams.get(sortKey)) ?? options.defaultSorting ?? [],
    }
    // Seed ONCE from the URL on mount; afterwards this hook owns the params (it doesn't read them back).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initial.columnFilters)
  const [sorting, setSorting] = useState<SortingState>(initial.sorting)

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => setColumnFilters((prev) => applyUpdater(updater, prev)),
    []
  )
  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => setSorting((prev) => applyUpdater(updater, prev)),
    []
  )

  // Reflect state → URL (client only; replaceState keeps other params and doesn't touch history depth).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (columnFilters.length) url.searchParams.set(filtersKey, JSON.stringify(columnFilters))
    else url.searchParams.delete(filtersKey)
    if (sorting.length) url.searchParams.set(sortKey, JSON.stringify(sorting))
    else url.searchParams.delete(sortKey)
    window.history.replaceState(window.history.state, '', url.toString())
  }, [columnFilters, sorting, filtersKey, sortKey])

  return { columnFilters, onColumnFiltersChange, sorting, onSortingChange }
}
