'use client'

import { ReactNode, Suspense, useState } from 'react'
import * as motion from 'framer-motion/client'
import { AnimatePresence } from 'framer-motion'
import { DashboardTopnav } from './dashboard-topnav'
import { NavigationProgressBar } from './navigation-progress-bar'
import { NavigationWaveListener } from '@/components/common/navigation-wave-listener'
import { DashboardSidebar } from './dashboard-sidebar'
import { usePathname } from '@/lib/next-intl/navigation'
import { DashboardMainArea } from './dashboard-main-area'
import { stripLocale } from '@/lib/next-intl/strip-locale'
import { useDynamicSidebar } from './dynamic-sidebar-context'
import { DashboardConfig, resolveActiveExtraSidebar } from './dashboard-utils'

export type DashboardLayoutProps = {
  config: DashboardConfig
  children?: ReactNode
}

export const DashboardLayout = (props: DashboardLayoutProps) => {
  const { children, config } = props
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const normalizedPathname = stripLocale(pathname)
  // Routes can register a nested sidebar at runtime (for dynamic hrefs the static config can't
  // express); a registered one is the most specific override, so it takes precedence.
  const dynamicSidebar = useDynamicSidebar()
  const effectiveConfig = dynamicSidebar
    ? { ...config, extraSidebars: [dynamicSidebar, ...(config.extraSidebars ?? [])] }
    : config
  const activeExtraSidebar = resolveActiveExtraSidebar(effectiveConfig, normalizedPathname)
  const navItems = activeExtraSidebar
    ? activeExtraSidebar.navigationList
    : config.sidebar.navigationList
  // Some extra sidebars opt out of the back button (the channel sidebar is left via the topnav switcher).
  const showExtraSidebarToggle = Boolean(activeExtraSidebar) && !activeExtraSidebar?.hideBackButton

  return (
    <div className="bg-background min-h-screen">
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen lg:block">
          <DashboardSidebar
            navItems={navItems}
            sidebarKey={activeExtraSidebar?.catchPattern ?? 'main-sidebar'}
            showExtraSidebarToggle={showExtraSidebarToggle}
            extraSidebarCatchPattern={activeExtraSidebar?.catchPattern}
            header={activeExtraSidebar?.header}
          />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Topnav + the critical-alert bar stick together below the top edge. */}
          <div className="sticky top-0 z-30">
            {/* `relative` so the progress bar can sit on the topnav's bottom edge without taking up
                layout space — appearing must not nudge the page down by a couple of pixels. */}
            <div className="relative">
              <DashboardTopnav onMenuClick={() => setIsSidebarOpen(true)} />
              {/* Suspense because both read `useSearchParams` to tell one URL from another. */}
              <Suspense fallback={null}>
                <NavigationProgressBar />
                {/* Keeps the clicked link itself waving for as long as the bar is running. */}
                <NavigationWaveListener />
              </Suspense>
            </div>
            {/* Add app-wide banners (system alerts, maintenance notices) here — inside the sticky
                block so they travel with the topnav. */}
          </div>

          <AnimatePresence>
            {isSidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-foreground/20 fixed inset-0 z-40 backdrop-blur-[2px] lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <motion.div
                  initial={{ x: -32, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -32, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="h-full w-[86vw] max-w-[320px]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DashboardSidebar
                    mobile
                    navItems={navItems}
                    sidebarKey={activeExtraSidebar?.catchPattern ?? 'main-sidebar'}
                    onNavigate={() => setIsSidebarOpen(false)}
                    showExtraSidebarToggle={showExtraSidebarToggle}
                    extraSidebarCatchPattern={activeExtraSidebar?.catchPattern}
                    onBackFromExtraSidebar={() => setIsSidebarOpen(false)}
                    header={activeExtraSidebar?.header}
                  />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <DashboardMainArea>{children}</DashboardMainArea>
        </div>
      </div>
    </div>
  )
}
