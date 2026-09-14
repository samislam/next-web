import { COOKIES } from '@/constants'
import { serverEnv } from '@/server/server-env'
import { mainApiBaseUrl } from '@/lib/main-api/base-url'
import type { AuthCookieStore, BackendLoginResponse } from './auth.types'

export class AuthService {
  /**
   * Stores the backend's access token in an HTTP cookie.
   *
   * The cookie expiry is the token's OWN `expiresAt`, so the browser stops sending a token the
   * backend would reject anyway — and `proxy.ts`, which only checks for the cookie's presence, can
   * treat "cookie exists" as "plausibly signed in".
   *
   * `secure` follows REQUIRE_HTTPS so local http development still works while production refuses to
   * put the token on a plaintext connection. `sameSite: 'lax'` keeps the cookie on top-level
   * navigations (so a link into the app stays signed in) while blocking cross-site POSTs.
   */
  setAuthCookie(cookie: AuthCookieStore, accessToken: string, expiresAt: string) {
    cookie[COOKIES.MAIN_API__AUTH].set({
      value: accessToken,
      expires: new Date(expiresAt),
      path: '/',
      sameSite: 'lax',
      secure: serverEnv.REQUIRE_HTTPS,
    })
  }

  removeAuthCookie(cookie: AuthCookieStore) {
    cookie[COOKIES.MAIN_API__AUTH].remove()
  }

  /**
   * Calls the backend's login endpoint.
   *
   * Deliberately a plain `fetch` rather than a generated SDK call, so the template works against the
   * paired nest-starter API out of the box with no SDK to generate first. Once this project has its
   * own typed SDK, replace the body of this method with:
   *
   * ```ts
   * return mainApiServer.v1.auth.login(credentials)
   * ```
   *
   * and let the SDK's HttpError carry the status through to the controller's error mapping.
   *
   * The real client's IP and user-agent are forwarded as `x-client-*`: the backend sits behind THIS
   * server, so its own `@Ip()` would only ever see this machine, and any login log or geolocation
   * would record the server instead of the person.
   */
  async login(
    credentials: { username: string; password: string },
    context: { ip?: string; userAgent?: string } = {}
  ): Promise<BackendLoginResponse> {
    const response = await fetch(`${mainApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(context.ip ? { 'x-client-ip': context.ip } : {}),
        ...(context.userAgent ? { 'x-client-user-agent': context.userAgent } : {}),
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new BackendAuthError(response.status, await response.text())
    }

    return (await response.json()) as BackendLoginResponse
  }
}

/** A non-2xx from the backend, carrying the status so the controller can map it to an error code. */
export class BackendAuthError extends Error {
  constructor(
    readonly status: number,
    readonly body: string
  ) {
    super(`Backend auth failed with ${status}`)
    this.name = 'BackendAuthError'
  }
}

export const authService = new AuthService()
