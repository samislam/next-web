'use client'

import { useTranslate } from '@tolgee/react'
import { pageDefs } from '@/config/pages.config'
import { Link } from '@/lib/next-intl/navigation'
import { Button, buttonVariants } from '@/components/ui/shadcnui/button'
import { ErrorScreenShell } from './error-screen-shell'

type UnknownErrorScreenProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export const UnknownErrorScreen = (props: UnknownErrorScreenProps) => {
  const { error, reset } = props
  const { t } = useTranslate()

  return (
    <ErrorScreenShell
      title={t('@t<error-page-title>')}
      description={t('@t<error-page-description>')}
      helpLine={t('@t<error-page-help-line>')}
      detail={error.message || undefined}
      actions={
        <>
          <Button onClick={reset} size="lg" className="w-full font-semibold">
            {t('@t<error-page-tryagain-button-text>')}
          </Button>
          <Button
            onClick={() => window.location.reload()}
            size="lg"
            variant="outline"
            className="w-full font-semibold"
          >
            {t('@t<error-page-refresh-button-text>')}
          </Button>
          <Link
            href={pageDefs.home.href}
            className={buttonVariants({
              size: 'lg',
              variant: 'outline',
              className: 'w-full font-semibold',
            })}
          >
            {t('@t<error-page-backhome-button-text>')}
          </Link>
        </>
      }
    />
  )
}
