import { LoginForm } from './login.form'
import appConfig from '@/config/app.config'
import { AppIcon } from '@/components/common/app-icon'
import { getTranslate } from '@/lib/tolgee/tolgee-server'
import { ThemeSwitcher } from '@/components/common/theme-switcher'
import { MetadataGenerateFn } from '@/lib/next/metadata-generator'
import { LanguageSwitcher } from '@/components/common/language-switcher'

/**
 * Split-panel login.
 *
 * The left panel is the brand surface — replace its gradient, wordmark and blurb per project; it is
 * hidden below `lg`, where a compact brand strip takes over. The right panel is deliberately plain
 * and theme-token-driven, so the form looks correct in light, dark and RTL without special-casing.
 */
const Page = async () => {
  const t = await getTranslate()

  return (
    <main className="text-foreground min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── Brand panel (replace per project) ─────────────────────────────────────────────── */}
        <aside
          className="from-primary/90 to-primary relative hidden overflow-hidden bg-gradient-to-br via-sky-900 lg:flex lg:flex-col lg:justify-between"
          style={{
            background:
              'radial-gradient(120% 85% at 50% 32%, #0e355f 0%, #0a2542 44%, #060f1e 100%)',
          }}
        >
          <div className="relative z-10 flex items-center gap-3 p-10">
            <AppIcon className="h-9 w-auto" />
            <span className="text-2xl font-semibold tracking-tight text-sky-50">
              {appConfig.appName}
            </span>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
            <p className="max-w-md text-center text-3xl leading-snug text-sky-100/90">
              {t('@t<login-title>')}
            </p>
          </div>

          <div className="relative z-10 p-10 text-xs tracking-wider text-sky-200/40">
            {appConfig.appName}
          </div>
        </aside>

        {/* ── Auth panel ───────────────────────────────────────────────────────────────────── */}
        <section className="bg-background relative flex flex-col">
          <div className="flex justify-end p-5">
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="bg-card border-border h-10 rounded-full shadow-sm" />
              <div className="bg-card border-border rounded-full border p-1 shadow-sm">
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
            <div className="w-full max-w-md">
              {/* Compact brand strip — the panel above is hidden below lg. */}
              <div className="mb-7 lg:hidden">
                <div className="mb-5 flex items-center gap-3">
                  <AppIcon className="h-10 w-auto" />
                  <span className="text-xl font-semibold tracking-tight">{appConfig.appName}</span>
                </div>
                <h1 className="text-2xl leading-snug">{t('@t<login-title>')}</h1>
              </div>

              <div className="bg-card border-border rounded-[1.6rem] border p-7 shadow-sm sm:p-9">
                <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">
                  {t('@t<login-badge>')}
                </p>
                <div className="bg-primary/40 mt-2 mb-7 h-px w-10" />
                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Page

export const generateMetadata: MetadataGenerateFn = async () => {
  const t = await getTranslate()

  return {
    title: t('@t<login_meta.title>'),
    description: t('@t<login_meta.description>'),
  }
}
