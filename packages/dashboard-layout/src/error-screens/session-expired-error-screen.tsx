'use client'

import { appApi } from '@/lib/elysia/eden'
import { useTranslate } from '@tolgee/react'
import { pageDefs } from '@/config/pages.config'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@/lib/next-intl/navigation'
import { Button } from '@/components/ui/shadcnui/button'
import { ErrorScreenShell } from './error-screen-shell'

type SessionExpiredErrorScreenProps = {
  error: Error & { digest?: string }
}

type ParsedErrorPayload = {
  error?: string
  message?: string
  statusCode?: number
}

export const SessionExpiredErrorScreen = (_props: SessionExpiredErrorScreenProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const logoutMutation = useMutation({
    mutationFn: () => appApi.auth.logout.post(),
    onSettled: () => {
      router.replace(pageDefs.login.href)
      router.refresh()
    },
  })

  return (
    <ErrorScreenShell
      title={t('@t<error-page-title>')}
      description={t('@t<error-page-session-expired-description>')}
      helpLine={t('@t<error-page-session-expired-help-line>')}
      actions={
        <Button
          onClick={() => logoutMutation.mutate()}
          size="lg"
          disabled={logoutMutation.isPending}
          className="w-full font-semibold"
        >
          {t('@t<error-page-login-again-button-text>')}
        </Button>
      }
    />
  )
}

export const canRenderSessionExpiredErrorScreen = (error: Error & { digest?: string }) => {
  const parsed = parseErrorPayload(error.message)
  const combinedMessage = [error.message, parsed?.message, parsed?.error]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return (
    parsed?.statusCode === 401 ||
    combinedMessage.includes('unauthorized') ||
    combinedMessage.includes('user is no longer active') ||
    combinedMessage.includes('session expired')
  )
}

const parseErrorPayload = (message: string): ParsedErrorPayload | null => {
  try {
    const parsed = JSON.parse(message) as ParsedErrorPayload
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}
