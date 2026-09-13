'use client'

import { useEffect, useRef, type InputHTMLAttributes } from 'react'
import type { AnyColumnDef } from './use-data-table'

/** A checkbox that reflects the tri-state (checked / unchecked / indeterminate) selection. */
export function IndeterminateCheckbox({
  indeterminate,
  className,
  ...rest
}: { indeterminate?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !rest.checked && !!indeterminate
  }, [indeterminate, rest.checked])
  return <input type="checkbox" ref={ref} className={className ?? 'dt-checkbox'} {...rest} />
}

/** A leading checkbox column (select-all header + per-row select). Spread into your `columns`. */
export function selectionColumn<T>(): AnyColumnDef<T> {
  return {
    id: 'select',
    size: 44,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'center' },
    header: ({ table }) => (
      <IndeterminateCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <IndeterminateCheckbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        aria-label="Select row"
      />
    ),
  }
}

/** A leading expander column (chevron that toggles the row's expanded detail). Spread into `columns`. */
export function expanderColumn<T>(): AnyColumnDef<T> {
  return {
    id: 'expander',
    size: 40,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'center' },
    header: () => null,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          className="dt-expander"
          data-expanded={row.getIsExpanded() || undefined}
          onClick={row.getToggleExpandedHandler()}
          aria-label="Toggle row detail"
          aria-expanded={row.getIsExpanded()}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null,
  }
}
