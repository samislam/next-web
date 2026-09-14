'use client'

import { ReactNode, useCallback, useEffect } from 'react'
import { createContext, useContext, useState } from 'react'

/**
 * Lets routes override the breadcrumb label for a concrete path (which the static breadcrumb config
 * can't know — e.g. a `[id]` segment that should read as the sale channel name or the user alias).
 *
 * Two contexts so registrants depend only on the STABLE `register` fn (not on the changing labels),
 * avoiding a re-register loop.
 */
type RegisterFn = (labels: Record<string, string>) => () => void

const BreadcrumbLabelsValueContext = createContext<Record<string, string>>({})
const BreadcrumbLabelsApiContext = createContext<RegisterFn | null>(null)

export const BreadcrumbLabelsProvider = (props: { children: ReactNode }) => {
  const { children } = props
  const [labels, setLabels] = useState<Record<string, string>>({})

  const register = useCallback<RegisterFn>((entries) => {
    setLabels((prev) => ({ ...prev, ...entries }))
    return () =>
      setLabels((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(entries)) delete next[key]
        return next
      })
  }, [])

  return (
    <BreadcrumbLabelsApiContext.Provider value={register}>
      <BreadcrumbLabelsValueContext.Provider value={labels}>
        {children}
      </BreadcrumbLabelsValueContext.Provider>
    </BreadcrumbLabelsApiContext.Provider>
  )
}

/** Read the path→label overrides (used by the breadcrumbs renderer). */
export const useBreadcrumbLabels = () => useContext(BreadcrumbLabelsValueContext)

/** Register path→label overrides while mounted; cleared on unmount. Pass a stable/memoized map. */
export const useRegisterBreadcrumbLabels = (labels: Record<string, string>) => {
  const register = useContext(BreadcrumbLabelsApiContext)
  const key = JSON.stringify(labels)

  useEffect(() => {
    if (!register) return
    return register(labels)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures `labels` content
  }, [register, key])
}
