import { SessionProvider } from '@/components/SessionProvider'
import { BrandProvider } from '@/components/BrandProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { Sidebar } from '@/components/Sidebar'
import { NavProgress } from '@/components/NavProgress'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Tenant, User } from '@/types'

async function getServerSession(): Promise<{ user: User | null; tenant: Tenant | null }> {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  if (!c) return { user: null, tenant: null }
  try {
    const session = JSON.parse(c.value)
    const db = createServiceClient()
    const { data: user } = await db.from('users').select('*').eq('id', session.id).single()
    if (!user || user.status !== 'active') return { user: null, tenant: null }
    let tenant: Tenant | null = null
    if (user.tenant_id) {
      const { data } = await db.from('tenants').select('*').eq('id', user.tenant_id).single()
      tenant = data as Tenant
    }
    return { user: user as User, tenant }
  } catch {
    return { user: null, tenant: null }
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, tenant } = await getServerSession()
  if (!user) redirect('/login')
  if ((user as User).force_password_change) redirect('/change-password')

  return (
    <ToastProvider>
      <BrandProvider tenant={tenant}>
        <NavProgress />
        <SessionProvider>
          <div className="flex h-full min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </SessionProvider>
      </BrandProvider>
    </ToastProvider>
  )
}
