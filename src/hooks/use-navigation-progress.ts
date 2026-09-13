'use client'

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { useSearchParams } from 'next/navigation'
import { usePathname } from '@/lib/next-intl/navigation'

export interface NavigationProgressStore {
  /**
   * Bumped on every `start()`. Consumers key their animation off this, so clicking a second link
   * while the first is still in flight restarts the run instead of resuming a stale one.
   */
  navigationId: number
  isNavigating: boolean
  start: () => void
  finish: () => void
}

/**
 * Tracks whether a client-side route transition is in flight, so the dashboard can show a progress
 * bar under the topnav and keep the clicked element waving while it loads.
 *
 * It is a store rather than a context because the two sides live far apart: `start()` is called from
 * the shared `Link`/`useRouter` wrappers in `@/lib/next-intl/navigation`, which are used well outside
 * the dashboard tree, while the indicators render inside the dashboard layout. A store means neither
 * has to care whether a provider happens to sit between them.
 */
export const useNavigationProgress = create<NavigationProgressStore>((set, get) => ({
  navigationId: 0,
  isNavigating: false,
  start: () => set({ navigationId: get().navigationId + 1, isNavigating: true }),
  finish: () => set({ isNavigating: false }),
}))

/**
 * Finishes the navigation when the URL settles on something new — in the App Router that is the point
 * where the next route has committed and painted.
 *
 * Search params count, not just the pathname: half the navigations in this dashboard only move a
 * filter or a page number, and watching the pathname alone would leave those running until the
 * caller's own bail-out fired.
 *
 * Safe to call from more than one component — `finish()` is idempotent, so each indicator can own its
 * completion detection without them fighting over who reports first. Requires a `<Suspense>` boundary,
 * because it reads `useSearchParams`.
 */
export const useNavigationSettle = () => {
  const finish = useNavigationProgress((state) => state.finish)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const destination = `${pathname}?${searchParams}`
  const settledDestination = useRef(destination)

  // Comparing against a ref (rather than reacting to every render) keeps a navigation that ends on the
  // URL it started from — a rejected route guard, say — from finishing itself early.
  useEffect(() => {
    if (settledDestination.current === destination) return
    settledDestination.current = destination
    finish()
  }, [destination, finish])
}
