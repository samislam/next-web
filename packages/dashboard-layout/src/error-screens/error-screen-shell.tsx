'use client'

import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { MotionDiv } from '@/components/ui/samislam/motion'

type ErrorScreenShellProps = {
  title: string
  description: string
  helpLine: string
  actions: ReactNode
  /** Icon shown in the badge; defaults to a warning triangle. */
  icon?: ReactNode
  /** Optional technical detail (e.g. the raw error message), shown in a muted mono line. */
  detail?: ReactNode
}

export const ErrorScreenShell = (props: ErrorScreenShellProps) => {
  const { title, description, helpLine, actions, icon, detail } = props

  return (
    <div className="bg-background text-foreground relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Two soft, theme-aware glows so the empty ground doesn't read as a blank page. */}
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-destructive/5 pointer-events-none absolute right-0 -bottom-40 h-80 w-80 rounded-full blur-3xl"
      />

      <MotionDiv
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-card/80 border-border relative w-full max-w-md rounded-3xl border p-8 text-center shadow-xl backdrop-blur-sm sm:p-10"
      >
        <MotionDiv
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
          className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        >
          {icon ?? <AlertTriangle className="h-8 w-8" strokeWidth={1.75} />}
        </MotionDiv>

        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance">{title}</h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-base text-balance">
          {description}
        </p>

        {detail ? (
          <p className="bg-muted/60 text-muted-foreground mt-4 truncate rounded-lg px-3 py-2 font-mono text-xs">
            {detail}
          </p>
        ) : null}

        <div className="mt-7 space-y-3">{actions}</div>

        <p className="text-muted-foreground/70 mt-7 text-sm text-balance">{helpLine}</p>
      </MotionDiv>
    </div>
  )
}
