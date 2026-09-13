import { Elysia, status } from 'elysia'
import { authService, BackendAuthError } from './auth.service'
import { UNKNOWN_ERR, ACCOUNT_FORZEN, INVALID_CREDENTIALS } from '@/constants'
import { loginSchema, authLoginSuccessSchema } from './auth.schemas'
import { authActionSuccessSchema, authLoginErrorSchema } from './auth.schemas'

/**
 * The auth BFF.
 *
 * Why the browser never talks to the backend directly for auth: the access token is written into an
 * HTTP cookie by THIS server, so it is never handed to client JavaScript, and the browser only ever
 * sees a small closed set of error codes rather than the backend's own error bodies.
 */
export const authController = new Elysia({ prefix: '/auth' })
  .post(
    '/login',
    async ({ body, cookie, request }) => {
      // Behind a reverse proxy the first hop of x-forwarded-for is the real client; x-real-ip is
      // nginx's single-value equivalent. `server.requestIP` is Bun-only and undefined under Next's
      // fetch adapter, so it is not used here.
      const forwardedFor = request.headers.get('x-forwarded-for')
      const response = await authService.login(body, {
        ip: forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      })
      authService.setAuthCookie(cookie, response.accessToken, response.expiresAt)
      return { ok: true }
    },
    {
      body: loginSchema,
      error: ({ error }) => {
        // Never swallow the real cause silently — log it before returning the generic envelope.
        if (!(error instanceof BackendAuthError)) {
          console.error('[BFF /auth/login] unexpected error:', error)
          return status(500, { errorCode: UNKNOWN_ERR })
        }
        switch (error.status) {
          case 401:
            return status(401, { errorCode: INVALID_CREDENTIALS })
          case 403:
            return status(403, { errorCode: ACCOUNT_FORZEN })
          default:
            console.error('[BFF /auth/login] unmapped backend error:', error.status, error.body)
            return status(500, { errorCode: UNKNOWN_ERR })
        }
      },
      response: {
        200: authLoginSuccessSchema,
        401: authLoginErrorSchema,
        403: authLoginErrorSchema,
        500: authLoginErrorSchema,
      },
    }
  )
  .post(
    '/logout',
    ({ cookie }) => {
      authService.removeAuthCookie(cookie)
      return { ok: true }
    },
    {
      response: {
        200: authActionSuccessSchema,
      },
    }
  )
