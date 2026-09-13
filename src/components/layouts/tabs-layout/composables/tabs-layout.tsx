import { cn } from '@/lib/shadcn/utils'
import { PropsWithChildren } from 'react'
import { TabsLayoutList } from './tabs-layout-list'
import { Tabs } from '@/components/ui/shadcnui/tabs'
import { MotionDiv } from '@/components/ui/samislam/motion'
import { getCurrentLocale } from '@/lib/next-intl/get-current-locale-server'
import { TabsLayoutList as TabsLayoutListType } from '../types/tabs-layout-types'

type TabsLayoutProps = PropsWithChildren<{
  tabsList: TabsLayoutListType
  defaultTab?: string
  orientation?: 'vertical' | 'horizontal'
  responsive?: boolean
  reverseTabsPosition?: boolean
  useTabQueryParam?: boolean
}>

export const TabsLayout = async (props: TabsLayoutProps) => {
  const {
    tabsList,
    children,
    defaultTab,
    orientation = 'horizontal',
    responsive,
    reverseTabsPosition,
    useTabQueryParam,
  } = props
  const locale = await getCurrentLocale()
  const tabsListElement = (
    <TabsLayoutList
      list={tabsList}
      defaultTab={defaultTab}
      orientation={orientation}
      useTabQueryParam={useTabQueryParam}
    />
  )

  return (
    <Tabs
      className={cn('flex h-full w-full', {
        'flex-col gap-y-5': orientation === 'horizontal' && !responsive,
        [`${responsive ? 'flex-col gap-y-5 lg:flex-row lg:gap-x-3 lg:gap-y-0' : 'flex-row gap-x-3'}`]:
          orientation === 'vertical',
      })}
    >
      {!reverseTabsPosition ? tabsListElement : null}

      <MotionDiv
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        animate="show"
        initial="hidden"
        className="h-full flex-1"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {children}
        {reverseTabsPosition ? tabsListElement : null}
      </MotionDiv>
    </Tabs>
  )
}
