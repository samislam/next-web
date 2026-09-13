import { pageDefs } from './pages.config'
import { getTranslate } from '@/lib/tolgee/tolgee-server'
import { createDashboardConfig } from '@/components/layouts/dashboard-layout'

/**
 * The dashboard shell's navigation.
 *
 * Built on the server (hence async) so nav labels can be translated and badges can carry live counts
 * — fetch them here, in parallel, and always failure-tolerant: a badge that throws must never take
 * the sidebar down with it.
 *
 * ```ts
 * const [t, openCount] = await Promise.all([
 *   getTranslate(),
 *   mainApiServer.v1.things.list({ status: 'open', perPage: 1 }).catch(() => null),
 * ])
 * ```
 *
 * Nav items can nest three ways:
 * - `branch`  — an inline accordion in the SAME list; auto-expands when a child is active.
 * - `sidebar` — a drill-in that REPLACES the sidebar body, with a back button.
 * - `extraSidebars` — a sidebar keyed on a path pattern, for sections that aren't top-level items.
 */
export const getDashboardConfig = async () => {
  const t = await getTranslate()

  return createDashboardConfig({
    extraSidebars: [],
    sidebar: {
      navigationList: [
        {
          href: pageDefs.home.href,
          label: t(pageDefs.home.label),
          icon: 'mdi:mdiHome',
          // The home item must not swallow every nested route as "active".
          catchNestedSegments: false,
        },
      ],
    },
  })
}
