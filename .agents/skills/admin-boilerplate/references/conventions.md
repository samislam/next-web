# Admin Boilerplate Conventions

## Core Architecture

- App root providers live in `src/app/layout.tsx`.
- The root layout mounts `NextIntlClientProvider`, Tolgee, `next-themes`, TanStack Query, `nuqs`, devtools, and shared client helpers.
- Locale decides both document direction and the primary font.

## Localization And Direction

- App languages are defined in `src/config/app.config.ts`.
- `ar` is the RTL language and uses the Cairo font; other locales use Geist.
- Use server translations through `getTranslate()` from `src/lib/tolgee/tolgee-server.ts`.
- Translation keys follow the existing Tolgee pattern like `t('@t<home-title>')`.
- Locale switching flows through `src/hooks/use-locale.ts` and `src/lib/next-intl/change-language.ts`.

## Routing And Middleware

- `src/proxy.ts` is the middleware entry point.
- `src/lib/next-intl/app-routing-def.ts` builds locale routing from app config.
- Keep i18n middleware last if adding auth or other middleware steps.

## UI Conventions

- Reuse Shadcn UI under `src/components/ui/shadcnui`.
- Reuse shared app components under `src/components/common`.
- Keep theme-aware behavior aligned with `next-themes` and the existing `ThemeSwitcher`.
- Do not break RTL layout behavior when editing forms, spacing, or icon placement.

## Env And Feature Flags

- Server env is validated in `src/server/server-env.ts`.
- Client env is validated in `src/server/client-env.ts`.
- `ENABLE_SENTRY` and `ENABLE_DATABASE` are `'yes' | 'no'` flags and default to `'no'`.
- Mirror new optional integrations through env validation and `.env.example`.

## Sentry

- Sentry wiring is optional and guarded by `ENABLE_SENTRY`.
- Runtime registration happens in `src/instrumentation.ts`.
- Next build integration is wrapped conditionally in `next.config.ts`.
- If Sentry is disabled, avoid making DSN or Sentry project values required.

## Database And Prisma

- Prisma schema lives in `src/database/schema.prisma`.
- Generated client output lives in `src/generated/prisma`.
- Prisma access should go through `src/lib/prisma/prisma-client.ts`.
- Setup and Prisma helper scripts should respect `ENABLE_DATABASE`.
- Sample database code that is only educational should stay commented out.

## API Pattern

- The Next route entrypoint is `src/app/api/[[...slugs]]/route.ts`.
- Elysia modules live under `src/app/api/[[...slugs]]/<feature>`.
- Prefer module -> controller -> service separation.
- Shared auth or policy logic belongs in macros/guards like `macros/auth.macro.ts`.

## Data Fetching And State

- TanStack Query provider lives in `src/lib/tanstack-query`.
- Local UI state often uses the small Zustand helper factories in `src/lib/stores`.
- Reuse existing hooks before adding one-off state patterns.

## Caching

- Redis helpers live in `src/lib/redis`.
- `withCache` already supports Redis plus in-memory fallback.
- Honor `ENABLE_REDIS_CACHE` and `ENABLE_FALLBACK_CACHE` rather than bypassing them.

## Scripts

- Common tasks are wrapped in `scripts/*.ts`.
- `scripts/dev.ts` and `scripts/build.ts` select env files automatically.
- `scripts/locales.ts` is the Tolgee sync entrypoint.
- Prefer extending these scripts instead of replacing them with ad hoc commands.
