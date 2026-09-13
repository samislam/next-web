/**
 * Pulls the human-readable message out of a main-API error.
 *
 * The nestia/typia `HttpError` carries the RAW response body as its `.message` (a JSON string like
 * `{"statusCode":409,"message":"…","error":"Conflict"}`) — so `error.message` is the whole body, not
 * the field we want. This parses that body and returns its `message` (a string, or a joined string[]
 * for validation errors). Falls back to a directly-exposed `.value` body, then to the raw string if
 * it isn't JSON, else `null` so callers can supply their own generic summary.
 *
 * Use it in a mutation's `onError` so the API's real reason (e.g. "This payment method can't be
 * deleted while … 3 user registration(s) would be destroyed …") reaches the user.
 */
export const apiErrorMessage = (error: unknown): string | null =>
  pickMessage(errorResponseBody(error))

/** The parsed response body of an API error (NestJS shape: `{ statusCode, message, error }`). */
const errorResponseBody = (error: unknown): Record<string, unknown> | null => {
  if (!error || typeof error !== 'object') return null
  // nestia/typia HttpError: `.message` is the raw response body as a string.
  const raw = (error as { message?: unknown }).message
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    } catch {
      // Not JSON (a plain Error) — the raw string IS the message.
      return raw.trim() ? { message: raw } : null
    }
  }
  // Some clients expose the parsed body directly on `.value`.
  const value = (error as { value?: unknown }).value
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

/** The `message` field of an API error body: a string, or a joined list for validation errors. */
const pickMessage = (body: Record<string, unknown> | null): string | null => {
  const message = body?.message
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message)) {
    const joined = message.filter((m): m is string => typeof m === 'string').join(' • ')
    if (joined.trim()) return joined
  }
  return null
}
