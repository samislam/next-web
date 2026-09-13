'use client'

import { useEffect } from 'react'
import { parseAsString, useQueryState } from 'nuqs'
import { QUERY_PARAMS } from '@/constants'

/**
 * Reads the `?highlight=<id>` query param and beams the element with that id (the global
 * `highlight-beam` utility) to draw the eye to it. Does NOT scroll — pair it with a URL `#hash` when
 * you also want to bring the surrounding card into view. Renders nothing; mount it once on any page
 * whose rows carry ids you want to deep-link to.
 *
 * @example
 *   // elsewhere: <Link href={`/x?${QUERY_PARAMS.highlight}=payout#card`}>Edit</Link>
 *   <div id="payout">…</div>
 *   <HighlightParamEffect />
 */
export const HighlightParamEffect = () => {
  const [highlight] = useQueryState(QUERY_PARAMS.highlight, parseAsString)

  useEffect(() => {
    if (!highlight) return
    // Wait a frame so the target has been laid out (and any #hash scroll has settled) before beaming.
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(highlight)
      if (!el) return
      // Restart the animation if the class is already present (re-highlighting the same element).
      el.classList.remove('highlight-beam')
      void el.offsetWidth
      el.classList.add('highlight-beam')
      el.addEventListener('animationend', () => el.classList.remove('highlight-beam'), {
        once: true,
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [highlight])

  return null
}
