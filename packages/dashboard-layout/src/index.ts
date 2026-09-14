// The dashboard shell — sidebar, topnav, breadcrumbs, navigation progress — plus the error screens
// and tabs layout that go with it. See README.md for the app coupling that still has to be undone
// before this can live outside the repo.

export * from './dashboard-layout'
export type {
  DashboardBreadcrumbDef,
  DashboardBreadcrumbRewriteAlias,
  DashboardBreadcrumbsConfig,
} from './dashboard-layout/types/dashboard-breadcrumbs.types'

export { ErrorScreenShell } from './error-screens/error-screen-shell'
export { SessionExpiredErrorScreen } from './error-screens/session-expired-error-screen'
export { UnknownErrorScreen } from './error-screens/unknown-error-screen'

export * from './tabs-layout'
