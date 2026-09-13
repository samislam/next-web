'use client'

import { useRegisterBreadcrumbLabels } from '@/components/layouts/dashboard-layout'

/** Registers path→label overrides for the dashboard breadcrumbs while mounted (renders nothing). */
export const RegisterBreadcrumbLabels = (props: { labels: Record<string, string> }) => {
  useRegisterBreadcrumbLabels(props.labels)
  return null
}
