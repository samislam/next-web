import { PagesDefs } from '@/types/pagedef.types'
import { getTranslate } from '@/lib/tolgee/tolgee-server'

/**
 * The single registry of every route in the app.
 *
 * Nothing should hardcode a path string: `proxy.ts`, the sidebar, breadcrumbs, redirects and links
 * all resolve through here, so moving a route is one edit rather than a grep. Each entry carries its
 * own label/icon/metadata so those stay with the route instead of drifting across the components
 * that render it.
 */
export const pageDefs = {
  home: {
    href: '/',
    label: '@t<home-title>',
    title: '@t<home-title>',
    description: '@t<home-description>',
    icon: 'mdi:mdiHome',
    async meta() {
      const t = await getTranslate()
      return {
        title: t('@t<home_meta.title>'),
        description: t('@t<home_meta.description>'),
      }
    },
  },
  login: {
    href: '/auth/login',
    label: '@t<login-title>',
    title: '@t<login-title>',
    icon: 'mdi:mdiLoginVariant',
    async meta() {
      const t = await getTranslate()
      return {
        title: t('@t<login_meta.title>'),
        description: t('@t<login_meta.description>'),
      }
    },
  },
} as const satisfies PagesDefs
