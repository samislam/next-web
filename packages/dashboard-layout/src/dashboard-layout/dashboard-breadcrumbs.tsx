'use client'

import { Fragment, useMemo } from 'react'
import { cn } from '@/lib/shadcn/utils'
import { comparePath } from 'compare-path'
import { useTranslate } from '@tolgee/react'
import { stripLocale } from '@/lib/next-intl/strip-locale'
import { LibIcon } from '@/components/ui/samislam/lib-icon'
import { Link, usePathname } from '@/lib/next-intl/navigation'
import { BreadcrumbList } from '@/components/ui/shadcnui/breadcrumb'
import { useBreadcrumbLabels } from './breadcrumb-labels-context'
import { dashboardBreadcrumbsConfig } from '@/config/breadcrumbs.config'
import { DashboardBreadcrumbDef } from './types/dashboard-breadcrumbs.types'
import { BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/shadcnui/breadcrumb'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/shadcnui/breadcrumb'

type DashboardBreadcrumbsProps = {
  className?: string
}

const pages = Object.values(dashboardBreadcrumbsConfig.segments)

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const resolveBreadcrumbPath = (path: string): string => {
  const normalizedPath = stripLocale(path)
  const alias = (dashboardBreadcrumbsConfig.rewriteAliases ?? []).find((entry) => {
    const [isMatch] = comparePath(entry.from, normalizedPath)
    return isMatch
  })

  return alias ? stripLocale(alias.to) : normalizedPath
}

const makePathRegex = (pattern: string): RegExp => {
  const normalizedPattern = stripLocale(pattern)
  const parts = normalizedPattern.split('/').filter(Boolean)
  const pathRegex = parts
    .map((segment) => {
      if (/^\[\[\.\.\..+\]\]$/.test(segment)) return '(?:/.*)?'
      if (/^\[\.\.\..+\]$/.test(segment)) return '/.+'
      if (/^\[.+\]$/.test(segment)) return '/[^/]+'
      return '/' + escapeRegExp(segment)
    })
    .join('')

  return new RegExp(`^${pathRegex || '/'}$`)
}

const findMatchingPage = (fullPath: string): DashboardBreadcrumbDef | undefined => {
  const pathWithoutLocale = stripLocale(fullPath)
  const exactMatch = pages.find((page) => stripLocale(page.href) === pathWithoutLocale)

  if (exactMatch) return exactMatch

  for (const page of pages) {
    if (!page.href.includes('[')) continue
    if (makePathRegex(page.href).test(pathWithoutLocale)) return page
  }

  return undefined
}

const humanize = (segment: string) =>
  segment.replace(/[-_]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())

export const DashboardBreadcrumbs = (props: DashboardBreadcrumbsProps) => {
  const { className } = props
  const pathname = usePathname()
  const { t } = useTranslate()
  const labelOverrides = useBreadcrumbLabels()

  const breadcrumbs = useMemo(() => {
    const cleanPath = resolveBreadcrumbPath(pathname.split(/[?#]/)[0])
    if (
      dashboardBreadcrumbsConfig.hideOnIndex &&
      stripLocale(cleanPath) === stripLocale(dashboardBreadcrumbsConfig.indexHref)
    ) {
      return []
    }

    const segments = cleanPath.split('/').filter(Boolean)
    const items: Array<DashboardBreadcrumbDef & { isLast: boolean }> = []

    // Inside a sale channel the topnav switcher already shows the channel, so the global
    // Home / "Sale channels" / channel-name crumbs are redundant. Instead, "Home" points to the
    // channel's own overview page and the trail continues from its sub-page (e.g. "Home > Orders > #X").
    const inChannel = segments[0] === 'sale-channels' && segments.length >= 2
    const startIndex = inChannel ? 2 : 0

    const homePage =
      dashboardBreadcrumbsConfig.segments.home ??
      pages.find((page) => stripLocale(page.href) === '/')

    if (homePage) {
      items.push(
        inChannel
          ? {
              href: `/sale-channels/${segments[1]}`,
              label: t(homePage.label),
              icon: homePage.icon,
              isLast: segments.length === startIndex,
            }
          : {
              href: homePage.href,
              label: t(homePage.label),
              icon: homePage.icon,
              isLast: segments.length === 0 || stripLocale(cleanPath) === '/',
            }
      )
    }

    const pathAccumulator: string[] = []
    segments.forEach((segment, index) => {
      pathAccumulator.push(segment)
      if (index < startIndex) return
      const fullPath = '/' + pathAccumulator.join('/')
      const page = findMatchingPage(fullPath)
      const label = labelOverrides[fullPath] ?? (page ? t(page.label) : humanize(segment))

      if (items.length && items[items.length - 1].href === fullPath) return

      items.push({
        href: fullPath,
        label,
        icon: page?.icon,
        isLast: false,
      })
    })

    if (items.length) {
      items[items.length - 1] = { ...items[items.length - 1], isLast: true }
    }

    const seen = new Set<string>()
    return items.filter((item) => (seen.has(item.href) ? false : (seen.add(item.href), true)))
  }, [pathname, t, labelOverrides])

  if (!breadcrumbs.length) return null

  return (
    // Hidden on mobile: there isn't room next to the header controls to show the current page in full,
    // and a truncated crumb reads worse than none. From md up (where it fits) the full trail shows.
    <Breadcrumb className={cn('hidden md:block', className)}>
      {/* One line, never wraps: the long middle crumb (e.g. a channel name) truncates before the
          current page does, so the current page always stays fully readable. */}
      <BreadcrumbList className="min-w-0 flex-nowrap overflow-hidden">
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={`${index}-${crumb.href}`}>
            {crumb.isLast ? (
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbPage className="flex items-center gap-x-2 font-bold">
                  {crumb.icon ? <LibIcon icon={crumb.icon} className="w-4 shrink-0" /> : null}
                  <span className="whitespace-nowrap">{crumb.label}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} className="flex min-w-0 items-center gap-x-2">
                    {crumb.icon ? <LibIcon icon={crumb.icon} className="w-4 shrink-0" /> : null}
                    <span data-wave-text-target className="truncate">
                      {crumb.label}
                    </span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {!crumb.isLast ? <BreadcrumbSeparator className="shrink-0" /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
