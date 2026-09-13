'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { notify } from '@/lib/shadcn/notify'
import { appApi } from '@/lib/elysia/eden'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { pageDefs } from '@/config/pages.config'
import { useMutation } from '@tanstack/react-query'
import { Form } from '@/components/ui/shadcnui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/shadcnui/input'
import { InputField } from '@/components/common/input-field'
import { LoadingButton } from '@/components/ui/shadcnui/loading-button'
import { PasswordInputField } from '@/components/common/password-input-field'
import { type AuthLoginErrorCode } from '@/app/api/[[...slugs]]/auth/auth.schemas'
import { LoginFields, loginSchema } from '@/app/api/[[...slugs]]/auth/auth.schemas'

export const LoginForm = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const [submitError, setSubmitError] = useState<AuthLoginErrorCode | null>(null)
  const form = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const loginMutation = useMutation({
    // Posts to our own BFF, not the backend: the BFF is what sets the auth cookie, so the token never
    // reaches client JavaScript.
    mutationFn: (values: LoginFields) => appApi.auth.login.post(values),
    onSuccess: () => {
      notify.success(t('@t<toast-login-success>'))
      // A plain push, NOT the i18n-aware router: the destination is resolved from pageDefs and the
      // middleware re-applies the locale prefix.
      router.push(pageDefs.home.href)
    },
    onError: (error) =>
      setSubmitError(
        (error as unknown as { value?: { errorCode?: AuthLoginErrorCode } }).value?.errorCode ??
          null
      ),
  })

  const onSubmit = form.handleSubmit((values) => {
    setSubmitError(null)
    loginMutation.mutate(values)
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

        {submitError ? (
          <p className="text-destructive text-sm font-medium">
            {t(errorMessages[submitError] ?? '@t<login-generic-error>')}
          </p>
        ) : null}

        <LoadingButton
          type="submit"
          loading={loginMutation.isPending}
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

/**
 * The BFF returns a code, never backend wording — so the message the user reads is ours and
 * translated. An unmapped code falls back to the generic message.
 */
const errorMessages: { [K in AuthLoginErrorCode]: string } = {
  INVALID_CREDENTIALS: '@t<login-invalid-credentials-error>',
  ACCOUNT_FORZEN: '@t<login-account-frozen-error>',
  UNKNOWN_ERR: '@t<login-generic-error>',
}
