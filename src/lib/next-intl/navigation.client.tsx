'use client'

import { useMemo, type ComponentProps } from 'react'
import { BaseLink, useBaseRouter } from './navigation-base'
import { useNavigationProgress } from '@/hooks/use-navigation-progress'

/**
 * `Link` and `useRouter`, wrapped so that starting a navigation also starts the progress bar.
 *
 * Wrapping here rather than at the ~110 call sites keeps the indicator honest by default: a new page
 * gets a loading bar for free, and no one has to remember to opt in.
 */

type LinkProps = ComponentProps<typeof BaseLink>

export const Link = (props: LinkProps) => {
  const { onNavigate, ...rest } = props
  const start = useNavigationProgress((state) => state.start)

  return (
    <BaseLink
      {...rest}
      onNavigate={(event) => {
        // `onNavigate` only fires for real client-side transitions (not modified clicks, external
        // hrefs, or `target="_blank"`), which is exactly the set the bar should cover. A caller that
        // cancels the navigation must not leave a bar running, so mirror `preventDefault` and bail.
        let cancelled = false
        onNavigate?.({
          preventDefault: () => {
            cancelled = true
            event.preventDefault()
          },
        })
        if (!cancelled) start()
      }}
    />
  )
}

export const useRouter = () => {
  const router = useBaseRouter()
  const start = useNavigationProgress((state) => state.start)

  return useMemo(
    () => ({
      ...router,
      push: ((...args) => {
        start()
        return router.push(...args)
      }) as typeof router.push,
      replace: ((...args) => {
        start()
        return router.replace(...args)
      }) as typeof router.replace,
      back: () => {
        start()
        return router.back()
      },
      forward: () => {
        start()
        return router.forward()
      },
      // `refresh` deliberately stays bare: it re-renders the current URL, so the bar would have no
      // URL change to finish on and would sit there until the safety timeout.
    }),
    [router, start]
  )
}
