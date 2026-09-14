import { LayoutProps } from '@/lib/next/next-types'
import { UserProvider } from '@/providers/user.provider'
import type { UserData } from '@/providers/user.provider'
import { getDashboardConfig } from '@/config/dashboard.config'
import { DashboardLayout } from '@samislam/dashboard-layout'
import { DynamicSidebarProvider } from '@samislam/dashboard-layout'
import { BreadcrumbLabelsProvider } from '@samislam/dashboard-layout'

// ? AUTHENTICATION — off by default. To enable, uncomment these two imports and the block at the
// ? bottom of this file (delete the placeholder `Layout` below), then uncomment the route gates in
// ? `src/proxy.ts`. Every commented line below just needs its leading `// ` removed.
// import { mainApiFetch, MainApiError } from '@/lib/main-api/server-fetch'
// import { SessionExpiredErrorScreen } from '@samislam/dashboard-layout'

/**
 * The dashboard shell — sidebar, topnav, breadcrumbs, navigation progress.
 *
 * This route group ships with NO pages in it, on purpose: the home page is a plain centred page at
 * `[locale]/(routing)/page.tsx` and does not get the shell. Add a page anywhere under
 * `[locale]/(dashboard)/` and it is wrapped in the shell automatically; its nav lives in
 * `src/config/dashboard.config.ts`.
 *
 * It also ships WITHOUT authentication, so it renders with no backend running. The signed-in user is
 * a placeholder — see the bottom of this file for the real flow.
 */
const Layout = async (props: LayoutProps) => {
  const { children } = props

  const dashboardConfig = await getDashboardConfig()

  // ? Placeholder identity. Delete this when you enable the real `me` fetch below.
  const user: UserData = {
    id: 'local-user',
    name: 'Local User',
    subtitle: 'development',
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

/* ─────────────────────────────────────────────────────────────────────────────────────────────────
 * AUTHENTICATION — the real layout.
 *
 * To enable: remove the leading `// ` from every commented line below, delete the placeholder
 * `Layout` above, and uncomment the two imports at the top. This banner is a block comment on
 * purpose, so stripping `// ` never turns prose into code.
 *
 * Why the 401 is handled HERE rather than in a client error boundary: in production Next.js strips
 * Server Component error messages, so the boundary can no longer tell a stale-session 401 from a
 * generic crash and would show "unexpected error" instead of "session expired". At this point the
 * real error is still intact.
 * ───────────────────────────────────────────────────────────────────────────────────────────────── */

// /** What the paired nest-starter's `GET /auth/me` returns. Adjust to your backend's shape. */
// type MeResponse = {
//   user: { sub: string; name: string; username: string }
// }
//
// /**
//  * A stale or invalidated session — the API answers 401 because the account was removed, the token
//  * expired, or the database was reset while an old cookie is still in the browser.
//  */
// const isUnauthorized = (error: unknown): boolean => {
//   if (error instanceof MainApiError) return error.status === 401
//   const e = error as { status?: number; message?: string } | null
//   if (!e || typeof e !== 'object') return false
//   if (e.status === 401) return true
//   try {
//     return (JSON.parse(e.message ?? '') as { statusCode?: number })?.statusCode === 401
//   } catch {
//     return false
//   }
// }
//
// const Layout = async (props: LayoutProps) => {
//   const { children } = props
//
//   // Run in parallel, but soft-catch `me` so a 401 doesn't reject the whole layout.
//   const [dashboardConfig, meResult] = await Promise.all([
//     getDashboardConfig(),
//     mainApiFetch<MeResponse>('/auth/me').then(
//       (value) => ({ ok: true as const, value }),
//       (error: unknown) => ({ ok: false as const, error })
//     ),
//   ])
//
//   if (!meResult.ok) {
//     // An expected auth failure gets the session-expired screen (logout → login). Anything else is
//     // a real bug and should surface as one.
//     if (isUnauthorized(meResult.error)) {
//       return <SessionExpiredErrorScreen error={meResult.error as Error} />
//     }
//     throw meResult.error
//   }
//
//   // Map the backend's user onto the shell's small UI-shaped type. Extend per project.
//   const user: UserData = {
//     id: meResult.value.user.sub,
//     name: meResult.value.user.name,
//     subtitle: meResult.value.user.username,
//     isOnline: true,
//   }
//
//   return (
//     <UserProvider value={{ user: { data: user } }}>
//       <DynamicSidebarProvider>
//         <BreadcrumbLabelsProvider>
//           <DashboardLayout config={dashboardConfig}>{children}</DashboardLayout>
//         </BreadcrumbLabelsProvider>
//       </DynamicSidebarProvider>
//     </UserProvider>
//   )
// }
