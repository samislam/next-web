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
- For route `page.tsx` files, use the shared `PageProps` type from `src/lib/next/next-types.ts` and pass route-specific generics such as `PageProps<{ Params: { id: string } }>` instead of redefining `PageProps` locally.

## UI Conventions

- Reuse Shadcn UI under `src/components/ui/shadcnui`.
- Reuse shared app components under `src/components/common`.
- Keep theme-aware behavior aligned with `next-themes` and the existing `ThemeSwitcher`.
- Do not break RTL layout behavior when editing forms, spacing, or icon placement.
- Dashboard sidebar items can define `catchPattern` in `src/config/dashboard.config.ts` when a parent nav item should remain active for nested child routes, for example `pageDefs.users.href + '/**'`.
- Prefer named component exports like `export const ComponentName = (props: ComponentNameProps) => {}`.
- Do not destructure props in the function parameter list; receive `props` and destructure inside the component body when useful.
- Name props types after the component, for example `LoginFormProps` or `DoorProps`, instead of generic names like `Props`.
- Keep imports on single lines when possible.
- If a named import would wrap across multiple lines, repeat the import source instead of using a wrapped multi-line import block.

## Form Conventions

- Use `react-hook-form` for app forms.
- Prefer wrapping controls with `InputField` instead of placing raw `Input` usage directly in page markup.
- Reusable input behaviors, such as password visibility toggles, should live in `src/components/common`.
- In module features like `users/`, keep a single `schemas/` folder at the module root.
- Use the `.schema.ts` naming convention, for example `users/schemas/create-user.schema.ts`.
- Put route pages inside a module-local `(routes)/` folder, for example `users/(routes)/create/page.tsx`.
- `page.tsx` is reserved for actual route files and should stay a server component.
- Put module-specific reusable UI pieces in a `composables/` folder at the module root.
- Form components inside `composables/` should use the `.form.tsx` naming convention, for example `users/composables/create-user.form.tsx`.
- Datatable components inside `composables/` should use the `.datatable.tsx` naming convention, for example `payment-methods/composables/payment-methods.datatable.tsx`.
- Dialog components inside `composables/` should use the `.dialog.tsx` naming convention, for example `payment-methods/composables/create-payment-method.dialog.tsx`.
- Do not keep module datatable setup inside route `page.tsx` files.
- If a module page needs a datatable, the route page should render a dedicated composable and the table columns, cells, and row rendering should live in that module `.datatable.tsx` file.
- Do not keep the open trigger button inside the dialog component itself.
- Prefer composing the trigger from the outside, for example `<CreatePaymentMethodDialog><Button>Open</Button></CreatePaymentMethodDialog>`.
- If dialog visibility must be shared across the module, prefer the existing store helpers in `src/lib/stores/create-togglable-store.ts` or `src/lib/stores/create-togglable-with-state-store.ts`.
- If a dialog is controlled by URL query state such as `?dialog=create`, define the allowed dialog values inside `pageDefs`, for example `pageDefs.paymentMethods.dialogs.create`.
- You can use `nuqs` directly to read and write URL-controlled dialog state, but the recommended default is the built-in `useDialogQueryParam` hook in `src/hooks/use-dialog-query-param.ts`, which already relies on `nuqs` internally.
- Reserved query parameter names like `dialog`, `id`, and `tab` should live in `src/constants.ts` inside the `QUERY_PARAMS` object and should be reused instead of hardcoding query keys.
- If page tabs should be URL-controlled, define the allowed tab values in `pageDefs`, for example `pageDefs.me.tabs.profile` and `pageDefs.me.tabs.accountSecurity`.
- Use `nuqs` with `QUERY_PARAMS.tab` to keep the active tab in the URL instead of using isolated local state.
- Library-specific configuration should live under `src/lib/<library-name>`.
- Generated code should be written under `src/generated`.
- Do not define ad hoc API response zod schemas inside component files as a workaround for missing generated SDK types.
- When using Swagger and Orval, backend response DTOs are the source of truth. Fix the backend contract and regenerate the SDK instead of manually recreating response types in the frontend.
- Do not create empty `schemas/`, `composables/`, or other structural folders unless they are actually needed.
- Each schema file should export both the zod schema and its inferred type.
- In form components, keep defaults in a typed constant like `const DEFAULT_VALUES: LoginFields = { ... }` near the end of the file instead of inline `defaultValues` objects.

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
- Prefer Elysia API routes over Next server actions when a feature already fits the app API layer and can be expressed cleanly through the existing Elysia module/controller/service structure.
- In Elysia route controllers, prefer letting handlers throw naturally and map custom errors through the route `error` option or macro `error` hook instead of wrapping each handler in a local `try/catch`.
- In `error` handlers and similar control-flow blocks, prefer early guard returns instead of wrapping the main branch in a big `if`.
- When comparing against a discriminator like a string `errorCode`, prefer a `switch` block over multiple `if`/`else if` checks.
- When a branch only returns a short payload, prefer the compact single-line return form over expanded multi-line object literals.

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
