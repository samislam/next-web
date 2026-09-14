import { pageDefs } from './pages.config'
import { DashboardBreadcrumbsConfig } from '@samislam/dashboard-layout'
import { DashboardBreadcrumbRewriteAlias } from '@samislam/dashboard-layout'

/**
 * How a pathname becomes a breadcrumb trail.
 *
 * Each URL segment is looked up in `segments` by its camelCased name, so `/sale-channels/abc/users`
 * resolves `saleChannels` → (dynamic id) → `users`. A segment with no entry falls back to the raw
 * text, which is usually the signal that you forgot to register it here.
 *
 * Dynamic segments (an id) have no static label — pages supply theirs at runtime with
 * `useRegisterBreadcrumbLabels` / the `RegisterBreadcrumbLabels` component, so the trail can read
 * "Acme Corp" instead of a cuid.
 *
 * `rewriteAliases` rewrites one path prefix to another before resolution — useful when a route's URL
 * shape and its breadcrumb trail deliberately differ.
 */
export const dashboardBreadcrumbsConfig = {
  hideOnIndex: true,
  indexHref: pageDefs.home.href,
  rewriteAliases: [] as DashboardBreadcrumbRewriteAlias[],
  segments: {
    home: {
      label: pageDefs.home.label,
      icon: pageDefs.home.icon,
      href: pageDefs.home.href,
    },
    login: {
      label: pageDefs.login.label,
      icon: pageDefs.login.icon,
      href: pageDefs.login.href,
    },
  },
} as const satisfies DashboardBreadcrumbsConfig
