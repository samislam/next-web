'use client'

import ms from 'ms'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/shadcn/utils'
import { useNavigationProgress, useNavigationSettle } from '@/hooks/use-navigation-progress'

/**
 * How far the bar is allowed to creep on its own. It must never reach the end by itself — the last
 * stretch is reserved for the moment the new route actually commits, so a full bar always means
 * "arrived" rather than "still guessing".
 */
const CREEP_CEILING = 90

/** How often the creep advances while waiting. */
const CREEP_INTERVAL = ms('180ms')

/** How long the filled bar lingers before fading, so a fast navigation still reads as a completion. */
const SETTLE_DURATION = ms('300ms')

/**
 * Nothing client-side reliably reports a *cancelled* navigation (tapping the link for the page you
 * are already on, or a transition Next drops), so the bar would hang. Give up after this instead.
 */
const BAIL_OUT_AFTER = ms('10s')

/**
 * The thin loading bar under the topnav.
 *
 * Start comes from the shared `Link` / `useRouter` wrappers; completion is the URL settling, which in
 * the App Router is the point where the new route has committed and painted.
 */
export const NavigationProgressBar = () => {
  const isNavigating = useNavigationProgress((state) => state.isNavigating)
  const navigationId = useNavigationProgress((state) => state.navigationId)
  const finish = useNavigationProgress((state) => state.finish)
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useNavigationSettle()

  // Departure: reset to a visible sliver, then creep toward the ceiling in ever-smaller steps so the
  // bar keeps moving on a slow route without ever implying it is nearly done.
  useEffect(() => {
    if (!isNavigating) return

    setIsVisible(true)
    setProgress(8)

    const creep = setInterval(() => {
      setProgress((current) =>
        Math.min(CREEP_CEILING, current + (CREEP_CEILING - current) / 10 + 0.4)
      )
    }, CREEP_INTERVAL)
    const bailOut = setTimeout(finish, BAIL_OUT_AFTER)

    return () => {
      clearInterval(creep)
      clearTimeout(bailOut)
    }
  }, [isNavigating, navigationId, finish])

  // Completion: fill, hold briefly, then fade out and rewind for the next navigation.
  useEffect(() => {
    if (isNavigating || !isVisible) return

    setProgress(100)
    const settle = setTimeout(() => {
      setIsVisible(false)
      setProgress(0)
    }, SETTLE_DURATION)

    return () => clearTimeout(settle)
  }, [isNavigating, isVisible])

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 transition-opacity',
        // Appear at once so the bar answers the click immediately; fade out slowly so the finish
        // reads as an ending rather than a flicker.
        isVisible ? 'opacity-100 duration-0' : 'opacity-0 duration-300'
      )}
    >
      <div
        style={{ width: `${progress}%` }}
        className="bg-primary shadow-primary/50 h-full rounded-r-full shadow-[0_0_8px] transition-[width] duration-200 ease-out"
      />
    </div>
  )
}
