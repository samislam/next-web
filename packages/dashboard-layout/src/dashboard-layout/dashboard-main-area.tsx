'use client'

import { ReactNode } from 'react'
import * as motion from 'framer-motion/client'

type DashboardMainAreaProps = {
  children?: ReactNode
  compact?: boolean
}

export const DashboardMainArea = (props: DashboardMainAreaProps) => {
  const { children, compact = false } = props

  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={
        compact
          ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-0 pb-0'
          : // overflow-x-clip contains any stray-wide child so the whole page can't pan sideways on
            // mobile (belt-and-suspenders with the html-root clip). It's a real element style, so it
            // isn't subject to viewport-propagation quirks; the topnav/footer are siblings, so their
            // sticky positioning is unaffected, and inner overflow-x-auto scrollers still scroll.
            'flex-1 overflow-x-clip px-4 pt-6 pb-5 sm:px-6 sm:pt-7 lg:px-8 lg:pt-8 lg:pb-8'
      }
    >
      {children}
    </motion.main>
  )
}
