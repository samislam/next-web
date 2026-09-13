'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/shadcn/utils'
import { useTranslate } from '@tolgee/react'
import { Loader2Icon } from 'lucide-react'
import { ApiErrorAlert } from './api-error-alert'
import { ButtonProps } from '../ui/shadcnui/button'
import { LibIcon, LibraryIcon } from '../ui/samislam/lib-icon'
import { AlertDialogDescription } from '../ui/shadcnui/alert-dialog'
import { AlertDialogTrigger, AlertDialogContent } from '../ui/shadcnui/alert-dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '../ui/shadcnui/alert-dialog'
import { AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/shadcnui/alert-dialog'

export interface ConfirmDialogProps {
  triggerElement?: ReactNode
  isOpen?: boolean
  close?: (open?: boolean) => void
  title?: string
  loading?: boolean
  description?: ReactNode
  onConfirm?: () => void
  cancelButtonLabel?: string
  confirmButtonLabel?: string
  confirmButtonClassName?: string
  confirmButtonVariant?: ButtonProps['variant']
  confirmIcon?: LibraryIcon
  closeOnConfirm?: boolean
  /** The full API error reason, shown as an inline destructive Alert inside the dialog (while the
   * caller keeps the toast a short summary). Absent/empty ⇒ no alert. Pair with `closeOnConfirm=false`
   * so the dialog stays open to show it. */
  errorMessage?: string | null
}
export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const { t } = useTranslate()
  const { triggerElement } = props
  const { title, loading, onConfirm, description, confirmButtonClassName, confirmButtonVariant } =
    props
  const { close, isOpen, confirmIcon, closeOnConfirm = true } = props
  // Fall back to generic labels so a caller that forgets them never renders empty buttons.
  const cancelButtonLabel = props.cancelButtonLabel ?? t('@t<cancel>')
  const confirmButtonLabel = props.confirmButtonLabel ?? t('@t<confirm>')
  return (
    <AlertDialog onOpenChange={close} open={isOpen}>
      <AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <ApiErrorAlert message={props.errorMessage} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className="cursor-pointer">
            {cancelButtonLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={confirmButtonVariant}
            disabled={loading}
            onClick={(event) => {
              if (!closeOnConfirm) event.preventDefault()
              onConfirm?.()
            }}
            className={cn('cursor-pointer', confirmButtonClassName)}
          >
            {loading && <Loader2Icon className="h-10 w-10 animate-spin" />}
            <span>{confirmButtonLabel}</span>
            {confirmIcon && <LibIcon icon={confirmIcon} className="h-10 w-10" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
