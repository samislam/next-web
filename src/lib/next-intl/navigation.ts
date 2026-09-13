/**
 * ✅ Custom i18n-aware navigation helpers.
 *
 * These wrappers automatically handle locale prefixes and localized pathnames, avoiding unnecessary
 * redirects that can occur if you use Next.js’ default `<Link>`, `useRouter`, or `usePathname`
 * without a locale.
 *
 * 👉 Prefer using these instead of the base Next.js navigation utilities when working with
 * localized routes, for better performance and SEO.
 *
 * If you use the default Next.js APIs with missing locale prefixes, the middleware will still
 * redirect to the correct locale, but this adds an extra request round-trip.
 *
 * `Link` and `useRouter` additionally drive the dashboard's navigation progress bar — see
 * `./navigation.client`. The rest come straight from next-intl and stay usable from server
 * components.
 *
 * @see https://next-intl.dev/docs/routing/navigation
 */

export { redirect, usePathname, getPathname, permanentRedirect } from './navigation-base'
export { Link, useRouter } from './navigation.client'
