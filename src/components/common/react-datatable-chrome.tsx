'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import type { Column, DataTableClassNames } from '@samislam/react-datatable'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/shadcnui/dropdown-menu'

/**
 * Shared chrome for tables built on `@samislam/react-datatable` — the skin, pinned-column CSS tokens,
 * a debounce hook, and the per-column options menu (sort / pin / hide). Mirrors the treasury tables so
 * every data table looks and behaves the same; import these instead of copying them per file.
 */

export const dataTableSkin: DataTableClassNames = {
  root: '',
  header: 'bg-muted',
  headerRow: 'border-border border-b',
  headerCell: 'text-muted-foreground text-[11px] tracking-wide uppercase',
  row: 'hover:bg-accent/30 transition-colors',
  cell: 'text-sm',
  footer: 'bg-muted border-border border-t',
  footerCell: 'text-muted-foreground text-xs font-semibold',
  statusBar: 'bg-muted/60 border-border text-muted-foreground border-t',
}

export const dataTablePinnedTokens = {
  '--dt-pinned-bg': 'hsl(var(--card))',
  '--dt-header-pinned-bg': 'hsl(var(--muted))',
  '--dt-line': 'hsl(var(--border))',
} as CSSProperties

/** Debounces a value (e.g. a search box → backend query). */
export function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

/** A column's display label for the toolbar's column list (its string header, else its id). */
export const columnLabel = <T,>(column: Column<T, unknown>): string => {
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}

/** Builds the per-column options menu (sort / pin / hide) bound to the current translator. */
export const makeRenderColumnMenu = <T,>(t: (key: string) => string) =>
  // A NAMED function (not a bare arrow) so react/display-name is satisfied — this is a render callback
  // that returns a node, not a component mounted as <X/>, but the rule can't tell them apart.
  function ColumnMenu(column: Column<T, unknown>): ReactNode {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t('@t<datatable-column-options>')}
            className="text-muted-foreground hover:text-foreground rounded p-0.5"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {column.getCanSort() ? (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                {t('@t<datatable-sort-asc>')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                {t('@t<datatable-sort-desc>')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                {t('@t<datatable-sort-clear>')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem onClick={() => column.pin('left')}>
            {t('@t<datatable-pin-left>')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.pin('right')}>
            {t('@t<datatable-pin-right>')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.pin(false)}>
            {t('@t<datatable-unpin>')}
          </DropdownMenuItem>
          {column.getCanHide() ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                {t('@t<datatable-hide-column>')}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
