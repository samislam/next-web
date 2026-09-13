'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { useRouter, usePathname } from '@/lib/next-intl/navigation'
import { Button } from '@/components/ui/shadcnui/button'

type UrlPaginationProps = {
  page: number
  perPage: number
  total: number
  /** Query-string key to write the page into. Defaults to `page`. */
  paramKey?: string
}

/** URL-driven pagination (`?page=`) that preserves other query params. Reusable across tables. */
export const UrlPagination = ({ page, perPage, total, paramKey = 'page' }: UrlPaginationProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  const goTo = (next: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramKey, String(next))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3">
      <p className="text-muted-foreground text-sm">
        {t('@t<pagination-range>', { from: String(from), to: String(to), total: String(total) })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('@t<pagination-prev>')}
        </Button>
        <span className="text-muted-foreground text-sm font-medium">
          {page} / {lastPage}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => goTo(page + 1)}
        >
          {t('@t<pagination-next>')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
