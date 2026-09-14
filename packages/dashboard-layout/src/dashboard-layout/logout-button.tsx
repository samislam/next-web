'use client'

import { LogOut } from 'lucide-react'
import { notify } from '@/lib/shadcn/notify'
import { appApi } from '@/lib/elysia/eden'
import { useTranslate } from '@tolgee/react'
import { pageDefs } from '@/config/pages.config'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@/lib/next-intl/navigation'
import { Button } from '@/components/ui/shadcnui/button'
import { ConfirmDialog } from '@/components/common/confirm.dialog'

type LogoutButtonProps = {
  onNavigate?: () => void
  compact?: boolean
}

export const LogoutButton = (props: LogoutButtonProps) => {
  const { onNavigate, compact = false } = props
  const { t } = useTranslate()
  const router = useRouter()
  const logoutMutation = useMutation({
    mutationFn: () => appApi.auth.logout.post(),
    onSuccess: () => {
      onNavigate?.()
      notify.success(t('@t<toast-logout-success>'))
      router.push(pageDefs.login.href)
    },
    onError: () => notify.error(t('@t<toast-error>')),
  })

  return (
    <ConfirmDialog
      closeOnConfirm={false}
      loading={logoutMutation.isPending}
      confirmButtonVariant="destructive"
      cancelButtonLabel={t('@t<cancel>')}
      title={t('@t<logout-dialog-title>')}
      onConfirm={() => logoutMutation.mutate()}
      confirmButtonLabel={t('@t<logout-button>')}
      description={t('@t<logout-dialog-description>')}
      triggerElement={
        <Button
          type="button"
          variant="ghost"
          className={
            compact
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive h-11 w-full justify-center rounded-2xl px-0'
              : 'bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive h-10 w-full justify-start rounded-2xl px-3 text-sm font-bold'
          }
        >
          <LogOut className="h-5 w-5" />
          {compact ? null : t('@t<logout-button>')}
        </Button>
      }
    />
  )
}
