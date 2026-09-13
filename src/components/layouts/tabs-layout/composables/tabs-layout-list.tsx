'use client'

import { cn } from '@/lib/shadcn/utils'
import { QUERY_PARAMS } from '@/constants'
import { comparePath } from 'compare-path'
import { useTranslate } from '@tolgee/react'
import { parseAsString, useQueryState } from 'nuqs'
import { TabsLayoutListItem } from './tabs-list-item'
import { usePathname } from '@/lib/next-intl/navigation'
import { TabsList } from '@/components/ui/shadcnui/tabs'
import { stripLocale } from '@/lib/next-intl/strip-locale'
import { type TabsLayoutList as TabsLayoutListType } from '../types/tabs-layout-types'

type TabsLayoutListProps = {
  defaultTab?: string
  list: TabsLayoutListType
  orientation?: 'vertical' | 'horizontal'
  useTabQueryParam?: boolean
}

export const TabsLayoutList = (props: TabsLayoutListProps) => {
  const { list, defaultTab, orientation = 'horizontal', useTabQueryParam } = props
  const pathname = usePathname()
  const normalizedPathname = stripLocale(pathname)
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useQueryState(QUERY_PARAMS.tab, parseAsString)
  const selectedTab = currentTab ?? defaultTab

  return (
    <div
      className={cn(
        'bg-muted/60 rounded-2xl p-1',
        orientation === 'horizontal' ? 'w-full overflow-x-auto overflow-y-hidden' : 'min-w-48'
      )}
    >
      <TabsList
        className={cn('rounded-none bg-transparent p-0', {
          'flex h-auto w-full justify-start gap-1': orientation === 'horizontal',
          'flex h-fit w-full flex-col items-stretch gap-1': orientation === 'vertical',
        })}
      >
        {list.map((item) => {
          const tabKey = item.tabKey
          const fallbackHref = item.href ?? normalizedPathname
          const [isMatch] = comparePath(fallbackHref, normalizedPathname)
          const active =
            typeof item.active !== 'undefined'
              ? item.active
              : useTabQueryParam && selectedTab
                ? tabKey === selectedTab
                : isMatch
          const onClick = useTabQueryParam && tabKey ? () => void setCurrentTab(tabKey) : undefined

          return (
            <TabsLayoutListItem
              active={active}
              icon={item.icon}
              onClick={onClick}
              label={t(item.label)}
              orientation={orientation}
              key={item.href ?? tabKey ?? item.label}
              href={useTabQueryParam ? undefined : item.href}
            />
          )
        })}
      </TabsList>
    </div>
  )
}
