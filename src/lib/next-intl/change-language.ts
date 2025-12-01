'use server'

import { cookies } from 'next/headers'
import { redirect } from './navigation'
import appConfig from '@/config/app.config'
import { LOCALE_COOKIE } from '@/constants'
import { stripLocale } from './strip-locale'
import { AppLanguages } from '@/types/app.types'

export async function changeLocale(newLocale: AppLanguages, currentPath: string) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, newLocale, appConfig.i18nRoutingDef.localeCookie)
  redirect({ href: stripLocale(currentPath), locale: newLocale }) // 👈 redirect to current page to re-resolve the locale
}
