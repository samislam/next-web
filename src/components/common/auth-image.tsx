'use client'

import Cookies from 'js-cookie'
import { COOKIES } from '@/constants'
import { useEffect, useState } from 'react'
import { clientEnv } from '@/server/client-env'

type AuthImageProps = {
  /** API path beginning with `/api/...` (the main API base URL is prepended). */
  path: string
  alt: string
  className?: string
}

/**
 * Renders an image from an authenticated main-API endpoint. The auth token is a JS-readable cookie
 * sent as a Bearer header, which a plain `<img>` can't do — so we fetch the bytes with the header
 * and render an object URL. Used for guarded payment-method QR codes.
 */
export const AuthImage = (props: AuthImageProps) => {
  const { path, alt, className } = props
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    setSrc(null)
    setFailed(false)

    const token = Cookies.get(COOKIES.MAIN_API__AUTH)
    fetch(`${clientEnv.NEXT_PUBLIC_MAIN_API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path])

  if (failed) {
    return <div className={`bg-muted ${className ?? ''}`} aria-label={alt} />
  }
  if (!src) {
    return <div className={`bg-muted animate-pulse ${className ?? ''}`} aria-label={alt} />
  }

  // eslint-disable-next-line @next/next/no-img-element -- object URL of an authenticated blob
  return <img src={src} alt={alt} className={className} />
}
