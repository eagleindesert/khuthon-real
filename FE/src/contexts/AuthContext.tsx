import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api'
import type { User } from '@/types'
import type { LoginRequest } from '@/api/auth'

interface AuthState {
  currentUser: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (creds: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

type AuthContextValue = AuthState & AuthActions

const TOKEN_KEY = 'access_token'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    getMe()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (creds: LoginRequest) => {
    const res = await apiLogin(creds)
    const { accessToken, user } = res.data
    localStorage.setItem(TOKEN_KEY, accessToken)
    setToken(accessToken)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // best-effort
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
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
