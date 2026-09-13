import type { CSSProperties, ReactNode } from 'react'

/** In-cell visualization kit — self-contained SVG/CSS, no dependencies. Use inside a column `cell`. */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const frac = (value: number, min: number, max: number) =>
  max <= min ? 0 : clamp01((value - min) / (max - min))

/** A horizontal bar that fills proportionally, with the value laid over it. */
export function DataBar({
  value,
  min = 0,
  max,
  color = 'color-mix(in oklab, currentColor 20%, transparent)',
  align = 'start',
  children,
  className,
}: {
  value: number
  min?: number
  max: number
  color?: string
  align?: 'start' | 'end'
  children?: ReactNode
  className?: string
}) {
  const pct = frac(value, min, max) * 100
  return (
    <div className={className} style={{ position: 'relative', width: '100%' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          insetBlock: 2,
          insetInlineStart: align === 'start' ? 0 : undefined,
          insetInlineEnd: align === 'end' ? 0 : undefined,
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
        }}
      />
      <span
        style={{
          position: 'relative',
          display: 'block',
          textAlign: align === 'end' ? 'end' : 'start',
        }}
      >
        {children ?? value}
      </span>
    </div>
  )
}

/** A two-color heat value (emerald→red by default). Feed to `meta.getCellStyle` for a heatmap cell. */
export function heatColor(
  value: number,
  opts: {
    min: number
    max: number
    from?: [number, number, number]
    to?: [number, number, number]
    alpha?: number
  }
): string {
  const t = frac(value, opts.min, opts.max)
  const from = opts.from ?? [16, 185, 129]
  const to = opts.to ?? [239, 68, 68]
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t)
  return `rgba(${mix(from[0], to[0])}, ${mix(from[1], to[1])}, ${mix(from[2], to[2])}, ${opts.alpha ?? 0.16})`
}

/** ↑/↓ trend: a colored, arrowed number (green up, red down). */
export function TrendCell({
  value,
  format,
  className,
}: {
  value: number
  format?: (n: number) => string
  className?: string
}) {
  const up = value >= 0
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        fontWeight: 600,
        color: up ? '#059669' : '#dc2626',
      }}
    >
      <span aria-hidden>{up ? '▲' : '▼'}</span>
      {format ? format(Math.abs(value)) : Math.abs(value)}
    </span>
  )
}

/** Filled/empty star rating. */
export function Rating({ value, max = 5 }: { value: number; max?: number }) {
  const filled = Math.max(0, Math.min(max, Math.round(value)))
  return (
    <span aria-label={`${value} of ${max}`} style={{ letterSpacing: 1, whiteSpace: 'nowrap' }}>
      <span style={{ color: '#f59e0b' }}>{'★'.repeat(filled)}</span>
      <span style={{ opacity: 0.25 }}>{'★'.repeat(max - filled)}</span>
    </span>
  )
}

/** A thin progress bar (0..max). */
export function ProgressBar({
  value,
  max = 100,
  color = '#3b82f6',
}: {
  value: number
  max?: number
  color?: string
}) {
  const pct = frac(value, 0, max) * 100
  return (
    <div
      style={{
        width: '100%',
        height: 6,
        borderRadius: 999,
        background: 'color-mix(in oklab, currentColor 12%, transparent)',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  )
}

/** A tiny inline sparkline — bars or line. */
export function Sparkline({
  data,
  width = 84,
  height = 24,
  kind = 'bar',
  color = '#3b82f6',
}: {
  data: number[]
  width?: number
  height?: number
  kind?: 'bar' | 'line'
  color?: string
}) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const span = max - min || 1
  if (kind === 'line') {
    const pts = data
      .map(
        (v, i) => `${(i / (data.length - 1 || 1)) * width},${height - ((v - min) / span) * height}`
      )
      .join(' ')
    return (
      <svg width={width} height={height} aria-hidden style={{ display: 'block' }}>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  const bw = width / data.length
  return (
    <svg width={width} height={height} aria-hidden style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = ((v - min) / span) * height
        return (
          <rect
            key={i}
            x={i * bw + 0.5}
            y={height - h}
            width={Math.max(1, bw - 1.5)}
            height={h}
            rx={1}
            fill={color}
          />
        )
      })}
    </svg>
  )
}

/** Colored status dot (icon-set style) chosen by threshold. */
export function StatusDot({ color, label }: { color: string; label?: string }): ReactNode {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
    </span>
  )
}

export type { CSSProperties }
