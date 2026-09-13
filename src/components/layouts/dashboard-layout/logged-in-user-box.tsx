'use client'

import Image from 'next/image'
import { pageDefs } from '@/config/pages.config'
import { useUser } from '@/hooks/use-user'
import { Link } from '@/lib/next-intl/navigation'

type LoggedInUserBoxProps = {
  compact?: boolean
  /** Where the box navigates. Defaults to home; point it at the account page once one exists. */
  href?: string
}

export const LoggedInUserBox = (props: LoggedInUserBoxProps) => {
  const { compact = false, href = pageDefs.home.href } = props
  const $USER = useUser()
  const user = $USER.user.data
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <Link
      href={href}
      className={
        compact
          ? 'bg-muted/40 border-border hover:bg-accent/60 flex justify-center rounded-2xl border p-2.5 shadow-xs transition-colors'
          : 'bg-muted/40 border-border hover:bg-accent/60 block rounded-2xl border px-3 py-2.5 shadow-xs transition-colors'
      }
    >
      <div className={compact ? 'flex items-center justify-center' : 'flex items-center gap-2.5'}>
        <div className="bg-primary text-primary-foreground relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm">
          {user.avatarUrl ? (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <Image
                fill
                src={user.avatarUrl}
                alt={user.name}
                className="object-cover"
                sizes="44px"
              />
            </div>
          ) : (
            initials
          )}
          {user.isOnline === undefined ? null : (
            <span
              className={
                user.isOnline
                  ? 'border-background absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 bg-green-500'
                  : 'border-background absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 bg-gray-400'
              }
            />
          )}
        </div>

        {compact ? null : (
          <div className="min-w-0 space-y-0.5">
            <p className="text-foreground truncate text-sm leading-5 font-bold">{user.name}</p>
            <div className="flex flex-wrap items-center gap-2">
              {user.subtitle ? (
                <span className="text-muted-foreground truncate text-xs">{user.subtitle}</span>
              ) : null}
              {user.roleLabel ? (
                <span className="bg-accent text-accent-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
                  {user.roleLabel}
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
