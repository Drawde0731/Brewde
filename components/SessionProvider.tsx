'use client'
import { createContext, useCallback, useContext, useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { User, Tenant } from '@/types'
import { useTenantStore } from '@/store/tenant'
import { AppLoader } from './AppLoader'

interface SessionContextValue {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue>({
  user: null, tenant: null, loading: true, refresh: async () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [navLoading, setNavLoading] = useState(false)
  const { setTenant: storeTenant, setUser: storeUser } = useTenantStore()
  const pathname = usePathname()

  // Hide nav loader when pathname changes (page rendered)
  useEffect(() => {
    setNavLoading(false)
  }, [pathname])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
      setTenant(data.tenant)
      storeTenant(data.tenant)
      storeUser(data.user)
    } catch {
      setUser(null)
      setTenant(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setAuthLoading(false))
  }, [])

  const showLoader = authLoading || navLoading

  return (
    <SessionContext.Provider value={{ user, tenant, loading: authLoading, refresh }}>
      {showLoader && <AppLoader logo={tenant?.logo_url} />}
      {/* Always render children so they mount; loader overlays on top */}
      <div style={{ visibility: authLoading ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </SessionContext.Provider>
  )
}
