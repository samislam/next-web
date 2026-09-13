/**
 * The shape of Elysia's cookie store, narrowed to what {@link AuthService} needs.
 *
 * Declared here rather than imported from Elysia so the service stays testable and doesn't depend on
 * the framework's internal cookie types.
 */
export type AuthCookieStore = Record<
  string,
  {
    set: (value: {
      value: string
      expires?: Date
      path?: string
      sameSite?: true | false | 'lax' | 'strict' | 'none'
      secure?: boolean
      maxAge?: number
    }) => unknown
    remove: () => unknown
  }
>

/** What the backend returns from a successful login. */
export type BackendLoginResponse = {
  accessToken: string
  /** ISO timestamp; used verbatim as the auth cookie's expiry so the two can never disagree. */
  expiresAt: string
}
