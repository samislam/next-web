'use client'

import { ReactNode, useEffect } from 'react'
import { createContext, useContext, useState } from 'react'
import { DashboardExtraSidebar } from './dashboard-utils'

/**
 * Lets a route register a nested sidebar for the single main sidebar at runtime.
 *
 * The static dashboard config can only declare sidebars with fixed hrefs, so dynamic routes (e.g.
 * `/sale-channels/[id]`) cannot be expressed there. A route renders
 * `<RegisterDynamicSidebar />` (or calls {@link useRegisterDynamicSidebar}) to push its nested
 * sidebar — built with the resolved params — into this registry. `DashboardLayout` reads the active
 * one and renders it in place of the main sidebar, reusing the existing nested-sidebar machinery.
 */
type DynamicSidebarContextValue = {
  dynamicSidebar: DashboardExtraSidebar | null
  setDynamicSidebar: (sidebar: DashboardExtraSidebar | null) => void
}

const DynamicSidebarContext = createContext<DynamicSidebarContextValue | null>(null)

export const DynamicSidebarProvider = (props: { children: ReactNode }) => {
  const { children } = props
  const [dynamicSidebar, setDynamicSidebar] = useState<DashboardExtraSidebar | null>(null)

  return (
    <DynamicSidebarContext.Provider value={{ dynamicSidebar, setDynamicSidebar }}>
      {children}
    </DynamicSidebarContext.Provider>
  )
}

/** Read the currently registered dynamic sidebar (used by the dashboard shell). */
export const useDynamicSidebar = () => {
  const context = useContext(DynamicSidebarContext)
  return context?.dynamicSidebar ?? null
}

/**
 * Registers `sidebar` while the calling component is mounted, then clears it on unmount. Pass a
 * value memoized by the caller so the effect doesn't re-run every render.
 */
export const useRegisterDynamicSidebar = (sidebar: DashboardExtraSidebar) => {
  const context = useContext(DynamicSidebarContext)
  const setDynamicSidebar = context?.setDynamicSidebar

  useEffect(() => {
    if (!setDynamicSidebar) return
    setDynamicSidebar(sidebar)
    return () => setDynamicSidebar(null)
  }, [sidebar, setDynamicSidebar])
}
