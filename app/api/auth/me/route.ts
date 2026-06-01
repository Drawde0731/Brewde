import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (!sessionCookie) return NextResponse.json({ user: null, tenant: null })

    const session = JSON.parse(sessionCookie.value)
    const db = createServiceClient()

    const { data: user } = await db
      .from('users')
      .select('id, email, role, status, tenant_id, force_password_change')
      .eq('id', session.id)
      .single()

    if (!user || user.status !== 'active') {
      return NextResponse.json({ user: null, tenant: null })
    }

    let tenant = null
    if (user.tenant_id) {
      const { data } = await db.from('tenants').select('*').eq('id', user.tenant_id).single()
      tenant = data
    }

    return NextResponse.json({ user, tenant })
  } catch {
    return NextResponse.json({ user: null, tenant: null })
  }
}
