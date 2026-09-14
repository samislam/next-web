# @samislam/dashboard-layout

The dashboard shell — config-driven sidebar, topnav, breadcrumbs and navigation progress — plus the
error screens and tabs layout that go with it.

```tsx
import { DashboardLayout, createDashboardConfig } from '@samislam/dashboard-layout'
```

Add a page anywhere under `src/app/[locale]/(dashboard)/` and it is wrapped in the shell
automatically. The nav lives in `src/config/dashboard.config.ts`.

## Status: separated, not yet decoupled

This is a **physical** extraction. The code lives here instead of in `src/`, but it is not a
standalone library yet: it still imports app code through the `@/*` alias, which resolves only
because `tsconfig.json`'s `paths` apply to the whole program and Next compiles the package through
`transpilePackages`. Copy this folder into another repo as-is and it will not build.

That is deliberate for now — the point was to stop the shell being tangled into `src/` so the real
extraction has somewhere to start.

## What has to be undone to make it standalone

Every `@/…` import below has to become either a prop, a context, or a peer dependency. Roughly in
order of how hard each is:

**Easy — pure utilities, just move or inline them**

- `@/lib/shadcn/utils` (`cn`) — vendor it.
- `@/lib/next-intl/strip-locale`
- `@/hooks/use-ripple`, `@/hooks/use-navigation-progress`, `@/hooks/use-dashboard-segment-back`
- `@/components/icons/layout-helper-icons`, `@/components/ui/samislam/motion`

**Medium — UI primitives the host app also owns**

- `@/components/ui/shadcnui/{button,breadcrumb,tabs}`, `@/components/ui/samislam/lib-icon`,
  `@/components/common/{theme-switcher,confirm.dialog,navigation-wave-listener,auth-image}`

  These are shadcn components the consuming app already has its own copies of. Either ship them with
  the package (and accept duplication) or accept them through a components prop so the app's styling
  wins.

**Hard — genuine app contracts, and the reason this is not a library yet**

- `@/lib/next-intl/navigation` (10 uses) — the shell links and navigates through the app's
  i18n-aware `Link`/`useRouter`. A library cannot assume next-intl, so these have to be injected.
- `@/config/pages.config` + `@/config/breadcrumbs.config` — the shell resolves routes and breadcrumb
  labels from the app's own registries. Those belong as configuration passed in, not imported.
- `@/hooks/use-user` + the `DashboardUser` shape — should be a prop or a context the app provides.
- `@/lib/elysia/eden` — the logout button posts to the app's BFF. Should be an `onLogout` callback.
- `@/config/app.config`, `@/media/logo.png`, `@/constants` — branding and constants, all props.
- `@/lib/shadcn/notify` — toast feedback; should be injected or dropped.
- `@/lib/next-intl/get-current-locale-server` — server-only locale read.

## Styling

The shell is styled with Tailwind classes against the app's design tokens (`--background`,
`--primary`, `--border`, …) defined in `src/app/globals.css`, and relies on the `wave-loading` /
`ui-ripple` utilities there. A standalone version has to ship those or document them as required.
