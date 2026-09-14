import { z } from 'zod'
import { createEnv } from '@t3-oss/env-nextjs'

/**
 * Every variable has a working development default, so a fresh clone runs with NO `.env` file at all.
 * A deployment overrides them; nothing here is required for the app to start.
 */

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_ENABLE_SENTRY: z.enum(['yes', 'no']).default('no'),
    NEXT_PUBLIC_TOLGEE_API_KEY: z.string().trim().optional(),
    NEXT_PUBLIC_TOLGEE_API_URL: z.string().url().trim().optional(),
    NEXT_PUBLIC_TOLGEE_PROJECT_ID: z.union([z.number(), z.string()]).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_ENVIRONMENT: z
      .enum(['production', 'staging', 'testing', 'localhost'])
      .default('localhost'),
    // ? EXTERNAL BACKEND — off by default, and deliberately not required.
    // ?
    // ? next-web is a standalone full-stack app: the Elysia routes under `src/app/api/[[...slugs]]/`
    // ? are a complete backend, and many projects never add another one. Others talk to a separate
    // ? API instead, and some do both. Because none of those is "the" shape, this variable is not
    // ? part of the validated schema and has NO default — nothing is assumed about where, or
    // ? whether, a backend lives.
    // ?
    // ? The code paths that do call an external API read it through `mainApiBaseUrl()`
    // ? (src/lib/main-api/base-url.ts), which fails with a clear message if it is missing. Uncomment
    // ? the two lines below if you would rather have it validated at boot instead.
    // NEXT_PUBLIC_MAIN_API_BASE_URL: z
    //   .string()
    //   .trim()
    //   .url()
    //   .transform((value) => value.replace(/\/+$/, '')),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENABLE_SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY,
    NEXT_PUBLIC_TOLGEE_API_KEY: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    NEXT_PUBLIC_TOLGEE_API_URL: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    NEXT_PUBLIC_TOLGEE_PROJECT_ID: process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    // NEXT_PUBLIC_MAIN_API_BASE_URL: process.env.NEXT_PUBLIC_MAIN_API_BASE_URL,
  },
})
