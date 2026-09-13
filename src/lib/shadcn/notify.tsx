import type { ReactNode } from 'react'
import { toast, type ExternalToast } from 'sonner'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type NotifyOptions = ExternalToast

const iconClass = 'h-5 w-5 shrink-0'

/**
 * Themed toast feedback. Variants map to the four colors:
 * - `success` → green
 * - `error` → red
 * - `danger` → yellow
 * - `info` → cyan
 *
 * Colors/backgrounds are defined once on the Toaster (see `ui/shadcnui/sonner`); here we only pick
 * the matching icon. Pass a translated string as the message.
 */
export const notify = {
  success: (message: ReactNode, options?: NotifyOptions) =>
    toast.success(message, { icon: <CheckCircle2 className={iconClass} />, ...options }),
  error: (message: ReactNode, options?: NotifyOptions) =>
    toast.error(message, { icon: <XCircle className={iconClass} />, ...options }),
  danger: (message: ReactNode, options?: NotifyOptions) =>
    toast.warning(message, { icon: <AlertTriangle className={iconClass} />, ...options }),
  info: (message: ReactNode, options?: NotifyOptions) =>
    toast.info(message, { icon: <Info className={iconClass} />, ...options }),
}
