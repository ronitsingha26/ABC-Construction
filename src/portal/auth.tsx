import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type PortalRole =
  | 'Owner'
  | 'Project Manager'
  | 'Site Engineer'
  | 'Accounts'
  | 'HR'

export type PortalUser = {
  name: string
  role: PortalRole
  email: string
}

type AuthState = {
  user: PortalUser | null
  login: (args: { email: string; password: string }) => void
  logout: () => void
  setRole: (role: PortalRole) => void
  updateUser: (patch: Partial<Pick<PortalUser, 'name' | 'email'>>) => void
}

const AuthCtx = createContext<AuthState | null>(null)

const LS_KEY = 'abc_portal_auth_v1'

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as PortalUser
      if (parsed?.email) setUser(parsed)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<AuthState>(() => {
    return {
      user,
      login: ({ email }) => {
        const next: PortalUser = {
          name: 'Rajesh Sharma',
          role: 'Owner',
          email,
        }
        setUser(next)
        localStorage.setItem(LS_KEY, JSON.stringify(next))
      },
      logout: () => {
        setUser(null)
        localStorage.removeItem(LS_KEY)
      },
      setRole: (role) => {
        setUser((u) => {
          if (!u) return u
          const next = { ...u, role }
          localStorage.setItem(LS_KEY, JSON.stringify(next))
          return next
        })
      },
      updateUser: (patch) => {
        setUser((u) => {
          if (!u) return u
          const next = { ...u, ...patch }
          localStorage.setItem(LS_KEY, JSON.stringify(next))
          return next
        })
      },
    }
  }, [user])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function usePortalAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider')
  return ctx
}

