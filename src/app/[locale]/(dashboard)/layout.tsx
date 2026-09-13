import { LayoutProps } from '@/lib/next/next-types'
import { UserProvider } from '@/providers/user.provider'
import type { UserData } from '@/providers/user.provider'
import { getDashboardConfig } from '@/config/dashboard.config'
import { mainApiFetch, MainApiError } from '@/lib/main-api/server-fetch'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { DynamicSidebarProvider } from '@/components/layouts/dashboard-layout'
import { BreadcrumbLabelsProvider } from '@/components/layouts/dashboard-layout'
import { SessionExpiredErrorScreen } from '@/components/layouts/error-screens/session-expired-error-screen'

/** What the paired nest-starter's `GET /auth/me` returns. Adjust to your backend's shape. */
type MeResponse = {
  user: { sub: string; name: string; username: string }
}

/**
 * A stale or invalidated session — the API answers 401 because the account was removed, the token
 * expired, or the database was reset while an old cookie is still in the browser.
 */
const isUnauthorized = (error: unknown): boolean => {
  if (error instanceof MainApiError) return error.status === 401
  const e = error as { status?: number; message?: string } | null
  if (!e || typeof e !== 'object') return false
  if (e.status === 401) return true
  try {
    return (JSON.parse(e.message ?? '') as { statusCode?: number })?.statusCode === 401
  } catch {
    return false
  }
}

const Layout = async (props: LayoutProps) => {
  const { children } = props

  // Run in parallel, but soft-catch `me` so a 401 doesn't reject the whole layout. This MUST be
  // handled server-side: in production Next.js strips the Server Component error message, so the
  // client error boundary can no longer tell a stale-session 401 from a generic crash and would show
  // the "unexpected error" screen instead of "session expired". Here the real error is still intact.
  const [dashboardConfig, meResult] = await Promise.all([
    getDashboardConfig(),
    mainApiFetch<MeResponse>('/auth/me').then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error })
    ),
  ])

  if (!meResult.ok) {
    // An expected auth failure gets the session-expired screen (logout → login). Anything else is a
    // real bug and should surface as one.
    if (isUnauthorized(meResult.error)) {
      return <SessionExpiredErrorScreen error={meResult.error as Error} />
    }
    throw meResult.error
  }

  // Map the backend's user onto the shell's small UI-shaped type. Extend per project.
  const user: UserData = {
    id: meResult.value.user.sub,
    name: meResult.value.user.name,
    subtitle: meResult.value.user.username,
    isOnline: true,
  }

  return (
    <UserProvider value={{ user: { data: user } }}>
      <DynamicSidebarProvider>
        <BreadcrumbLabelsProvider>
          <DashboardLayout config={dashboardConfig}>{children}</DashboardLayout>
        </BreadcrumbLabelsProvider>
      </DynamicSidebarProvider>
    </UserProvider>
  )
}

export default Layout
