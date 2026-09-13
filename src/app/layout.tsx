import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import appConfig from '@/config/app.config'
import { getLocale } from 'next-intl/server'
import { clientEnv } from '@/server/client-env'
import { ClientPlugger } from './client-plugger'
import { AppLanguages } from '@/types/app.types'
import { pageDefs } from '@/config/pages.config'
import { NextIntlClientProvider } from 'next-intl'
import { LayoutProps } from '@/lib/next/next-types'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { getStaticData } from '@/lib/tolgee/tolgee-shared'
import { TolgeeNextProvider } from '@/lib/tolgee/tolgee-client'
import { MetadataGenerateFn } from '@/lib/next/metadata-generator'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/shadcnui/sonner'
import { EnvironmentRibbon } from '@/components/common/environment-ribbon'
import { TolgeeLoadingScreen } from '@/components/common/tolgee-loading-screen'
import { TanstackQueryProvider } from '@/lib/tanstack-query/tanstack-query-provider'
import './globals.css'

export default async function RootLayout(props: LayoutProps) {
  const { children } = props
  const locale = (await getLocale()) as AppLanguages // # your logic to fetch the specific user locale
  const locales = await getStaticData([appConfig.fallbackLanguage, locale])
  // Both faces are always present. Which one draws a character is decided by Cairo's unicode-range
  // (see below), not by the locale, so mixed-script screens render each script in its own typeface.
  const fontClassname = `${geistSans.variable} ${cairo.variable}`

  return (
    <NextIntlClientProvider locale={locale}>
      <TolgeeNextProvider locale={locale} locales={locales}>
        <html dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale} suppressHydrationWarning>
          <body className={`${fontClassname} antialiased`}>
            <ThemeProvider
              enableSystem
              attribute="class"
              disableTransitionOnChange
              defaultTheme={appConfig.defaultTheme}
            >
              <TanstackQueryProvider>
                <NuqsAdapter>
                  <EnvironmentRibbon environment={clientEnv.NEXT_PUBLIC_ENVIRONMENT} />
                  {children}
                  <Toaster />
                  <ReactQueryDevtools initialIsOpen={false} />
                  <TolgeeLoadingScreen />
                  <ClientPlugger />
                </NuqsAdapter>
              </TanstackQueryProvider>
            </ThemeProvider>
          </body>
        </html>
      </TolgeeNextProvider>
    </NextIntlClientProvider>
  )
}

const cairo = localFont({
  variable: '--font-cairo',
  display: 'swap',
  /**
   * No auto-generated fallback face.
   *
   * next/font normally emits a companion "cairo Fallback" (a local font with size-adjust metrics)
   * alongside the real one, and that companion carries NO unicode-range — so with Cairo first in the
   * stack it swallowed Latin text and rendered it in Arial. Cairo is here purely to cover Arabic;
   * Geist is the fallback for everything else, and it brings its own metric-matched face.
   */
  adjustFontFallback: false,
  /**
   * Arabic, Arabic Supplement, Arabic Extended-A/B and the Presentation Forms.
   *
   * Declaring a range makes the browser resolve fonts PER GLYPH rather than per page: Arabic renders
   * in Cairo even while the UI is English, and Latin text on an Arabic page keeps Geist instead of
   * falling into Cairo's Latin faces.
   *
   * Written inline because next/font parses these arguments statically — a referenced constant
   * arrives with an empty value and the build fails.
   */
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF, U+0750-077F, U+0870-088E, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200F, U+061C',
    },
  ],
  src: [
    {
      path: './fonts/cairo/static/Cairo-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/cairo/static/Cairo-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      // Cairo's true Regular (400) renders too thin/light for Arabic body text, so we map the default
      // weight to the Medium glyphs. This only affects Arabic — Latin text is drawn by Geist, which
      // keeps its own 400 — so Arabic reads a touch darker without touching the rest of the UI.
      path: './fonts/cairo/static/Cairo-Medium.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/cairo/static/Cairo-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/cairo/static/Cairo-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/cairo/static/Cairo-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/cairo/static/Cairo-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/cairo/static/Cairo-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
})

const geistSans = localFont({
  src: './fonts/geist/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const generateMetadata: MetadataGenerateFn = pageDefs.home.meta
