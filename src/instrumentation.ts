import * as Sentry from '@sentry/nextjs'
import { serverEnv } from '@/server/server-env'

export async function register() {
  if (serverEnv.ENABLE_SENTRY !== 'yes') return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/sentry/sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./lib/sentry/sentry.edge.config')
  }
}

export const onRequestError =
  serverEnv.ENABLE_SENTRY === 'yes' ? Sentry.captureRequestError : undefined
