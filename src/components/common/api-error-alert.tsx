import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/shadcnui/alert'
import { cn } from '@/lib/shadcn/utils'

/**
 * The in-dialog explanation half of the error pattern: the toast stays a short summary ("Failed to
 * delete …"), and the API's full reason (e.g. why a delete was refused) renders here as a destructive
 * Alert inside the modal. Renders nothing when there's no message. Pair with {@link apiErrorMessage}.
 */
export const ApiErrorAlert = ({
  message,
  className,
}: {
  message?: string | null
  className?: string
}) => {
  if (!message) return null
  return (
    <Alert variant="destructive" className={cn('mt-1', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription dir="auto" className="wrap-break-word whitespace-pre-line">
        {message}
      </AlertDescription>
    </Alert>
  )
}
