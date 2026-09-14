import { comparePath } from 'compare-path'
import { stripLocale } from '@/lib/next-intl/strip-locale'
import { LibraryIcon } from '@/components/ui/samislam/lib-icon'

/**
 * A single dashboard navigation item.
 *
 * Items may optionally:
 * - catch nested segments under their `href`
 * - define a custom `catchPattern`
 * - expose a nested sidebar that replaces the main sidebar body while active
 */
export type DashboardNavItem = {
  /** Where the item navigates. Omitted on a `branch` parent, which only expands/collapses. */
  href?: string
  label: string
  icon: LibraryIcon
  badge?: string
  catchPattern?: string
  catchNestedSegments?: boolean
  /**
   * Hide this item without removing it from the config. An app with an authorization model typically
   * computes this from the signed-in user's permissions; the shell itself has no opinion about how.
   * A hidden parent hides its nested sidebar and branch with it.
   */
  hidden?: boolean
  /**
   * A nested sidebar that REPLACES the current sidebar body when this item is active (drill-in, with a
   * back button). Used for deep sections like System Settings.
   */
  sidebar?: {
    navigationList: DashboardNavItem[]
  }
  /**
   * An inline expandable group rendered in the SAME sidebar list (accordion). The parent is a toggle
   * (no `href`); its children render indented below when expanded. Auto-expands when a child is active.
   */
  branch?: {
    navigationList: DashboardNavItem[]
  }
}

/**
 * A standalone sidebar override that becomes active when `catchPattern` matches the pathname.
 *
 * This is useful for route groups that do not already exist as a main sidebar item, such as `/me`.
 */
/** An identity row shown at the top of a (dynamic) nested sidebar — a placeholder avatar (the
 * `fallback` initial) + a name. Used to show e.g. the sale channel and the user being managed. */
export type DashboardSidebarHeaderItem = {
  name: string
  /** Short text rendered inside the avatar circle (e.g. the first letter). */
  fallback: string
  /** Visual emphasis: the primary entity (channel) vs a secondary one (user). */
  emphasis?: 'primary' | 'secondary'
  /** Authenticated image path (e.g. the channel avatar); falls back to the initial when absent. */
  avatarPath?: string
  /**
   * Where the name navigates. The header names the entity whose pages you are inside, so it is the
   * obvious way back to that entity's own overview — from a channel user's orders to the channel,
   * or to that user's overview, without going through the breadcrumb.
   */
  href?: string
}

export type DashboardExtraSidebar = {
  catchPattern: string
  navigationList: DashboardNavItem[]
  /** Optional identity header rendered above the back button. */
  header?: DashboardSidebarHeaderItem[]
  /** Suppress the "back" button — e.g. the channel sidebar, which is left via the topnav switcher. */
  hideBackButton?: boolean
}

/**
 * Dashboard shell configuration.
 */
export type DashboardConfig = {
  extraSidebars?: DashboardExtraSidebar[]
  sidebar: {
    navigationList: DashboardNavItem[]
  }
}

/**
 * Typed helper for building dashboard config objects.
 */
export const createDashboardConfig = (config: DashboardConfig) => {
  return config
}

/**
 * Drops the nav items marked `hidden`, recursing into nested sidebars and inline groups, and removes
 * a group that ended up empty. Call it in the sidebar after computing visibility for the current user.
 */
export const filterVisibleNav = (items: DashboardNavItem[]): DashboardNavItem[] =>
  items
    .filter((item) => !item.hidden)
    .map((item) => {
      let next = item
      if (item.sidebar) {
        next = {
          ...next,
          sidebar: {
            ...item.sidebar,
            navigationList: filterVisibleNav(item.sidebar.navigationList),
          },
        }
      }
      if (item.branch) {
        next = {
          ...next,
          branch: {
            ...item.branch,
            navigationList: filterVisibleNav(item.branch.navigationList),
          },
        }
      }
      return next
    })
    .filter((item) => !item.branch || item.branch.navigationList.length > 0)

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

/**
 * Checks whether a dashboard navigation item should be treated as active for a pathname.
 */
export const isDashboardNavItemActive = (item: DashboardNavItem, pathname: string): boolean => {
  const normalizedPathname = stripLocale(pathname)

  if (item.href && normalizedPathname === stripLocale(item.href)) {
    return true
  }

  if (item.catchPattern && matchesCatchPattern(item.catchPattern, normalizedPathname)) {
    return true
  }

  const nestedCatchPattern =
    item.href && item.href !== '/' && item.catchNestedSegments !== false ? item.href + '/**' : null

  if (nestedCatchPattern && matchesCatchPattern(nestedCatchPattern, normalizedPathname)) {
    return true
  }

  // A branch (inline group) is active when any of its children is active — so it highlights and
  // auto-expands to reveal the active page.
  if (item.branch) {
    return item.branch.navigationList.some((child) =>
      isDashboardNavItemActive(child, normalizedPathname)
    )
  }

  return false
}

/**
 * Resolves the sidebar override for the current pathname.
 *
 * Resolution order:
 * - explicit `extraSidebars` (a matching one is a deliberate, usually more specific override, so it
 *   wins — this is what lets a deep section like `/system-settings/integrations/telegram` replace
 *   the broader System Settings nested sidebar)
 * - nested sidebars declared inline on main sidebar items
 */
export const resolveActiveExtraSidebar = (config: DashboardConfig, pathname: string) => {
  const activeExtraSidebar = config.extraSidebars?.find((extraSidebar) =>
    matchesCatchPattern(extraSidebar.catchPattern, pathname)
  )

  if (activeExtraSidebar) return activeExtraSidebar

  const activeNestedSidebarItem = config.sidebar.navigationList.find((item) => {
    if (!item.sidebar) return false
    return isDashboardNavItemActive(item, pathname)
  })

  if (activeNestedSidebarItem?.sidebar) {
    return {
      catchPattern: activeNestedSidebarItem.catchPattern ?? activeNestedSidebarItem.href + '/**',
      navigationList: activeNestedSidebarItem.sidebar.navigationList,
    }
  }

  return undefined
}
