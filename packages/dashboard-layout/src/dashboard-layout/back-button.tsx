'use client'

import { cn } from '@/lib/shadcn/utils'
import { useTranslate } from '@tolgee/react'
import { ChevronBackIcon } from '@/components/icons/layout-helper-icons'
import { useDashboardSegmentBack } from '@/hooks/use-dashboard-segment-back'

type BackButtonProps = {
  catchPattern: string
  compact?: boolean
  className?: string
  showLabel?: boolean
  onBack?: () => void
  behavior?: 'segment' | 'leave-segment'
}

export const BackButton = (props: BackButtonProps) => {
  const {
    catchPattern,
    compact = false,
    className,
    showLabel = true,
    onBack,
    behavior = 'segment',
  } = props
  const { t } = useTranslate()
  const { goBackFromSegment, leaveSegment } = useDashboardSegmentBack()

  return (
    <button
      type="button"
      onClick={() => {
        onBack?.()
        if (behavior === 'leave-segment') {
          leaveSegment(catchPattern)
          return
        }

        goBackFromSegment(catchPattern)
      }}
      className={cn(
        'clickable bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 flex items-center justify-center rounded-2xl border transition-colors',
        compact ? 'h-11 w-11' : 'gap-2 px-3 py-2',
        className
      )}
      aria-label={t('@t<back>')}
    >
      <ChevronBackIcon className="h-4 w-4" />
      {compact || !showLabel ? null : <span className="text-sm font-bold">{t('@t<back>')}</span>}
    </button>
  )
}
