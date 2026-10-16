import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '@/types/api'
import { authApi } from '@/api/auth-api'
import { ApiError, resetCsrfToken } from '@/api/client'

type SessionContextValue = {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserProfile>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const session = useQuery({
    queryKey: ['session'],
    queryFn: async ({ signal }) => {
      try {
        return await authApi.me(signal)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    const clear = () => {
      queryClient.setQueryData(['session'], null)
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'session',
      })
      resetCsrfToken()
    }
    window.addEventListener('maarif:session-expired', clear)
    return () => window.removeEventListener('maarif:session-expired', clear)
  }, [queryClient])

  return (
    <SessionContext.Provider
      value={{
        user: session.data ?? null,
        loading: session.isPending,
        login: async (email, password) => {
          const user = await authApi.login({ email, password })
          resetCsrfToken()
          queryClient.setQueryData(['session'], user)
          return user
        },
        logout: async () => {
          await authApi.logout()
          queryClient.clear()
          queryClient.setQueryData(['session'], null)
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('SessionProvider manquant.')
  return context
}
