import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api'
import type { User } from '@/types'
import type { LoginRequest } from '@/api/auth'

interface AuthState {
  currentUser: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (creds: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

type AuthContextValue = AuthState & AuthActions

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (creds: LoginRequest) => {
    const res = await apiLogin(creds)
    setCurrentUser(res.data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // best-effort
    }
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: currentUser !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
