/**
 * The signed-in user as the dashboard shell needs it.
 *
 * Deliberately small and UI-shaped rather than a mirror of the API's user entity: the shell only ever
 * renders an identity, so a project can map whatever its backend returns onto this without dragging
 * the shell into its domain model. Extend it per project; nothing here assumes a particular backend.
 */
export type DashboardUser = {
  id: string
  /** Primary display name. */
  name: string
  /** Secondary line under the name — a username, email, or handle. */
  subtitle?: string
  /** Already-translated role/label shown as a chip. Omit to hide the chip. */
  roleLabel?: string
  /** Absolute or public URL. When absent, initials from `name` are shown instead. */
  avatarUrl?: string
  /** Drives the presence dot. Leave undefined if the app has no presence concept. */
  isOnline?: boolean
}
