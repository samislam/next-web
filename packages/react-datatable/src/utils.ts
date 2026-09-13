/** Tiny classNames joiner — the package stays dependency-free of the host app's `cn`. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
