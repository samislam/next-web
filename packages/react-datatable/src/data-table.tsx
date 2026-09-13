'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import {
  flexRender,
  type Table,
  type Row,
  type Column,
  type Cell,
  type Header,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDataTable, type UseDataTableOptions } from './use-data-table'
import type { DataTableClassNames, DataTableDensity, DataTableGridLines } from './types'
import { cx } from './utils'

const ROW_HEIGHT: Record<DataTableDensity, number> = { compact: 44, normal: 52, spacious: 60 }
const fmtNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 })

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** Write a rectangular selection to the clipboard as TSV (plain → pastes as cells in Excel) AND an
 * HTML table (rich → pastes as a table in Word / email), instead of one flat blob. */
const writeSelectionClipboard = (grid: string[][]) => {
  const tsv = grid.map((row) => row.join('\t')).join('\n')
  const html = `<table>${grid
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('')}</table>`
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      void navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([tsv], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ])
    } else {
      void navigator.clipboard?.writeText(tsv)
    }
  } catch {
    void navigator.clipboard?.writeText(tsv)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyColumn<TData> = Column<TData, any>

function pinStyle<TData>(column: AnyColumn<TData>): CSSProperties {
  const pinned = column.getIsPinned()
  if (pinned === 'left') return { position: 'sticky', left: column.getStart('left'), zIndex: 2 }
  if (pinned === 'right') return { position: 'sticky', right: column.getAfter('right'), zIndex: 2 }
  return {}
}

export type DataTableViewProps<TData> = {
  table: Table<TData>
  classNames?: DataTableClassNames
  density?: DataTableDensity
  emptyState?: ReactNode
  /** Rendered full-width beneath a row when it is expanded. */
  renderExpanded?: (row: Row<TData>) => ReactNode
  /** Per-row class — for status tints / color spans. */
  getRowClassName?: (row: Row<TData>) => string | undefined
  /** A per-column menu trigger placed in the header (e.g. a shadcn dropdown). */
  renderColumnMenu?: (column: Column<TData, unknown>) => ReactNode
  /** Tooltip / aria-label for the pin toggle shown next to a pinned column's name (click = unpin).
   * Localizable; defaults to 'Unpin'. */
  unpinLabel?: string
  /** Called as the scroll nears the end — drive infinite loading from here. */
  onReachEnd?: () => void
  /** Fixed viewport height (px) that turns on row virtualization. Omit to render every row. */
  maxBodyHeight?: number
  /** Minimum body height (px) so an empty or short table keeps a fixed height instead of collapsing —
   * the body (or empty state) grows to fill it and the footer stays pinned at the bottom. Set it equal
   * to `maxBodyHeight` for an always-fixed-height table. */
  minBodyHeight?: number
  /** Render the footer row when any column defines `footer`. */
  showFooter?: boolean
  /** Stretch rows to fill the container width with a flexible filler track (default true). */
  fillWidth?: boolean
  /** Which cell borders to draw: 'none' | 'rows' | 'columns' | 'both' (default 'rows'). Color comes
   * from the `--dt-line` token, thickness from `--dt-line-width`. */
  gridLines?: DataTableGridLines
  /** Enable Excel-style rectangular cell range selection + a status bar (sum/avg/min/max/count). */
  enableRangeSelection?: boolean
  /**
   * Auto-size every column to FIT its content — the widest of its header and its (rendered) body cells,
   * measured live and written back into the column model (so pinning offsets stay exact). A column opts
   * out by pinning a `meta.width`; `meta.minWidth`/`meta.maxWidth` bound the fit, and content past a cap
   * follows the column's `meta.overflow`. Off by default, so existing fixed-width tables are unchanged.
   * With virtualization only the mounted rows are measured (re-fit runs on data/column/density change).
   */
  autoFitColumns?: boolean
  /** Breathing room (px) added to each auto-fit column's measured content width, so a column sized by a
   * long value isn't flush against its edge. Default 16. Bounded by the column's `meta.maxWidth`. */
  autoFitPadding?: number
}

/**
 * The renderer — a div/CSS-Grid table with sticky header, column pinning, drag-resize, optional row
 * virtualization (`@tanstack/react-virtual`), expandable detail rows and a footer. Column widths come
 * from the TanStack column model (px), so pinning offsets stay exact. Skin it via `classNames`.
 */
export function DataTableView<TData>(props: DataTableViewProps<TData>) {
  const {
    table,
    classNames,
    density = 'normal',
    emptyState,
    renderExpanded,
    getRowClassName,
    renderColumnMenu,
    unpinLabel = 'Unpin',
    onReachEnd,
    maxBodyHeight,
    minBodyHeight,
    showFooter,
    fillWidth = true,
    gridLines = 'rows',
    enableRangeSelection = false,
    autoFitColumns = false,
    autoFitPadding = 16,
  } = props

  const scrollRef = useRef<HTMLDivElement>(null)
  const rows = table.getRowModel().rows
  const leaf = table.getVisibleLeafColumns()

  // ── Auto-fit: measure each column's natural content width (header + mounted body cells) and write it
  // back into the column model, so the fixed-px template + pinning offsets stay exact. Runs on
  // data/column/density change (not on scroll), so widths don't jump as rows virtualize in/out. A column
  // with `meta.width` is pinned to that width; `meta.grow` columns stay flexible and are skipped.
  const leafSig = leaf.map((c) => c.id).join('|')
  useEffect(() => {
    if (!autoFitColumns) return
    const root = scrollRef.current
    if (!root) return
    // Measure natural widths: force content onto one line so an ellipsis/wrap doesn't hide the true size.
    root.setAttribute('data-measuring', '')
    const next: Record<string, number> = {}
    for (const column of leaf) {
      const meta = column.columnDef.meta
      if (meta?.grow) continue // flexible column — no fixed size to compute
      if (meta?.width != null) {
        next[column.id] = meta.width
        continue
      }
      // Non-resizable columns are deliberately fixed (utility columns like select/expander, or any column
      // the author locked) — keep their explicit size rather than fitting them to a checkbox/chevron.
      if (!column.getCanResize()) continue
      const cells = root.querySelectorAll<HTMLElement>(`[data-col-id="${CSS.escape(column.id)}"]`)
      // Under the measuring pass each cell is off-grid and shrunk to content, so its box width IS the
      // natural content width (+ padding). (scrollWidth would echo the fixed track, never shrinking.)
      let widest = 0
      for (const cell of cells) widest = Math.max(widest, cell.getBoundingClientRect().width)
      if (widest === 0) continue
      const floor = meta?.minWidth ?? column.columnDef.minSize ?? 0
      const cap = meta?.maxWidth ?? column.columnDef.maxSize ?? Infinity
      // Add breathing room so a column sized by a long value isn't flush against its edge — fit, but
      // comfortable. (+1 alone gave an exact, cramped fit.) Still bounded by the column's max.
      next[column.id] = Math.round(Math.min(cap, Math.max(floor, widest + autoFitPadding)))
    }
    root.removeAttribute('data-measuring')
    // Only write when something actually changed, so this never loops with the re-render it triggers.
    const current = table.getState().columnSizing
    const changed = Object.keys(next).some((id) => current[id] !== next[id])
    if (changed) table.setColumnSizing((prev) => ({ ...prev, ...next }))
    // `table` is intentionally omitted: its identity can change every render, which would re-measure (a
    // forced reflow) on every render. The real triggers are the columns, row count and density.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFitColumns, autoFitPadding, leafSig, rows.length, density])
  // Fixed px tracks (exact pinning offsets + resize). Columns with `meta.grow` stretch to absorb
  // leftover width; if none do, a trailing filler keeps short tables edge-to-edge. Either way, when the
  // columns overflow the flexible parts collapse to their min and the scroller scrolls horizontally.
  const anyGrow = leaf.some((c) => c.columnDef.meta?.grow)
  const template =
    leaf
      .map((c) => (c.columnDef.meta?.grow ? `minmax(${c.getSize()}px, 1fr)` : `${c.getSize()}px`))
      .join(' ') + (fillWidth && !anyGrow ? ' minmax(0, 1fr)' : '')
  const totalWidth = table.getTotalSize()
  const virtualize = maxBodyHeight != null
  const hasFooter = showFooter && table.getAllLeafColumns().some((c) => c.columnDef.footer != null)
  // maxHeight caps the scroller (and turns on virtualization); minHeight gives it a fixed floor so an
  // empty/short table fills the space instead of collapsing (the flex-column body grows to fill it).
  const scrollerStyle: CSSProperties = {}
  if (virtualize) scrollerStyle.maxHeight = maxBodyHeight
  if (minBodyHeight != null) scrollerStyle.minHeight = minBodyHeight

  // Excel-style rectangular range selection (row-index × leaf-column-index).
  const colIndex = new Map(leaf.map((c, i) => [c.id, i]))
  const [range, setRange] = useState<{
    anchor: { r: number; c: number }
    focus: { r: number; c: number }
  } | null>(null)
  // Text stays selectable/copyable: a range only begins on a genuine drag ACROSS cells. mousedown just
  // records an anchor; the first mouseenter into another cell with the button held starts the range and
  // suppresses text selection for its duration. A click / drag inside one cell selects text normally.
  const [dragging, setDragging] = useState(false)
  const mouseDown = useRef(false)
  const anchor = useRef<{ r: number; c: number } | null>(null)
  useEffect(() => {
    if (!enableRangeSelection) return
    const up = () => {
      mouseDown.current = false
      setDragging(false)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRange(null)
        return
      }
      if (!((e.metaKey || e.ctrlKey) && (e.key === 'c' || e.key === 'C'))) return
      // Let a real text selection or a focused field copy natively; else copy the selected cell range.
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed && sel.toString().length > 0) return
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (copyRef.current()) e.preventDefault()
    }
    document.addEventListener('mouseup', up)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mouseup', up)
      document.removeEventListener('keydown', key)
    }
  }, [enableRangeSelection])
  const bounds = range
    ? {
        minR: Math.min(range.anchor.r, range.focus.r),
        maxR: Math.max(range.anchor.r, range.focus.r),
        minC: Math.min(range.anchor.c, range.focus.c),
        maxC: Math.max(range.anchor.c, range.focus.c),
      }
    : null
  const inRange = (r: number, c: number) =>
    !!bounds && r >= bounds.minR && r <= bounds.maxR && c >= bounds.minC && c <= bounds.maxC
  const rangeStats = useMemo(() => {
    if (!bounds) return null
    const cells = (bounds.maxR - bounds.minR + 1) * (bounds.maxC - bounds.minC + 1)
    if (cells <= 1) return null
    const nums: number[] = []
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      const row = rows[r]
      if (!row) continue
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const id = leaf[c]?.id
        if (!id) continue
        const v = row.getValue(id)
        const n = typeof v === 'number' ? v : Number(v)
        if (typeof v !== 'boolean' && v != null && v !== '' && !Number.isNaN(n)) nums.push(n)
      }
    }
    const sum = nums.reduce((a, b) => a + b, 0)
    return {
      cells,
      numeric: nums.length,
      sum,
      avg: nums.length ? sum / nums.length : 0,
      min: nums.length ? Math.min(...nums) : 0,
      max: nums.length ? Math.max(...nums) : 0,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, rows, leaf])

  // Cmd/Ctrl+C copies the selected range (fired from the keydown handler in the effect above). Rebuilt
  // each render so it reads the live bounds; a column's `meta.copyValue` overrides its copied value.
  const copyRef = useRef<() => boolean>(() => false)
  copyRef.current = () => {
    if (!bounds) return false
    const grid: string[][] = []
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      const row = rows[r]
      if (!row) continue
      const line: string[] = []
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const column = leaf[c]
        if (!column) continue
        const value = column.columnDef.meta?.copyValue
          ? column.columnDef.meta.copyValue(row)
          : row.getValue(column.id)
        line.push(value == null ? '' : String(value))
      }
      grid.push(line)
    }
    if (!grid.length) return false
    writeSelectionClipboard(grid)
    return true
  }

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT[density],
    overscan: 12,
  })

  // Infinite loading: fire when the last rendered row is near the end of the data.
  const virtualItems = virtualizer.getVirtualItems()
  useEffect(() => {
    if (!virtualize || !onReachEnd) return
    const last = virtualItems[virtualItems.length - 1]
    if (last && last.index >= rows.length - 8) onReachEnd()
  }, [virtualize, onReachEnd, virtualItems, rows.length])

  const renderHeaderCell = (header: Header<TData, unknown>) => {
    const column = header.column
    const canSort = column.getCanSort()
    const sorted = column.getIsSorted()
    const pinned = column.getIsPinned()
    const align = column.columnDef.meta?.align
    const isUtility = column.id === 'select' || column.id === 'expander'
    return (
      <div
        key={header.id}
        role="columnheader"
        data-col-id={column.id}
        data-pinned={pinned || undefined}
        data-sorted={sorted || undefined}
        data-align={align || undefined}
        aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
        className={cx(
          'dt-cell dt-header-cell',
          classNames?.headerCell,
          column.columnDef.meta?.headerClassName
        )}
        style={pinStyle(column)}
      >
        {canSort ? (
          <button
            type="button"
            className="dt-header-label"
            data-can-sort
            onClick={column.getToggleSortingHandler()}
          >
            {header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext())}
            {sorted ? (
              <span className="dt-sort-ind" aria-hidden="true">
                {sorted === 'asc' ? '↑' : '↓'}
              </span>
            ) : null}
          </button>
        ) : (
          // Not a <button> when unsortable: a disabled button makes its subtree non-interactive, which
          // was swallowing clicks on interactive header content like the select-all checkbox.
          <div className="dt-header-label">
            {header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext())}
          </div>
        )}
        {pinned && !isUtility ? (
          <button
            type="button"
            className="dt-col-pin"
            data-pinned={pinned}
            aria-label={unpinLabel}
            title={unpinLabel}
            onClick={() => column.pin(false)}
          >
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
          </button>
        ) : null}
        {renderColumnMenu && !isUtility ? (
          <span className="dt-col-menu">{renderColumnMenu(column as Column<TData, unknown>)}</span>
        ) : null}
        {column.getCanResize() ? (
          <span
            role="separator"
            aria-orientation="vertical"
            className="dt-resizer"
            data-resizing={column.getIsResizing() || undefined}
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
      </div>
    )
  }

  const renderBodyCell = (cell: Cell<TData, unknown>) => {
    const column = cell.column
    const pinned = column.getIsPinned()
    const align = column.columnDef.meta?.align
    const ctx = cell.getContext()
    const cellStyle = column.columnDef.meta?.getCellStyle?.(ctx)
    const isUtility = column.id === 'select' || column.id === 'expander'
    const rangeable = enableRangeSelection && !isUtility
    const rIdx = cell.row.index
    const cIdx = colIndex.get(column.id) ?? 0

    const overflow = column.columnDef.meta?.overflow
    const overflowLines = column.columnDef.meta?.overflowLines
    const mediaFit = column.columnDef.meta?.mediaFit

    let content: ReactNode
    if (cell.getIsGrouped()) {
      content = (
        <button
          type="button"
          className="dt-group-toggle"
          data-expanded={cell.row.getIsExpanded() || undefined}
          onClick={cell.row.getToggleExpandedHandler()}
          style={{ paddingInlineStart: cell.row.depth * 12 }}
        >
          <svg
            className="dt-group-chevron"
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
          {flexRender(column.columnDef.cell, ctx)}
          <span className="dt-group-count">{cell.row.subRows.length}</span>
        </button>
      )
    } else if (cell.getIsAggregated()) {
      content = flexRender(column.columnDef.aggregatedCell ?? column.columnDef.cell, ctx)
    } else if (cell.getIsPlaceholder()) {
      content = null
    } else {
      content = flexRender(column.columnDef.cell, ctx)
    }

    // Overflow handling is opt-in: only when `meta.overflow` is set do we wrap the content in a managed
    // box (otherwise the cell renders exactly as before, so multi-child flex cells are unaffected). The
    // wrapper is what truncates/wraps; the `--dt-clamp` var drives the line cap for the wrapping modes.
    if (overflow && !cell.getIsGrouped()) {
      const clampStyle =
        overflow === 'wrap-truncate' || (overflow === 'wrap' && overflowLines != null)
          ? ({ ['--dt-clamp' as string]: String(overflowLines ?? 2) } as CSSProperties)
          : undefined
      content = (
        <div className="dt-cell-content" data-overflow={overflow} style={clampStyle}>
          {content}
        </div>
      )
    }

    return (
      <div
        key={cell.id}
        role="cell"
        data-col-id={column.id}
        data-media-fit={mediaFit || undefined}
        data-pinned={pinned || undefined}
        data-align={align || undefined}
        data-range={rangeable && inRange(rIdx, cIdx) ? '' : undefined}
        onMouseDown={
          rangeable
            ? (e) => {
                if (e.button !== 0) return
                mouseDown.current = true
                anchor.current = { r: rIdx, c: cIdx }
                setRange(null) // a fresh press clears the old range (so Cmd+C copies text, not stale cells)
              }
            : undefined
        }
        onMouseEnter={
          rangeable
            ? () => {
                const a = anchor.current
                if (!mouseDown.current || !a || (a.r === rIdx && a.c === cIdx)) return
                // Crossed into another cell with the button held → a range drag, not a text selection.
                setDragging(true)
                window.getSelection()?.removeAllRanges()
                setRange({ anchor: a, focus: { r: rIdx, c: cIdx } })
              }
            : undefined
        }
        className={cx(
          'dt-cell',
          classNames?.cell,
          column.columnDef.meta?.cellClassName,
          column.columnDef.meta?.getCellClassName?.(ctx)
        )}
        style={cellStyle ? { ...pinStyle(column), ...cellStyle } : pinStyle(column)}
      >
        {content}
      </div>
    )
  }

  const rowInner = (row: Row<TData>) => (
    <>
      <div className="dt-row" style={{ minWidth: totalWidth, gridTemplateColumns: template }}>
        {row.getVisibleCells().map(renderBodyCell)}
      </div>
      {row.getIsExpanded() && renderExpanded && !row.getIsGrouped() ? (
        <div className="dt-expanded" style={{ minWidth: totalWidth }}>
          {renderExpanded(row)}
        </div>
      ) : null}
    </>
  )

  return (
    <div
      className={cx('dt-root', classNames?.root)}
      data-density={density}
      data-grid-lines={gridLines}
      data-range-select={enableRangeSelection || undefined}
      data-range-dragging={dragging || undefined}
    >
      <div
        ref={scrollRef}
        className={cx('dt-scroller', classNames?.scroller)}
        style={scrollerStyle}
        role="table"
      >
        {/* Header */}
        <div
          className={cx('dt-header', classNames?.header)}
          role="rowgroup"
          style={{ minWidth: totalWidth }}
        >
          {table.getHeaderGroups().map((group) => (
            <div
              key={group.id}
              className={cx('dt-row dt-header-row', classNames?.headerRow)}
              role="row"
              style={{ minWidth: totalWidth, gridTemplateColumns: template }}
            >
              {group.headers.map((header) => renderHeaderCell(header))}
            </div>
          ))}
        </div>

        {/* Body */}
        {rows.length === 0 ? (
          <div className={cx('dt-empty', classNames?.empty)}>{emptyState}</div>
        ) : virtualize ? (
          <div
            className={cx('dt-body', classNames?.body)}
            role="rowgroup"
            style={{
              minWidth: totalWidth,
              height: virtualizer.getTotalSize(),
              position: 'relative',
            }}
          >
            {virtualItems.map((vi) => {
              const row = rows[vi.index]
              return (
                <div
                  key={row.id}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  role="row"
                  data-selected={row.getIsSelected() || undefined}
                  data-grouped={row.getIsGrouped() || undefined}
                  className={cx('dt-rowwrap', classNames?.row, getRowClassName?.(row))}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  {rowInner(row)}
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className={cx('dt-body', classNames?.body)}
            role="rowgroup"
            style={{ minWidth: totalWidth }}
          >
            {rows.map((row) => (
              <div
                key={row.id}
                role="row"
                data-selected={row.getIsSelected() || undefined}
                data-grouped={row.getIsGrouped() || undefined}
                className={cx('dt-rowwrap', classNames?.row, getRowClassName?.(row))}
              >
                {rowInner(row)}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {hasFooter ? (
          <div
            className={cx('dt-footer', classNames?.footer)}
            role="rowgroup"
            style={{ minWidth: totalWidth }}
          >
            {table.getFooterGroups().map((group) => (
              <div
                key={group.id}
                className={cx('dt-row dt-footer-row', classNames?.footerRow)}
                role="row"
                style={{ minWidth: totalWidth, gridTemplateColumns: template }}
              >
                {group.headers.map((header) => (
                  <div
                    key={header.id}
                    role="cell"
                    data-pinned={header.column.getIsPinned() || undefined}
                    data-align={header.column.columnDef.meta?.align || undefined}
                    className={cx('dt-cell dt-footer-cell', classNames?.footerCell)}
                    style={pinStyle(header.column)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {enableRangeSelection && rangeStats ? (
        <div className={cx('dt-statusbar', classNames?.statusBar)}>
          <span>{rangeStats.cells} cells</span>
          {rangeStats.numeric > 0 ? (
            <>
              <span>Sum {fmtNum(rangeStats.sum)}</span>
              <span>Avg {fmtNum(rangeStats.avg)}</span>
              <span>Min {fmtNum(rangeStats.min)}</span>
              <span>Max {fmtNum(rangeStats.max)}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export type DataTableProps<TData> = UseDataTableOptions<TData> &
  Omit<DataTableViewProps<TData>, 'table'>

/** Batteries-included preset: builds the table state and renders it. */
export function DataTable<TData>(props: DataTableProps<TData>) {
  const table = useDataTable(props)
  return (
    <DataTableView
      table={table}
      classNames={props.classNames}
      density={props.density}
      emptyState={props.emptyState}
      renderExpanded={props.renderExpanded}
      getRowClassName={props.getRowClassName}
      renderColumnMenu={props.renderColumnMenu}
      onReachEnd={props.onReachEnd}
      maxBodyHeight={props.maxBodyHeight}
      minBodyHeight={props.minBodyHeight}
      showFooter={props.showFooter}
      fillWidth={props.fillWidth}
      gridLines={props.gridLines}
      enableRangeSelection={props.enableRangeSelection}
    />
  )
}
