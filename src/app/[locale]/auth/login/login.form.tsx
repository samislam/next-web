'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { pageDefs } from '@/config/pages.config'
import { Form } from '@/components/ui/shadcnui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/shadcnui/input'
import { InputField } from '@/components/common/input-field'
import { LoadingButton } from '@/components/ui/shadcnui/loading-button'
import { PasswordInputField } from '@/components/common/password-input-field'
import { LoginFields, loginSchema } from '@/app/api/[[...slugs]]/auth/auth.schemas'

/**
 * The login screen, as a TEMPLATE: submitting just navigates to the home page. It talks to no backend
 * and authenticates nothing, so the template runs with nothing behind it.
 *
 * The real flow — posting to the auth BFF, which exchanges the credentials for a cookie — is written
 * out at the bottom of this file. See also `src/proxy.ts` and `(dashboard)/layout.tsx`, which carry
 * the matching route gates.
 */
export const LoginForm = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const form = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = form.handleSubmit(() => {
    router.push(pageDefs.home.href)
  })

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={onSubmit}>
        <InputField
          required
          name="username"
          label={t('@t<login-username-label>')}
          control={form.control}
          render={(field) => (
            <Input
              {...field}
              dir="auto"
              icon="lucide:UserRound"
              autoComplete="username"
              placeholder={t('@t<login-username-placeholder>')}
              rootClassname="bg-background h-12 rounded-2xl border-border px-4 shadow-none"
            />
          )}
        />

        <PasswordInputField
          name="password"
          label={t('@t<login-password-label>')}
          control={form.control}
          placeholder={t('@t<login-password-placeholder>')}
          showPasswordLabel={t('@t<login-show-password>')}
          hidePasswordLabel={t('@t<login-hide-password>')}
        />

        <LoadingButton
          type="submit"
          className="h-12 w-full rounded-2xl text-base font-bold shadow-sm"
        >
          {t('@t<login-submit-button>')}
        </LoadingButton>
      </form>
    </Form>
  )
}

const DEFAULT_VALUES: LoginFields = {
  username: '',
  password: '',
}

/* ─────────────────────────────────────────────────────────────────────────────────────────────────
 * REAL AUTHENTICATION — an example, not wired up.
 *
 * Uncomment this and use `onSubmit` below in place of the one above. It posts to the auth BFF
 * (`src/app/api/[[...slugs]]/auth/`), which calls your backend and sets the cookie server-side, so
 * the token never reaches client JavaScript. The BFF answers with one of a small set of error codes
 * rather than backend wording.
 *
 * This banner is a block comment on purpose, so stripping `// ` never turns prose into code.
 * ───────────────────────────────────────────────────────────────────────────────────────────────── */

// import { useState } from 'react'
// import { notify } from '@/lib/shadcn/notify'
// import { appApi } from '@/lib/elysia/eden'
// import { useMutation } from '@tanstack/react-query'
// import { type AuthLoginErrorCode } from '@/app/api/[[...slugs]]/auth/auth.schemas'
//
// const [submitError, setSubmitError] = useState<AuthLoginErrorCode | null>(null)
//
// const loginMutation = useMutation({
//   mutationFn: (values: LoginFields) => appApi.auth.login.post(values),
//   onSuccess: () => {
//     notify.success(t('@t<toast-login-success>'))
//     router.push(pageDefs.home.href)
//   },
//   onError: (error) =>
//     setSubmitError(
//       (error as unknown as { value?: { errorCode?: AuthLoginErrorCode } }).value?.errorCode ?? null
//     ),
// })
//
// const onSubmit = form.handleSubmit((values) => {
//   setSubmitError(null)
//   loginMutation.mutate(values)
// })
//
// // ...and render the error above the submit button:
// {submitError ? (
//   <p className="text-destructive text-sm font-medium">
//     {t(errorMessages[submitError] ?? '@t<login-generic-error>')}
//   </p>
// ) : null}
//
// // ...with `loading={loginMutation.isPending}` on the LoadingButton, and:
// const errorMessages: { [K in AuthLoginErrorCode]: string } = {
//   INVALID_CREDENTIALS: '@t<login-invalid-credentials-error>',
//   ACCOUNT_FORZEN: '@t<login-account-frozen-error>',
//   UNKNOWN_ERR: '@t<login-generic-error>',
// }
