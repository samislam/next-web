import { Metadata } from 'next'
import { LibraryIcon } from '@/components/ui/samislam/lib-icon'

export interface PageDef {
  href: string
  label?: string
  title?: string
  description?: string
  dialogs?: Record<string, string>
  meta?: () => Metadata | Promise<Metadata> | Metadata
  /**
   * You can find more icons at:
   *
   * - https://pictogrammers.com/library/mdi/
   * - https://lucide.dev/icons/presentation
   */
  icon?: LibraryIcon
  // Allow any other fields (arbitrary props)
  [key: string]: unknown
}

export type PagesDefs = { [k: string]: PageDef }
