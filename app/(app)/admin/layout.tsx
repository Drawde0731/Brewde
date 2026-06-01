import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  if (!c) redirect('/login')
  const session = JSON.parse(c.value)
  if (session.role !== 'admin') redirect('/pos')
  return <>{children}</>
}
