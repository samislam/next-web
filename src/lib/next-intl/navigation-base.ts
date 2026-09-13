import { appRoutingDef } from './app-routing-def'
import { createNavigation } from 'next-intl/navigation'

/**
 * The raw next-intl navigation helpers.
 *
 * Import from `./navigation` instead — that is the public entry point, and it wraps `Link` and
 * `useRouter` so every navigation drives the progress bar. This module exists only so those wrappers
 * have something to build on without importing themselves in a cycle.
 */
export const {
  //
  Link: BaseLink,
  redirect,
  useRouter: useBaseRouter,
  usePathname,
  getPathname,
  permanentRedirect,
} = createNavigation(appRoutingDef)
