'use client'

import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from 'react'

type RippleInstance = { id: number; x: number; y: number; size: number }

/**
 * A Telegram/Material-style tap ripple, for LINK-like controls (sidebar items, nav buttons) so a click
 * gives immediate "pressed / loading" feedback before the route change lands.
 *
 * Usage: spread `onPointerDown` onto the clickable element, make it `relative overflow-hidden`, and render
 * `ripple` as its last child (an absolutely-positioned overlay):
 *
 *   const { onPointerDown, ripple } = useRipple()
 *   <Link onPointerDown={onPointerDown} className="relative overflow-hidden …">{children}{ripple}</Link>
 *
 * The wave tints to `currentColor` by default, so it reads on any surface. Respects reduced-motion.
 */
export const useRipple = (opts?: { duration?: number; color?: string }) => {
  const duration = opts?.duration ?? 600
  const [ripples, setRipples] = useState<RippleInstance[]>([])
  const nextId = useRef(0)

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return // primary button / touch only
      const el = event.currentTarget
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      const id = nextId.current++
      setRipples((prev) => [...prev, { id, x, y, size }])
      // Drop it once the animation has played, so the DOM doesn't accumulate spent ripples.
      window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), duration + 50)
    },
    [duration]
  )

  const ripple: ReactNode = (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ui-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            animationDuration: `${duration}ms`,
            ...(opts?.color ? { backgroundColor: opts.color } : {}),
          }}
        />
      ))}
    </span>
  )

  return { onPointerDown, ripple }
}
