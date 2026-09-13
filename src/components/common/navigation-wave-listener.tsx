'use client'

import ms from 'ms'
import { useCallback, useEffect, useRef } from 'react'
import { useNavigationProgress, useNavigationSettle } from '@/hooks/use-navigation-progress'

/**
 * Hold the wave at least this long. A route served from cache can commit in under 100ms, and a wave
 * that brief reads as a glitch rather than as feedback — better to finish the gesture.
 */
const MIN_WAVE = ms('500ms')

/**
 * Give up after this. A click can fail to become a navigation in ways nothing reports back (an
 * unchanged href, a transition Next drops), and a wave with no end is worse than no wave.
 */
const MAX_WAVE = ms('6s')

const WAVE_CLASSES = ['wave-loading', 'wave-loading--button', 'wave-loading-text']

const isSameOrigin = (href: string) => {
  if (href.startsWith('/')) return true
  try {
    return new URL(href, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Keeps the clicked element waving for as long as the route it points at is loading.
 *
 * This is the sustained half of the tap feedback: `useRipple` answers the press and fades in 600ms,
 * while the wave says "still working" until the new page commits. Both can run on the same element.
 *
 * It listens on the document rather than wrapping `Link`, because the thing to animate is the element
 * the user actually pressed, which only the DOM knows. Components steer it with three attributes:
 *
 *  - `data-wave-target`      — wave this element instead of the anchor (e.g. a button wrapping a link)
 *  - `data-wave-text-target` — shimmer this element's TEXT, for targets with no surface of their own
 *  - `data-wave-ignore`      — this subtree is not the target; keep looking outward
 *
 * With no attributes the anchor itself waves, so a plain `<Link>` needs no opt-in.
 */
export const NavigationWaveListener = () => {
  const isNavigating = useNavigationProgress((state) => state.isNavigating)
  const navigationId = useNavigationProgress((state) => state.navigationId)
  const wavingElements = useRef<HTMLElement[]>([])
  const startedAt = useRef<number | null>(null)
  const timeout = useRef<number | null>(null)
  const sawNavigation = useRef(false)

  useNavigationSettle()

  const clearWave = useCallback(() => {
    if (timeout.current) {
      window.clearTimeout(timeout.current)
      timeout.current = null
    }
    wavingElements.current.forEach((element) => element.classList.remove(...WAVE_CLASSES))
    wavingElements.current = []
    startedAt.current = null
    sawNavigation.current = false
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Anything that isn't a plain left-click opens elsewhere (new tab, context menu) and leaves this
      // page exactly where it is, so there is nothing to wait for.
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')?.trim()
      if (!href || href.startsWith('#')) return
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (!isSameOrigin(href)) return

      // Nearest wins, so an inner opt-out is only honoured while nothing more specific asked for the
      // wave — otherwise `data-wave-ignore` on a link's icon would silence the whole item.
      const textTarget =
        (target?.closest('[data-wave-text-target]') as HTMLElement | null) ??
        (anchor.querySelector('[data-wave-text-target]') as HTMLElement | null)
      const boxTarget = target?.closest('[data-wave-target]') as HTMLElement | null
      if (!textTarget && !boxTarget && target?.closest('[data-wave-ignore]')) return

      const element =
        textTarget ??
        boxTarget ??
        (target?.closest('button') as HTMLElement | null) ??
        (anchor.querySelector('button') as HTMLElement | null) ??
        anchor

      clearWave()
      wavingElements.current = [element]
      startedAt.current = Date.now()

      if (element.hasAttribute('data-wave-text-target')) {
        element.classList.add('wave-loading-text')
      } else {
        element.classList.add('wave-loading')
        // A filled button needs the inverted sweep or the wave vanishes into its own background.
        if (element.tagName === 'BUTTON') element.classList.add('wave-loading--button')
      }

      timeout.current = window.setTimeout(clearWave, MAX_WAVE)
    }

    // Capture, so the wave is on the element before React's own handlers run and the route starts.
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [clearWave])

  // Stop when the navigation the click started reports done, holding to the minimum first.
  //
  // `navigationId` is in the deps, not just `isNavigating`: clicking a second link while the first is
  // still in flight leaves `isNavigating` true throughout, so without it this effect would never re-run
  // to adopt the new wave, and that wave would hang until the bail-out.
  useEffect(() => {
    if (isNavigating) {
      if (wavingElements.current.length) sawNavigation.current = true
      return
    }
    if (!wavingElements.current.length || !sawNavigation.current) return

    const elapsed = Date.now() - (startedAt.current ?? Date.now())
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(clearWave, Math.max(0, MIN_WAVE - elapsed))
  }, [isNavigating, navigationId, clearWave])

  // A wave outlives the element it is on if the page unmounts mid-flight; the classes go with it, but
  // the pending timer should not.
  useEffect(() => clearWave, [clearWave])

  return null
}
