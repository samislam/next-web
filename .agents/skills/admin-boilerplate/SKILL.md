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
2. Reuse the existing project helpers before introducing new patterns.
3. Keep examples and starter-only placeholders commented out if they are not meant to run.
4. When adding config or integrations, wire them through the typed env layer and existing app config.
5. Preserve localization, directionality, and theme support in any UI change.

## Working Rules

- For server-rendered translations, prefer `getTranslate()` and `t('@t<key>')`.
- For client translation-aware UI, keep Tolgee and `next-intl` behavior aligned with the existing providers and hooks.
- Do not hardcode text for user-facing UI when it should be localized.
- Respect Arabic RTL handling, including `dir` changes and Cairo font selection.
- Prefer `app.config.ts` and typed env files over scattered constants.
- If Sentry or database support is optional, honor `ENABLE_SENTRY` and `ENABLE_DATABASE`.
- Follow the current Elysia pattern: route handler -> module -> controller -> service -> macro/guard when needed.
- Prefer the shipped UI stack: Shadcn components, local common components, Zustand helpers, TanStack Query, and existing hooks.

## Reference

Load [references/conventions.md](references/conventions.md) when you need the project-specific details for layout wiring, i18n, env flags, Prisma, Sentry, caching, or scripts.
