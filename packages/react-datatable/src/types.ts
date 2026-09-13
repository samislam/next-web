import type { CSSProperties } from 'react'
import type { CellContext, Row, RowData } from '@tanstack/react-table'

export type DataTableDensity = 'compact' | 'normal' | 'spacious'
export type DataTableGridLines = 'none' | 'rows' | 'columns' | 'both'
export type ColumnAlign = 'start' | 'center' | 'end'
export type FilterVariant = 'text' | 'number' | 'range' | 'select' | 'boolean'

// Type the `meta` bag on every column so consumers get autocomplete for our extensions.
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Horizontal alignment of the cell + header content. */
    align?: ColumnAlign
    /** Let this column stretch to absorb leftover width (a CSS flex column). */
    grow?: boolean
    /** Fixed column width (px). Overrides auto-fit — the column is pinned to exactly this width. */
    width?: number
    /** Lower bound (px) — floor for auto-fit measurement AND the drag-resize handle. */
    minWidth?: number
    /** Upper bound (px) — cap for auto-fit AND resize; content past it follows {@link overflow}. */
    maxWidth?: number
    /**
     * How a BODY cell handles content wider than the (width- or maxWidth-)constrained column:
     *   - `truncate`      — one line, cut with an ellipsis (…). The sensible default for capped text.
     *   - `clip`          — one line, hard cut, no ellipsis.
     *   - `wrap`          — wrap onto as many lines as needed (optionally capped by {@link overflowLines}).
     *   - `wrap-truncate` — wrap up to {@link overflowLines} lines (default 2), then ellipsis.
     * Opt-in: set it and the cell content is wrapped in a managed box; leave it unset and the cell
     * renders exactly as before (no layout change). Meaningless without a width/maxWidth to overflow.
     */
    overflow?: 'truncate' | 'clip' | 'wrap' | 'wrap-truncate'
    /** Line cap for `overflow: 'wrap' | 'wrap-truncate'` (default 2 for wrap-truncate; uncapped for wrap). */
    overflowLines?: number
    /**
     * How a non-text cell (image / media / component) fits a constrained column:
     *   - `clip`    — overflow is hidden (the default cell behavior, stated explicitly).
     *   - `contain` — a media child (`img`/`video`/`svg`) scales to fit, keeping aspect ratio.
     *   - `cover`   — a media child fills the box, cropping the overflow.
     */
    mediaFit?: 'clip' | 'contain' | 'cover'
    /** Which filter widget the toolbar should render for this column. */
    filterVariant?: FilterVariant
    /** Extra class on every BODY cell of this column (color spans, mono, etc.). */
    cellClassName?: string
    /** Extra class on this column's header cell. */
    headerClassName?: string
    /** Value-driven inline style for every body cell — conditional formatting / heatmaps. */
    getCellStyle?: (ctx: CellContext<TData, TValue>) => CSSProperties | undefined
    /** Value-driven class for every body cell. */
    getCellClassName?: (ctx: CellContext<TData, TValue>) => string | undefined
    /** What this column contributes when a selected range is copied (Cmd/Ctrl+C). Defaults to the
     * column's raw value — set it on display columns (or to override formatting) so the copy is
     * meaningful. */
    copyValue?: (row: Row<TData>) => string
  }
}

/**
 * Class-name slots — the primary theming hook. Every structural part accepts one, so a host app
 * (shadcn/Tailwind here) skins the table without forking it. Pair with the `--dt-*` CSS tokens and the
 * `data-*` attributes each part exposes (`data-sorted`, `data-pinned`, `data-selected`, `data-density`).
 */
export type DataTableClassNames = Partial<{
  root: string
  scroller: string
  header: string
  headerRow: string
  headerCell: string
  body: string
  row: string
  cell: string
  footer: string
  footerRow: string
  footerCell: string
  statusBar: string
  empty: string
}>
