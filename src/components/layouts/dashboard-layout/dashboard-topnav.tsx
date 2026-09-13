'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/shadcnui/button'
import { DashboardBreadcrumbs } from './dashboard-breadcrumbs'
import { ThemeSwitcher } from '@/components/common/theme-switcher'

type DashboardTopnavProps = {
  onMenuClick: () => void
}

export const DashboardTopnav = (props: DashboardTopnavProps) => {
  const { onMenuClick } = props

  return (
    <header className="bg-card border-border border-b px-4 py-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            size="icon"
            type="button"
            variant="ghost"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open dashboard menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Room for an app-level switcher (workspace / tenant / environment) if the app needs one. */}

          <DashboardBreadcrumbs className="hidden min-w-0 sm:flex" />
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* On mobile the theme toggle moves into the sidebar footer (it ate too much navbar width);
              it stays in the navbar from lg+ where the sidebar is always-on. */}
          <div className="bg-card border-border hidden rounded-full border p-1 shadow-sm lg:block">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
