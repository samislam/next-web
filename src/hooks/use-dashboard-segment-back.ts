'use client'

import { useEffect } from 'react'
import { comparePath } from 'compare-path'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/lib/next-intl/navigation'
import { usePathname } from '@/lib/next-intl/navigation'
import { stripLocale } from '@/lib/next-intl/strip-locale'

const DASHBOARD_ROUTE_HISTORY_KEY = 'dashboard-route-history'
const DASHBOARD_ROUTE_HISTORY_LIMIT = 50

const getCurrentUrl = (pathname: string, searchParams: URLSearchParams) => {
  const queryString = searchParams.toString()

  return queryString ? `${pathname}?${queryString}` : pathname
}

const matchesCatchPattern = (catchPattern: string, pathname: string) => {
  const normalizedPathname = stripLocale(pathname)
  const normalizedCatchPattern = stripLocale(catchPattern)
  const exactBasePattern = normalizedCatchPattern.endsWith('/**')
    ? normalizedCatchPattern.slice(0, -3)
    : null

  return (
    comparePath(normalizedCatchPattern, normalizedPathname)[0] ||
    (exactBasePattern ? normalizedPathname === exactBasePattern : false)
  )
}

const getPathnameFromUrl = (url: string) => {
  return url.split('?')[0]
}

const getParentPathname = (pathname: string) => {
  const normalizedPathname = stripLocale(pathname)
  const segments = normalizedPathname.split('/').filter(Boolean)

  if (segments.length <= 1) return '/'

  return `/${segments.slice(0, -1).join('/')}`
}

const readDashboardRouteHistory = () => {
  if (typeof window === 'undefined') return []

  try {
    const storedValue = window.sessionStorage.getItem(DASHBOARD_ROUTE_HISTORY_KEY)
    if (!storedValue) return []

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value) => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

const writeDashboardRouteHistory = (history: string[]) => {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(DASHBOARD_ROUTE_HISTORY_KEY, JSON.stringify(history))
}

/**
 * Tracks dashboard-only navigation history and exposes a helper that moves one pathname segment
 * back at a time, ignoring query-string-only hops.
 */
export const useDashboardSegmentBack = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentUrl = getCurrentUrl(pathname, searchParams)

  useEffect(() => {
    const currentHistory = readDashboardRouteHistory()
    if (currentHistory[currentHistory.length - 1] === currentUrl) return

    const nextHistory = [...currentHistory, currentUrl].slice(-DASHBOARD_ROUTE_HISTORY_LIMIT)
    writeDashboardRouteHistory(nextHistory)
  }, [currentUrl])

  /**
   * Navigates to the latest recorded route within the current history chain, ignoring query-only
   * duplicates, and falls back to the direct parent pathname when needed.
   */
  const goBackFromSegment = (catchPattern: string) => {
    const currentHistory = readDashboardRouteHistory()
    const nextHistory = [...currentHistory]
    const currentPathname = getPathnameFromUrl(nextHistory[nextHistory.length - 1] ?? currentUrl)

    while (nextHistory.length) {
      const latestUrl = nextHistory[nextHistory.length - 1]
      if (getPathnameFromUrl(latestUrl) !== currentPathname) break
      nextHistory.pop()
    }

    while (nextHistory.length) {
      const latestUrl = nextHistory[nextHistory.length - 1]
      if (matchesCatchPattern(catchPattern, getPathnameFromUrl(latestUrl))) break
      nextHistory.pop()
    }

    const previousUrl = nextHistory[nextHistory.length - 1]
    const fallbackPathname = getParentPathname(currentPathname)
    writeDashboardRouteHistory(nextHistory)

    router.push(previousUrl ?? fallbackPathname)
  }

  /**
   * Navigates to the latest recorded route outside the provided catch pattern, preserving the
   * previous sidebar behavior for nested dashboard sidebars.
   */
  const leaveSegment = (catchPattern: string) => {
    const currentHistory = readDashboardRouteHistory()
    const nextHistory = [...currentHistory]

    while (nextHistory.length) {
      const latestUrl = nextHistory[nextHistory.length - 1]
      if (!matchesCatchPattern(catchPattern, getPathnameFromUrl(latestUrl))) break
      nextHistory.pop()
    }

    const previousUrl = nextHistory[nextHistory.length - 1]
    writeDashboardRouteHistory(nextHistory)

    router.push(previousUrl ?? '/')
  }

  return {
    goBackFromSegment,
    leaveSegment,
  }
}
