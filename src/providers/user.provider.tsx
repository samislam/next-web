'use client'

import { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { DashboardUser } from '@/types/dashboard.types'

export type UserData = DashboardUser

export type UserContextValue = {
  user: {
    data: UserData
  }
}

type UserProviderProps = {
  children: ReactNode
  value: UserContextValue
}

const UserContext = createContext<UserContextValue | null>(null)

export const UserProvider = (props: UserProviderProps) => {
  const { children, value } = props

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }

  return context
}
