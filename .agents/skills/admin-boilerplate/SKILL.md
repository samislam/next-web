---
name: admin-boilerplate
description: Use when working inside the `admin` app of this repository to follow its built-in Next.js boilerplate conventions for localization, RTL/LTR, Tolgee, theme handling, env flags, Prisma, Sentry, caching, and the Elysia API scaffold.
---

# Admin Boilerplate

## Overview

This skill helps Codex make changes in the `admin` project without breaking the starter's existing architecture. Use it for new pages, components, API endpoints, env wiring, localization work, database-backed features, and middleware/auth scaffolding.

## When To Use

Use this skill when the task touches:

- `admin/src/app`, `admin/src/components`, `admin/src/hooks`, or `admin/src/config`
- locale-aware routing, Tolgee keys, `next-intl`, or RTL/LTR behavior
- theme switching, providers in the root layout, or shared UI conventions
- `admin/src/app/api/[[...slugs]]` or Elysia module/controller/service wiring
- server or client env variables, especially feature flags like `ENABLE_SENTRY` and `ENABLE_DATABASE`
- Prisma, Redis cache helpers, Sentry, TanStack Query, or boilerplate setup scripts

## Workflow

1. Read [references/conventions.md](references/conventions.md) before making structural changes.
2. Read [references/breadcrumbs.md](references/breadcrumbs.md) when adding pages, routes, or breadcrumb behavior.
3. Reuse the existing project helpers before introducing new patterns.
4. Keep examples and starter-only placeholders commented out if they are not meant to run.
5. When adding config or integrations, wire them through the typed env layer and existing app config.
6. Preserve localization, directionality, and theme support in any UI change.

## Working Rules

- For server-rendered translations, prefer `getTranslate()` and `t('@t<key>')`.
- For client translation-aware UI, keep Tolgee and `next-intl` behavior aligned with the existing providers and hooks.
- Do not hardcode text for user-facing UI when it should be localized.
- Respect Arabic RTL handling, including `dir` changes and Cairo font selection.
- Prefer named exports for components, for example `export const LoginForm = (...) => {}`.
- Do not destructure props in the component parameter list; accept `props` first, then destructure inside the component body when needed.
- When a component has props, define a dedicated props type named after the component, for example `DoorProps`, not generic names like `Props`.
- Keep imports on single lines when possible; if an import would wrap across multiple lines, repeat the import source instead of using a wrapped multi-line named import block.
- When creating forms, use `react-hook-form` as the default form state layer.
- Prefer `InputField` for standard form inputs instead of hand-rolling label/input/message wiring in each form.
- For module-based features, keep a single `schemas/` folder at the module root and use the `.schema.ts` naming convention.
- Route pages inside a module should live under a `(routes)/` folder.
- `page.tsx` is reserved for real Next route files and should always remain a server component.
- For Next route files, reuse the shared `PageProps` type from `src/lib/next/next-types.ts` instead of redefining page prop types locally.
- Module-specific reusable components should live under a `composables/` folder at the module root.
- Form components in `composables/` should use the `.form.tsx` naming convention.
- Datatable components in `composables/` should use the `.datatable.tsx` naming convention.
- Dialog components in `composables/` should use the `.dialog.tsx` naming convention.
- Do not define module datatable columns or render module datatables directly inside route `page.tsx` files.
- If a page needs a module-specific table, extract it into a module composable such as `payment-methods/composables/payment-methods.datatable.tsx` and render that composable from the page.
- When a sidebar item should stay active for nested routes, add a `catchPattern` in `src/config/dashboard.config.ts`, for example `pageDefs.orders.href + '/**'`.
- Do not place the open trigger button inside the dialog component itself.
- Prefer external trigger composition such as `<CreateThingDialog><Button>Open</Button></CreateThingDialog>` or use the existing togglable store helpers like `createTogglableStore` or `createTogglableWithStateStore` when shared dialog state is needed.
- If a dialog should be controlled by URL query state, define its values in `pageDefs`, for example `pageDefs.paymentMethods.dialogs.create`.
- For URL-controlled dialogs, you can use `nuqs`, but the recommended default is the built-in `useDialogQueryParam` hook which relies on `nuqs` internally.
- For URL-controlled dialogs, reuse reserved query keys from `src/constants.ts`, for example `QUERY_PARAMS.dialog` and `QUERY_PARAMS.id`.
- If tabs should be reflected in the URL, define the allowed tab values in `pageDefs`, for example `pageDefs.me.tabs.profile`.
- For URL-controlled tabs, use `QUERY_PARAMS.tab` from `src/constants.ts` and back the tab state with `nuqs`.
- Library-specific configuration should live under `src/lib/<library-name>`.
- Generated code should be written under `src/generated`.
- Do not write ad hoc API response zod schemas inside component files to compensate for missing generated SDK types.
- If Swagger/Orval types are wrong or missing, fix the backend Swagger contract and regenerate the SDK instead of papering over it in the frontend.
- Always export both the zod schema and its `z.infer` type from the schema file.
- Keep form `DEFAULT_VALUES` as a typed constant near the end of the form component file instead of inline object literals in `useForm`.
- In client components, prefer TanStack Query for async server-state workflows instead of ad hoc local pending state.
- For client-side form submissions or imperative API writes, prefer `useMutation` as the default pattern unless there is a strong reason not to.
- Prefer `app.config.ts` and typed env files over scattered constants.
- If Sentry or database support is optional, honor `ENABLE_SENTRY` and `ENABLE_DATABASE`.
- Follow the current Elysia pattern: route handler -> module -> controller -> service -> macro/guard when needed.
- Prefer Elysia API routes over Next server actions when possible, especially for app-facing API workflows that fit the existing `src/app/api/[[...slugs]]` architecture.
- In Elysia controllers, do not wrap route handlers in manual `try/catch` by default. Let the handler throw and use Elysia's `error` hook in the route options or macro layer when custom error mapping is needed.
- In Elysia `error` handlers or similar branching logic, prefer early-return guard clauses such as `if (!(error instanceof HttpError)) return ...` instead of wrapping the main logic in a large `if` block.
- Prefer `switch` over chained `if`/`else if` when branching on a discriminator value such as a string `errorCode`, `type`, or `status`.
- For short return-only branches or guard clauses, prefer compact single-line returns instead of expanded multi-line object literals.
- For short callback bodies that only perform a single expression, prefer concise single-line arrow functions, for example `onSuccess: () => router.push(pageDefs.home.href)`.
- Prefer the shipped UI stack: Shadcn components, local common components, Zustand helpers, TanStack Query, and existing hooks.

## Reference

Load [references/conventions.md](references/conventions.md) when you need the project-specific details for layout wiring, i18n, env flags, Prisma, Sentry, caching, or scripts.
Load [references/breadcrumbs.md](references/breadcrumbs.md) when you are adding or editing pages, links, or breadcrumb behavior.
