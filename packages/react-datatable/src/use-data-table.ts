'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnOrderState,
  type RowSelectionState,
  type ExpandedState,
  type GroupingState,
  type OnChangeFn,
  type Updater,
  type Table,
  type Row,
  type RowData,
} from '@tanstack/react-table'

// TanStack columns are heterogeneous in their value type; `any` is the sanctioned escape hatch for an
// array of mixed-value column defs.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyColumnDef<TData> = ColumnDef<TData, any>

/** Controlled if `controlled` is provided, otherwise internal state seeded by `initial`. */
function useControllable<T>(
  controlled: T | undefined,
  onChange: OnChangeFn<T> | undefined,
  initial: T
): [T, OnChangeFn<T>] {
  const [internal, setInternal] = useState<T>(initial)
  const value = controlled !== undefined ? controlled : internal
  const set: OnChangeFn<T> = (updater: Updater<T>) => {
    if (controlled === undefined) setInternal(updater as never)
    onChange?.(updater)
  }
  return [value, set]
}

export type UseDataTableOptions<TData extends RowData> = {
  data: TData[]
  columns: AnyColumnDef<TData>[]
  getRowId?: (row: TData, index: number) => string

  // --- controllable state slices: pass value + onChange to control; omit for uncontrolled ---
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  defaultSorting?: SortingState
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  defaultColumnFilters?: ColumnFiltersState
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  defaultGlobalFilter?: string
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  defaultColumnVisibility?: VisibilityState
  columnPinning?: ColumnPinningState
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>
  defaultColumnPinning?: ColumnPinningState
  columnSizing?: ColumnSizingState
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>
  defaultColumnSizing?: ColumnSizingState
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>
  defaultColumnOrder?: ColumnOrderState
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  defaultRowSelection?: RowSelectionState
  expanded?: ExpandedState
  onExpandedChange?: OnChangeFn<ExpandedState>
  defaultExpanded?: ExpandedState
  grouping?: GroupingState
  onGroupingChange?: OnChangeFn<GroupingState>
  defaultGrouping?: GroupingState

  // --- feature flags ---
  enableSorting?: boolean
  enableMultiSort?: boolean
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  enableColumnResizing?: boolean
  enableGrouping?: boolean
  getRowCanExpand?: (row: Row<TData>) => boolean

  // --- server-driven: track state but don't sort/filter in memory (you refetch) ---
  manualSorting?: boolean
  manualFiltering?: boolean
}

/**
 * Headless table state on TanStack Table. Every slice is independently controllable (pass `x` +
 * `onXChange`) or uncontrolled (seeded by `defaultX`). Set `manualSorting`/`manualFiltering` for
 * server-driven tables (the table tracks state; you refetch via a {@link DataSource}).
 */
export function useDataTable<TData extends RowData>(
  options: UseDataTableOptions<TData>
): Table<TData> {
  const [sorting, onSortingChange] = useControllable(
    options.sorting,
    options.onSortingChange,
    options.defaultSorting ?? []
  )
  const [columnFilters, onColumnFiltersChange] = useControllable(
    options.columnFilters,
    options.onColumnFiltersChange,
    options.defaultColumnFilters ?? []
  )
  const [globalFilter, onGlobalFilterChange] = useControllable(
    options.globalFilter,
    options.onGlobalFilterChange,
    options.defaultGlobalFilter ?? ''
  )
  const [columnVisibility, onColumnVisibilityChange] = useControllable(
    options.columnVisibility,
    options.onColumnVisibilityChange,
    options.defaultColumnVisibility ?? {}
  )
  const [columnPinning, onColumnPinningChange] = useControllable(
    options.columnPinning,
    options.onColumnPinningChange,
    options.defaultColumnPinning ?? {}
  )
  const [columnSizing, onColumnSizingChange] = useControllable(
    options.columnSizing,
    options.onColumnSizingChange,
    options.defaultColumnSizing ?? {}
  )
  const [columnOrder, onColumnOrderChange] = useControllable(
    options.columnOrder,
    options.onColumnOrderChange,
    options.defaultColumnOrder ?? []
  )
  const [rowSelection, onRowSelectionChange] = useControllable(
    options.rowSelection,
    options.onRowSelectionChange,
    options.defaultRowSelection ?? {}
  )
  const [expanded, onExpandedChange] = useControllable(
    options.expanded,
    options.onExpandedChange,
    options.defaultExpanded ?? {}
  )
  const [grouping, onGroupingChange] = useControllable(
    options.grouping,
    options.onGroupingChange,
    options.defaultGrouping ?? []
  )

  return useReactTable<TData>({
    data: options.data,
    columns: options.columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnPinning,
      columnSizing,
      columnOrder,
      rowSelection,
      expanded,
      grouping,
    },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    onColumnPinningChange,
    onColumnSizingChange,
    onColumnOrderChange,
    onRowSelectionChange,
    onExpandedChange,
    onGroupingChange,
    getRowId: options.getRowId,
    enableSorting: options.enableSorting ?? true,
    enableMultiSort: options.enableMultiSort ?? true,
    enableRowSelection: options.enableRowSelection,
    enableColumnResizing: options.enableColumnResizing ?? true,
    enableGrouping: options.enableGrouping ?? true,
    groupedColumnMode: false,
    columnResizeMode: 'onChange',
    getRowCanExpand: options.getRowCanExpand,
    manualSorting: options.manualSorting ?? false,
    manualFiltering: options.manualFiltering ?? false,
    defaultColumn: { size: 160, minSize: 60, maxSize: 800 },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: options.manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: options.manualFiltering ? undefined : getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })
}
