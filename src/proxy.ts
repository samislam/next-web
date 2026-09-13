import { NextRequest } from 'next/server'
import createi18nMiddleware from 'next-intl/middleware'
import { middlewareStack, pipe } from 'nextjs-middleware-stack'
import { appRoutingDef } from './lib/next-intl/app-routing-def'

/* ─────────────────────────────────────────────────────────────────────────────────────────────────
 * AUTHENTICATION — off by default.
 *
 * To enable: remove the leading `// ` from every commented line in this file, and do the same in
 * `src/app/[locale]/(dashboard)/layout.tsx`. This banner is a block comment on purpose, so stripping
 * `// ` never turns prose into code.
 *
 * The gates are a PRESENCE check, not an authorization check. The cookie is opaque here — the token
 * is verified by the backend on every call — so all they do is keep signed-out visitors off app
 * routes and signed-in ones off the login page. Real enforcement happens where the data is: the API
 * rejects a missing, expired or forged token regardless of what this middleware allowed through.
 * Treating the cookie as proof of identity here would be the bug.
 * ───────────────────────────────────────────────────────────────────────────────────────────────── */

// import { COOKIES } from '@/constants'
// import { pageDefs } from '@/config/pages.config'

// /**
//  * Patterns are matched against the pathname AFTER next-intl has been given a chance to run, so
//  * they are written without a locale prefix.
//  */
// const regExp = {
//   publicRoutes: /^\/auth(?:\/.*)?$/,
//   protectedRoutes: /^(?!\/auth(?:\/|$)).*/,
// }

export default middlewareStack<NextRequest>([
  // pipe(regExp.protectedRoutes, (req) => {
  //   const authToken = req.cookies.get(COOKIES.MAIN_API__AUTH)?.value
  //   if (authToken) return
  //   req.nextUrl.pathname = pageDefs.login.href
  // }),
  // pipe(regExp.publicRoutes, (req) => {
  //   const authToken = req.cookies.get(COOKIES.MAIN_API__AUTH)?.value
  //   if (!authToken) return
  //   req.nextUrl.pathname = pageDefs.home.href
  // }),

  // i18n middleware last.
  pipe(() => true, createi18nMiddleware(appRoutingDef)),
])

export const config = {
  matcher: [
    // Run middleware for page routes only (exclude API, internals, assets, and root static files).
    // A service worker (sw.js) must be served as-is from the root — no locale rewrite — so add it
    // here if you register one.
    '/((?!api|_next|_diag|assets|favicon\\.ico|robots\\.txt|sitemap\\.xml|site\\.webmanifest).*)',
  ],
}
