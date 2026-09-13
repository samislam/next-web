import { LibraryIcon } from '@/components/ui/samislam/lib-icon'

export type TabsLayoutListItem = {
  label: string
  active?: boolean
  href?: string
  icon?: LibraryIcon
  onClick?: () => void
  tabKey?: string
  orientation?: 'vertical' | 'horizontal'
}

export type TabsLayoutList = TabsLayoutListItem[]
