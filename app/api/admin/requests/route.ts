import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data } = await db
    .from('signup_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}
