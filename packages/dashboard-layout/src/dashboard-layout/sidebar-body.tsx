'use client'

import { useState } from 'react'
import { cn } from '@/lib/shadcn/utils'
import * as motion from 'framer-motion/client'
import { AnimatePresence } from 'framer-motion'
import { stripLocale } from '@/lib/next-intl/strip-locale'
import { LibIcon } from '@/components/ui/samislam/lib-icon'
import { Link, usePathname } from '@/lib/next-intl/navigation'
import { useRipple } from '@/hooks/use-ripple'
import { AuthImage } from '@/components/common/auth-image'
import { BackButton } from './back-button'
import {
  DashboardNavItem,
  DashboardSidebarHeaderItem,
  filterVisibleNav,
  isDashboardNavItemActive,
} from './dashboard-utils'

type SidebarBodyProps = {
  navItems: DashboardNavItem[]
  sidebarKey: string
  compact?: boolean
  onNavigate?: () => void
  showExtraSidebarToggle?: boolean
  extraSidebarCatchPattern?: string
  onBackFromExtraSidebar?: () => void
  header?: DashboardSidebarHeaderItem[]
}

export const SidebarBody = (props: SidebarBodyProps) => {
  const { navItems, sidebarKey, compact = false, onNavigate, header } = props
  const { showExtraSidebarToggle = false, extraSidebarCatchPattern, onBackFromExtraSidebar } = props
  const pathname = usePathname()
  const normalizedPathname = stripLocale(pathname)
  const visibleItems = filterVisibleNav(navItems)

  return (
    <div className="mt-6 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-1">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sidebarKey}
          initial={{ opacity: 0, x: showExtraSidebarToggle ? 14 : -14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showExtraSidebarToggle ? -14 : 14 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={cn('space-y-1.5', compact ? 'px-0' : 'pr-1')}
        >
          {header && header.length && !compact ? (
            <div className="border-border mb-3 space-y-3 border-b px-3 pb-4">
              {header.map((item, index) => (
                <div key={`${index}-${item.name}`} className="flex items-center gap-3">
                  {item.avatarPath ? (
                    <AuthImage
                      path={item.avatarPath}
                      alt={item.name}
                      className={cn(
                        'shrink-0 rounded-full object-cover',
                        item.emphasis === 'secondary' ? 'h-8 w-8' : 'h-10 w-10'
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center rounded-full font-bold uppercase',
                        item.emphasis === 'secondary'
                          ? 'bg-muted text-muted-foreground h-8 w-8 text-xs'
                          : 'bg-primary/10 text-primary h-10 w-10 text-sm'
                      )}
                    >
                      {item.fallback}
                    </div>
                  )}
                  {(() => {
                    const nameClass = cn(
                      'min-w-0 wrap-break-word',
                      item.emphasis === 'secondary'
                        ? 'text-muted-foreground text-sm font-medium'
                        : 'text-foreground text-base font-bold'
                    )
                    // Only a link when there is somewhere to go — a header item without an href
                    // stays plain text rather than becoming a control that does nothing.
                    return item.href ? (
                      <Link
                        href={item.href}
                        className={cn(nameClass, 'hover:text-primary transition-colors')}
                        dir="auto"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className={nameClass} dir="auto">
                        {item.name}
                      </span>
                    )
                  })()}
                </div>
              ))}
            </div>
          ) : null}

          {showExtraSidebarToggle && extraSidebarCatchPattern ? (
            <div className={cn('mb-3', compact ? 'flex justify-center' : 'px-3')}>
              <BackButton
                catchPattern={extraSidebarCatchPattern}
                behavior="leave-segment"
                compact={compact}
                onBack={onBackFromExtraSidebar}
              />
            </div>
          ) : null}

          {visibleItems.map((item) => (
            <NavNode
              key={nodeKey(item)}
              item={item}
              ctx={{ compact, pathname: normalizedPathname, onNavigate }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** Stable React key for a nav node (branch parents have no href). */
const nodeKey = (item: DashboardNavItem) => item.href ?? `branch:${item.label}`

type NavNodeCtx = {
  compact: boolean
  pathname: string
  onNavigate?: () => void
}

/** Dispatches a nav item to a leaf link or an inline branch (accordion). */
const NavNode = ({
  item,
  ctx,
  nested = false,
}: {
  item: DashboardNavItem
  ctx: NavNodeCtx
  nested?: boolean
}) => {
  if (item.branch) {
    // No room to expand in the collapsed rail — render the group's children flat (icon-only).
    if (ctx.compact) {
      return (
        <>
          {item.branch.navigationList.map((child) => (
            <NavNode key={nodeKey(child)} item={child} ctx={ctx} />
          ))}
        </>
      )
    }
    return <NavBranch item={item} ctx={ctx} />
  }
  return <NavLeaf item={item} ctx={ctx} nested={nested} />
}

/**
 * A navigable sidebar item. Shows a `>` chevron when it drills into a nested sidebar. `nested` items
 * (branch children) render more compact — a smaller icon + text — which both reclaims the width a long
 * label needs (so it isn't truncated) and reads as a sub-item.
 */
const NavLeaf = ({
  item,
  ctx,
  nested = false,
}: {
  item: DashboardNavItem
  ctx: NavNodeCtx
  nested?: boolean
}) => {
  const { compact, pathname, onNavigate } = ctx
  const isActive = isDashboardNavItemActive(item, pathname)
  const hasDrillIn = Boolean(item.sidebar)
  const { onPointerDown, ripple } = useRipple()

  return (
    <Link
      href={item.href ?? '#'}
      onClick={onNavigate}
      onPointerDown={onPointerDown}
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-200',
        'hover:bg-accent/70 hover:text-accent-foreground',
        isActive ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground',
        compact
          ? 'flex justify-center px-2 py-3'
          : nested
            ? 'flex items-center justify-between px-2.5 py-2'
            : 'flex items-center justify-between px-3 py-2.5'
      )}
      aria-label={item.label}
      title={item.label}
    >
      <div
        className={cn(
          'flex min-w-0 items-center',
          compact ? 'justify-center' : nested ? 'gap-2.5' : 'gap-3'
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center transition-colors',
            nested ? 'h-7 w-7 rounded-lg' : 'h-9 w-9 rounded-xl',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground group-hover:bg-secondary group-hover:text-foreground'
          )}
        >
          <LibIcon icon={item.icon} className={nested ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
        {compact ? null : (
          <span
            className={cn('truncate', nested ? 'text-sm font-semibold' : 'text-base font-bold')}
          >
            {item.label}
          </span>
        )}
      </div>

      {compact ? null : (
        <div className="flex shrink-0 items-center gap-2">
          {item.badge ? (
            <span className="bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-xs font-semibold">
              {item.badge}
            </span>
          ) : null}
          {hasDrillIn ? (
            <LibIcon icon="mdi:mdiChevronRight" className="text-muted-foreground h-4 w-4" />
          ) : null}
        </div>
      )}
      {ripple}
    </Link>
  )
}

/** An inline expandable group. The parent toggles; children render indented below. */
const NavBranch = ({ item, ctx }: { item: DashboardNavItem; ctx: NavNodeCtx }) => {
  const children = item.branch?.navigationList ?? []
  const hasActiveChild = children.some((child) => isDashboardNavItemActive(child, ctx.pathname))
  // Follow the active child by default; a manual toggle then takes over.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null)
  const open = manualOpen ?? hasActiveChild

  return (
    <div>
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        aria-expanded={open}
        className={cn(
          'group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-200',
          'hover:bg-accent/70 hover:text-accent-foreground',
          hasActiveChild ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
              hasActiveChild
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-secondary group-hover:text-foreground'
            )}
          >
            <LibIcon icon={item.icon} className="h-5 w-5" />
          </div>
          <span className="truncate text-base font-bold">{item.label}</span>
        </div>
        <LibIcon
          icon="mdi:mdiChevronRight"
          className={cn(
            'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
            open && 'rotate-90'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-border/60 mt-1 ml-3 space-y-1 border-l pl-2">
              {children.map((child) => (
                <NavNode key={nodeKey(child)} item={child} ctx={ctx} nested />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
