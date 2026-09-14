import { LibraryIcon } from '@/components/ui/samislam/lib-icon'

export type DashboardBreadcrumbDef = {
  href: string
  label: string
  icon?: LibraryIcon
}

export type DashboardBreadcrumbRewriteAlias = {
  from: string
  to: string
}

export type DashboardBreadcrumbsConfig = {
  hideOnIndex: boolean
  indexHref: string
  rewriteAliases?: DashboardBreadcrumbRewriteAlias[]
  segments: Record<string, DashboardBreadcrumbDef>
}
