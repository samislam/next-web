'use client'

import Image from 'next/image'
import { cn } from '@/lib/shadcn/utils'
import { pageDefs } from '@/config/pages.config'
import logo from '@/media/logo.png'
import appConfig from '@/config/app.config'
import { Link } from '@/lib/next-intl/navigation'
import { AuthImage } from '@/components/common/auth-image'
import type { DashboardSidebarHeaderItem } from './dashboard-utils'

type SidebarHeaderProps = {
  compact?: boolean
  /**
   * When set, the header shows THAT entity's icon + name instead of the app logo — so the sidebar
   * reflects which workspace/tenant/record you are inside. Absent at the top level → the app logo.
   */
  entity?: DashboardSidebarHeaderItem
}

export const SidebarHeader = (props: SidebarHeaderProps) => {
  const { compact = false, entity } = props
  const wrapClass = compact
    ? 'border-border border-b px-1 pb-4'
    : 'border-border border-b px-3 pb-4'
  const linkClass = compact ? 'flex items-center justify-center' : 'flex min-w-0 items-center gap-3'

  // Inside an entity: its icon + name take the app-logo slot.
  if (entity) {
    return (
      <div className={wrapClass}>
        <Link href={entity.href ?? pageDefs.home.href} className={linkClass} dir="auto">
          {entity.avatarPath ? (
            <AuthImage
              path={entity.avatarPath}
              alt={entity.name}
              className="h-10 w-10 shrink-0 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold uppercase shadow-sm">
              {entity.fallback}
            </div>
          )}
          {compact ? null : (
            <span
              className={cn(
                'text-foreground min-w-0 text-base leading-tight font-bold wrap-break-word'
              )}
            >
              {entity.name}
            </span>
          )}
        </Link>
      </div>
    )
  }

  // Top level: the app logo + name.
  return (
    <div className={wrapClass}>
      <Link href={pageDefs.home.href} className={linkClass}>
        <Image
          priority
          width={42}
          height={42}
          alt={appConfig.appName}
          src={logo}
          className="h-10 w-10 rounded-2xl object-contain shadow-sm"
        />
        {compact ? null : (
          <span className="text-foreground min-w-0 truncate text-base leading-tight font-bold">
            {appConfig.appName}
          </span>
        )}
      </Link>
    </div>
  )
}
