<p align="center">
  <img src="src/media/logo.png" alt="Next-web logo" width="160">
</p>

# Next-web Starter Template

Starter kit for building localized Next.js 16 (App Router) web apps with React 19, TypeScript, Tailwind CSS v4, Tolgee + next-intl, Prisma (MongoDB), Shadcn UI, Radix primitives, and a handful of developer utilities prewired.

## Features
- Localization: next-intl routing + Tolgee translations (preloaded `en`, `ar`, `tr`), RTL-aware layout, locale cookie, and CLI sync scripts.
- Styling & UI: Tailwind v4, Shadcn UI components, Radix UI, Lucide/Mdi icons, themes via `next-themes`, framer-motion ready.
- Data & State: Prisma Client generated to `src/generated/prisma`, MongoDB datasource, TanStack Query (with devtools), Zustand, React Hook Form + Zod validation.
- Tooling: ESLint, Prettier (with Tailwind plugin), TypeScript strictness, postcss, handy CL scripts for dev/build/lint/format/clean.
- App scaffold: App Router with metadata helpers, shared page definitions, global fonts, and sample home page showing language/theme switchers.

## Prerequisites
- Node.js version supported by Next.js 16 (a `.nvmrc` with `v22.16.0` is provided as a baseline, but any compatible 18+ runtime works).
- Package manager: Bun lockfile is present (`bun.lock`); Bun is the default, but npm/pnpm/yarn are fine. If you prefer Deno or plain Node, use their equivalents.
- Database connection string for `DATABASE_URL` (Prisma works with any supported provider; the default schema targets MongoDB and can be changed).
- Tolgee project credentials (`NEXT_PUBLIC_TOLGEE_API_KEY`, `NEXT_PUBLIC_TOLGEE_API_URL`, `TOLGEE_PROJECT_ID`).

## Getting Started
1) Install dependencies (example with Bun):
```bash
bun install
```
2) Copy environment template and fill values:
```bash
cp .env.example .env.development
# update PORT, Tolgee keys, DATABASE_URL, etc.
```
3) Generate the Prisma client (reads your `.env.*` file):
```bash
bun run setup
```
4) Start the dev server (uses the first matching `.env.development*.env` file):
```bash
bun run dev
```
Visit http://localhost:3000.

## Available Scripts
- `bun run dev` – Start Next.js in development with dotenv loading (use the equivalent `npm run dev`/`pnpm dev`/`yarn dev` if you switch package managers).
- `bun run build` – Build the Next.js app and compile scripts.
- `bun run start` – Run the production server (after `build`).
- `bun run lint` – Type-check (ts-patch) then run ESLint.
- `bun run format` – Prettier format common source files.
- `bun run clean` – Remove `.next`, `dist`, `node_modules`, and TS build info files.
- `bun run setup` – Load env + `prisma generate`.
- `bun run prisma` – Interactive Prisma helper (generate/push/migrate/seed/studio/etc.).
- `bun run locales` – Interactive Tolgee CLI helper (push/pull/compare/sync locales).

## Localization (Tolgee + next-intl)
- Translation files live in `src/i18n/*.json`; keys are extracted via Tolgee (`tolgee.config.mjs`).
- Use `bun run locales pull|push|compare|sync` to keep Tolgee and the repo in sync (requires Tolgee env vars).
- Language routing is under `src/app/[locale]`, with `localePrefix: 'always'`; RTL is enabled for Arabic.

## Prisma & Database
- Schema: `src/database/schema.prisma` currently targets MongoDB with a sample `Example` model. Swap the `datasource` provider/url to any Prisma-supported database (Postgres, MySQL, SQLite, etc.) as needed.
- Generated client output: `src/generated/prisma`.
- Seeds: add seeders in `src/database/seed.ts` and run `bun run prisma seed`.
- Adjust Prisma config in `prisma.config.ts` if you change paths or add migrations.

## Project Structure (high level)
- `src/app` – App Router entry, layouts, locales, error/not-found pages.
- `src/components` – Reusable UI components (Shadcn/Radix).
- `src/config` – App + page definitions and other configuration.
- `src/i18n` – Static translation JSON files.
- `src/lib` – Integrations (Tolgee, Prisma helpers, metadata, TanStack Query).
- `src/database` – Prisma schema and seeding.
- `public` – Static assets (includes `favicon.ico`, logo).

## Deployment Notes
- Build with `bun run build`; start with `bun run start`.
- Ensure production env vars are set (`.env.production*` is auto-picked up by scripts).
- If using a different package manager, run the equivalent `npm run ...`/`pnpm ...` commands.
