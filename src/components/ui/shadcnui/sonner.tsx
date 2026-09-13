'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg',
          default: 'group-[.toaster]:bg-background group-[.toaster]:text-foreground border-border',
          title: 'text-sm font-semibold',
          description: 'group-[.toast]:text-muted-foreground text-sm',
          // success → green
          success:
            'border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 [&_[data-icon]]:text-emerald-600 dark:[&_[data-icon]]:text-emerald-400',
          // error → red
          error:
            'border-rose-500/30 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 [&_[data-icon]]:text-rose-600 dark:[&_[data-icon]]:text-rose-400',
          // danger → yellow
          warning:
            'border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 [&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400',
          // info → cyan
          info: 'border-cyan-500/30 bg-cyan-50 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 [&_[data-icon]]:text-cyan-600 dark:[&_[data-icon]]:text-cyan-400',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
