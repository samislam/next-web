'use client'

// The package ships its own stylesheet. Import it once per table module — it is side-effect-only and
// bundlers dedupe it, so repeating the import across table files costs nothing.
import '@samislam/react-datatable/styles.css'

import { useMemo, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import {
  useDataTable,
  DataTableView,
  expanderColumn,
  selectionColumn,
  createColumnHelper,
  dataTableFilterFn,
  StatusDot,
  type Row,
} from '@samislam/react-datatable'
import { dataTableSkin, dataTablePinnedTokens } from '@/components/common/react-datatable-chrome'
import { useUrlDataTableState } from '@/components/common/use-url-datatable-state'
import { DataTableToolbar, inDateRange } from '@/components/common/datatable-toolbar'

/**
 * A worked example of `@samislam/react-datatable` — copy this file as the starting point for a real
 * table, then swap the static `ROWS` for a query.
 *
 * It demonstrates the whole stack in one place:
 * - `useDataTable` spread with `useUrlDataTableState`, so column filters + sorting live in the URL
 *   and survive a refresh or a shared link;
 * - per-column `filterVariant` metadata driving the toolbar's filter controls;
 * - column pinning, an expandable row, row selection, and grouping;
 * - the shared skin/pinned-token chrome so every table in the app looks like the others.
 *
 * Filtering here is client-side because the data is static. For a server-driven table, keep `search`
 * and the date range in state and pass them to the query instead of filtering in the browser.
 */

type Person = {
  id: string
  name: string
  team: string
  status: 'active' | 'invited' | 'suspended'
  commits: number
  joinedAt: string
  note: string
}

const ROWS: Person[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    team: 'Platform',
    status: 'active',
    commits: 412,
    joinedAt: '2026-01-14',
    note: 'Wrote the first loop.',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    team: 'Compilers',
    status: 'active',
    commits: 388,
    joinedAt: '2026-02-02',
    note: 'Found the original bug.',
  },
  {
    id: '3',
    name: 'Alan Turing',
    team: 'Platform',
    status: 'suspended',
    commits: 265,
    joinedAt: '2026-02-20',
    note: 'On leave.',
  },
  {
    id: '4',
    name: 'Katherine Johnson',
    team: 'Analytics',
    status: 'active',
    commits: 301,
    joinedAt: '2026-03-08',
    note: 'Checks the numbers twice.',
  },
  {
    id: '5',
    name: 'Margaret Hamilton',
    team: 'Reliability',
    status: 'invited',
    commits: 0,
    joinedAt: '2026-03-27',
    note: 'Invitation sent.',
  },
  {
    id: '6',
    name: 'Barbara Liskov',
    team: 'Compilers',
    status: 'active',
    commits: 197,
    joinedAt: '2026-04-11',
    note: 'Substitutes cleanly.',
  },
]

/** The fixed status colours from globals.css — never themed, always paired with a text label. */
const STATUS_COLOR: Record<Person['status'], string> = {
  active: 'var(--chart-status-good)',
  invited: 'var(--chart-status-warning)',
  suspended: 'var(--chart-status-critical)',
}

export const DataTableExample = () => {
  const { t } = useTranslate()
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  const columns = useMemo(() => {
    const col = createColumnHelper<Person>()
    return [
      // Both are provided by the package; pin them left so they stay put while you scroll sideways.
      selectionColumn<Person>(),
      expanderColumn<Person>(),
      col.accessor('name', {
        id: 'name',
        header: 'Name',
        size: 220,
        filterFn: dataTableFilterFn,
        meta: { filterVariant: 'text' },
      }),
      col.accessor('team', {
        id: 'team',
        header: 'Team',
        size: 160,
        filterFn: dataTableFilterFn,
        // `select` makes the toolbar offer the distinct values of this column.
        meta: { filterVariant: 'select' },
      }),
      col.accessor('status', {
        id: 'status',
        header: 'Status',
        size: 150,
        filterFn: dataTableFilterFn,
        meta: { filterVariant: 'select' },
        cell: (c) => (
          <span className="flex items-center gap-2 text-sm capitalize">
            <StatusDot color={STATUS_COLOR[c.getValue()]} />
            {c.getValue()}
          </span>
        ),
      }),
      col.accessor('commits', {
        id: 'commits',
        header: 'Commits',
        size: 130,
        filterFn: dataTableFilterFn,
        enableGrouping: false,
        meta: { filterVariant: 'range', align: 'end' },
        cell: (c) => <span className="tabular-nums">{c.getValue().toLocaleString('en-US')}</span>,
      }),
      col.accessor('joinedAt', {
        id: 'joinedAt',
        header: 'Joined',
        size: 150,
        enableGrouping: false,
        cell: (c) => <span className="text-muted-foreground text-xs">{c.getValue()}</span>,
      }),
    ]
  }, [])

  // Apply the toolbar's generic search + date range. A server-driven table sends these to the API
  // instead; doing it here keeps the example self-contained.
  const data = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return ROWS.filter((row) => {
      if (needle && !`${row.name} ${row.team}`.toLowerCase().includes(needle)) return false
      if ((dateRange.from || dateRange.to) && !inDateRange(row.joinedAt, dateRange)) return false
      return true
    })
  }, [search, dateRange])

  const urlState = useUrlDataTableState({
    key: 'people',
    defaultSorting: [{ id: 'commits', desc: true }],
  })

  const table = useDataTable({
    ...urlState,
    data,
    columns,
    getRowId: (row) => row.id,
    getRowCanExpand: () => true,
    defaultColumnPinning: { left: ['select', 'expander'], right: [] },
  })

  const renderExpanded = (row: Row<Person>) => (
    <div className="bg-muted/30 p-4 text-sm">
      <span className="text-muted-foreground">{row.original.note}</span>
    </div>
  )

  return (
    <div className="border-border bg-card w-full overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border border-b p-3">
        <DataTableToolbar
          table={table}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search people…"
          dateRange={dateRange}
          onDateRange={setDateRange}
          right={
            <span className="text-muted-foreground text-xs tabular-nums">{data.length} rows</span>
          }
        />
      </div>

      <div style={dataTablePinnedTokens} className="overflow-hidden rounded-b-2xl">
        <DataTableView
          table={table}
          classNames={dataTableSkin}
          density="compact"
          gridLines="both"
          maxBodyHeight={420}
          renderExpanded={renderExpanded}
          unpinLabel={t('@t<datatable-unpin>')}
          emptyState={<span className="text-muted-foreground text-sm">No matching rows.</span>}
        />
      </div>
    </div>
  )
}
