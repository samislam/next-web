'use client'

import { LoggedInUserBox } from './logged-in-user-box'
import { LogoutButton } from './logout-button'
import { ThemeSwitcher } from '@/components/common/theme-switcher'

type SidebarFooterProps = {
  mobile?: boolean
  compact?: boolean
  onNavigate?: () => void
}

export const SidebarFooter = (props: SidebarFooterProps) => {
  const { compact = false, mobile = false, onNavigate } = props

  return (
    <div className={compact ? 'mt-auto px-1 pb-1' : 'mt-auto px-3 pb-1'}>
      <div className="bg-border mb-3 h-px" />

      <div className="space-y-3">
        {/* The theme toggle lives here on mobile (it's in the navbar on desktop). */}
        {mobile ? (
          <div className="flex justify-center">
            <div className="bg-card border-border inline-flex rounded-full border p-1 shadow-sm">
              <ThemeSwitcher />
            </div>
          </div>
        ) : null}
        <LoggedInUserBox compact={compact} />
        <LogoutButton onNavigate={onNavigate} compact={compact} />
      </div>
    </div>
  )
}
