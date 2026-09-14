/**
 * The base URL of an EXTERNAL backend, for projects that have one.
 *
 * next-web is a standalone full-stack app by default: its own Elysia routes under
 * `src/app/api/[[...slugs]]/` are a complete backend, and most projects need nothing else. Talking to
 * a separate API is one option among several — you might use only Elysia, only an external API, or
 * both at once — so `NEXT_PUBLIC_MAIN_API_BASE_URL` is NOT part of the validated env schema and has
 * no default. It ships commented out in `src/server/client-env.ts`.
 *
 * Because of that, the requirement is enforced HERE, at the point of use: only the code paths that
 * actually call an external backend need the variable, and they fail with a message that says so
 * rather than stopping the whole app from booting.
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time by Next, so this works on both sides.
 */
export const mainApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_MAIN_API_BASE_URL?.trim().replace(/\/+$/, '')

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_MAIN_API_BASE_URL is not set, but something tried to call an external backend.\n' +
        '  • If this project talks to a separate API, set it in .env.development (and uncomment it ' +
        'in src/server/client-env.ts if you want it validated at boot).\n' +
        '  • If this project is standalone, remove the call instead — the Elysia routes under ' +
        'src/app/api/ are the backend.'
    )
  }

  return url
}
