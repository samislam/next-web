import { z } from 'zod'
import { t, type Static } from 'elysia'
import { UNKNOWN_ERR, ACCOUNT_FORZEN, INVALID_CREDENTIALS } from '@/constants'

/**
 * The login form's contract. Shared by the client form (via zodResolver) and the BFF route, so the
 * browser and the server validate the same shape and can never drift.
 */
export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
})

export type LoginFields = z.infer<typeof loginSchema>

export const authActionSuccessSchema = t.Object({
  ok: t.Literal(true),
})

export const authLoginSuccessSchema = authActionSuccessSchema

/**
 * The BFF never forwards the backend's error text to the browser — it maps it to one of a small,
 * closed set of codes, which the form turns into a translated message. That keeps backend wording out
 * of the UI and stops an error body leaking anything about which usernames exist.
 */
export const authLoginErrorSchema = t.Object({
  errorCode: t.Union([
    t.Literal(INVALID_CREDENTIALS),
    t.Literal(ACCOUNT_FORZEN),
    t.Literal(UNKNOWN_ERR),
  ]),
})

export type AuthLoginError = Static<typeof authLoginErrorSchema>
export type AuthLoginErrorCode = AuthLoginError['errorCode']
