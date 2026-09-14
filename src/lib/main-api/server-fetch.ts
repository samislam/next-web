import 'server-only'

import { COOKIES } from '@/constants'
import { headers, cookies } from 'next/headers'
import { mainApiBaseUrl } from './base-url'

/** A non-2xx from the backend. Carries the status so callers can tell a 401 from a real failure. */
export class MainApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string
  ) {
    super(`Main API responded ${status}`)
    this.name = 'MainApiError'
  }
}

/**
 * A request-scoped call to the backend from server code.
 *
 * It forwards three things the backend cannot work out for itself:
 * - the auth cookie, as a bearer token (the backend never sees our cookie);
 * - the real client's IP and user-agent as `x-client-*`, because the backend sits behind THIS server
 *   and its own `@Ip()` would otherwise attribute every request to the VPS;
 * - nothing else — no ambient state, so the call is safe to run in parallel.
 *
 * This is the plain-fetch stand-in for a generated SDK, so the template works against the paired
 * nest-starter with nothing to generate first. Once the project has a typed SDK, replace the call
 * sites with it and keep the header logic here.
 */
export async function mainApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const requestHeaders = await headers()
  const cookieStore = await cookies()
  const authToken = cookieStore.get(COOKIES.MAIN_API__AUTH)?.value
  const userAgent = requestHeaders.get('user-agent') ?? undefined
  const forwardedFor = requestHeaders.get('x-forwarded-for')
  const clientIp =
    forwardedFor?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || undefined

  const response = await fetch(`${mainApiBaseUrl()}${path}`, {
    ...init,
    // Never cache an authenticated response: it is scoped to one signed-in user.
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      ...(userAgent ? { 'x-client-user-agent': userAgent } : {}),
      ...(clientIp ? { 'x-client-ip': clientIp } : {}),
      ...init.headers,
    },
  })

  if (!response.ok) throw new MainApiError(response.status, await response.text())

  return (await response.json()) as T
}
