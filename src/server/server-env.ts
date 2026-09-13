import { z } from 'zod'
import { createEnv } from '@t3-oss/env-nextjs'

/**
 * Every variable has a working development default, so a fresh clone runs with NO `.env` file at all.
 *
 * A note on the boolean flags: `experimental__runtimeEnv` has to hand `createEnv` a real boolean, so
 * the value is resolved HERE, not by the zod `.default()` — which never fires, because this object
 * always supplies a value. Writing `process.env.X === 'true'` would therefore make every flag default
 * to FALSE regardless of what the schema says. {@link boolEnv} keeps the declared default intact and
 * still lets `.env` turn a flag off explicitly.
 */
const boolEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value.trim() === '') return fallback
  return ['true', '1', 'yes'].includes(value.trim().toLowerCase())
}

const port = process.env.PORT ? +process.env.PORT : 3000

export const serverEnv = createEnv({
  server: {
    PORT: z.number().default(3000),
    APP_ORIGIN: z
      .string()
      .trim()
      .url()
      .transform((value) => value.replace(/\/+$/, '')),
    ENABLE_SENTRY: z.enum(['yes', 'no']).default('no'),
    ENABLE_DATABASE: z.enum(['yes', 'no']).default('no'),
    ENABLE_FALLBACK_CACHE: z.boolean().default(true),
    ENABLE_REDIS_CACHE: z.boolean().default(true),
    REDIS_URL: z.string().trim().url().optional(),
    REQUIRE_HTTPS: z.boolean().default(true),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    IMAGE_OPTIMIZATION: z.enum(['yes', 'no']).default('yes'),
  },
  experimental__runtimeEnv: {
    PORT: port,
    // Follows PORT, so a dev server on another port still describes itself correctly.
    APP_ORIGIN: process.env.APP_ORIGIN ?? `http://localhost:${port}`,
    ENABLE_SENTRY: process.env.ENABLE_SENTRY,
    ENABLE_DATABASE: process.env.ENABLE_DATABASE,
    ENABLE_FALLBACK_CACHE: boolEnv(process.env.ENABLE_FALLBACK_CACHE, true),
    ENABLE_REDIS_CACHE: boolEnv(process.env.ENABLE_REDIS_CACHE, true),
    REDIS_URL: process.env.REDIS_URL,
    // On in production, off elsewhere — so local http development works while a deployment that
    // forgot to set this still gets secure cookies rather than silently insecure ones.
    REQUIRE_HTTPS: boolEnv(process.env.REQUIRE_HTTPS, process.env.NODE_ENV === 'production'),
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    IMAGE_OPTIMIZATION: process.env.IMAGE_OPTIMIZATION,
  },
})
