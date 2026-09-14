'use client'

import { cn } from '@/lib/shadcn/utils'
import { Link } from '@/lib/next-intl/navigation'
import { Button } from '@/components/ui/shadcnui/button'
import { LibIcon } from '@/components/ui/samislam/lib-icon'
import { useRipple } from '@/hooks/use-ripple'
import { TabsLayoutListItem as TabsLayoutListItemType } from '../types/tabs-layout-types'

export const TabsLayoutListItem = (props: TabsLayoutListItemType) => {
  const { label, href, icon, active, onClick, orientation = 'horizontal' } = props
  const { onPointerDown, ripple } = useRipple()
  const className = cn(
    'relative overflow-hidden flex min-w-32 items-center justify-center gap-2 px-4 py-2 text-base font-bold transition-colors',
    orientation === 'horizontal' ? 'rounded-xl' : 'rounded-md',
    active
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
  )

  if (!href) {
    return (
      <Button variant="ghost" type="button" onClick={onClick} className={className}>
        {icon ? <LibIcon icon={icon} className="h-4 w-4" /> : null}
        {label}
      </Button>
    )
  }

  return (
    <Link href={href} className={className} onPointerDown={onPointerDown}>
      {icon ? <LibIcon icon={icon} className="h-4 w-4" /> : null}
      {label}
      {ripple}
    </Link>
  )
}
