'use client'

import { useUserContext } from '@/providers/user.provider'

export const useUser = () => {
  return useUserContext()
}
