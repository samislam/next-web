export { DataTable, DataTableView } from './data-table'
export type { DataTableProps, DataTableViewProps } from './data-table'
export { useDataTable } from './use-data-table'
export type { UseDataTableOptions, AnyColumnDef } from './use-data-table'
export { selectionColumn, expanderColumn, IndeterminateCheckbox } from './columns'
export {
  dataTableFilterFn,
  isActiveFilter,
  summarizeFilter,
  OPERATORS_BY_VARIANT,
  OP_LABEL,
} from './filters'
export type { FilterOp, ColumnFilterValue } from './filters'
export { DataBar, heatColor, TrendCell, Rating, ProgressBar, Sparkline, StatusDot } from './cells'
export type {
  DataTableClassNames,
  DataTableDensity,
  DataTableGridLines,
  ColumnAlign,
  FilterVariant,
} from './types'

// Re-export the TanStack essentials consumers need, so they don't add the dep directly.
export { createColumnHelper, flexRender } from '@tanstack/react-table'
export type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnPinningState,
  GroupingState,
  Table,
  Row,
  Column,
} from '@tanstack/react-table'
