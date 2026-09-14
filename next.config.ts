import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import createNextIntlPlugin from 'next-intl/plugin'
import { sentryConfig } from '@/lib/sentry/sentry._next_.config'

const IMAGE_OPTIMIZATION = process.env.IMAGE_OPTIMIZATION
const ENABLE_SENTRY = process.env.ENABLE_SENTRY ?? 'no'

const withNextIntl = createNextIntlPlugin('./src/lib/next-intl/i18n-request.ts')

const nextConfig = {
  output: 'standalone',
  // The local workspace package ships as TypeScript SOURCE (no build step), so Next must compile it
  // like app code. Without this the import resolves to raw .ts and the build fails.
  transpilePackages: ['@samislam/react-datatable', '@samislam/dashboard-layout'],
  images: {
    unoptimized: IMAGE_OPTIMIZATION === 'no' ? false : true,
    remotePatterns: [],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  env: {
    NEXT_PUBLIC_ENABLE_SENTRY: ENABLE_SENTRY,
  },
} satisfies NextConfig

const enhancedConfig = withNextIntl(nextConfig)

export default ENABLE_SENTRY === 'yes'
  ? withSentryConfig(enhancedConfig, sentryConfig)
  : enhancedConfig
