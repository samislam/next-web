'use client'

import { cn } from '@/lib/shadcn/utils'
import { SidebarBody } from './sidebar-body'
import { SidebarHeader } from './sidebar-header'
import { SidebarFooter } from './sidebar-footer'
import { DashboardNavItem, DashboardSidebarHeaderItem } from './dashboard-utils'

type DashboardSidebarProps = {
  navItems: DashboardNavItem[]
  sidebarKey: string
  mobile?: boolean
  compact?: boolean
  onNavigate?: () => void
  showExtraSidebarToggle?: boolean
  extraSidebarCatchPattern?: string
  onBackFromExtraSidebar?: () => void
  header?: DashboardSidebarHeaderItem[]
}

export const DashboardSidebar = (props: DashboardSidebarProps) => {
  const { navItems, sidebarKey, mobile = false, compact = false, onNavigate, header } = props
  const { showExtraSidebarToggle = false, extraSidebarCatchPattern, onBackFromExtraSidebar } = props

  return (
    <div
      className={cn(
        'bg-card border-border flex h-full flex-col border-r py-5 shadow-sm',
        compact ? 'w-24 px-3' : 'w-75 px-4'
      )}
    >
      {/* Inside a channel the primary header item (the channel) moves up into the logo slot; the body
          keeps the rest (e.g. the current user) so nothing is shown twice. */}
      <SidebarHeader compact={compact} entity={header?.[0]} />

      <SidebarBody
        navItems={navItems}
        sidebarKey={sidebarKey}
        compact={compact}
        onNavigate={onNavigate}
        showExtraSidebarToggle={showExtraSidebarToggle}
        extraSidebarCatchPattern={extraSidebarCatchPattern}
        onBackFromExtraSidebar={onBackFromExtraSidebar}
        header={header?.slice(1)}
      />

      <SidebarFooter onNavigate={onNavigate} mobile={mobile} compact={compact} />
    </div>
  )
}
