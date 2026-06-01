import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function GET() {
  const session = await getSession()
  if (!session?.tenant_id || session.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data } = await db
    .from('users')
    .select('id, email, role, status, created_at')
    .eq('tenant_id', session.tenant_id)
    .order('created_at')

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.tenant_id || session.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, password, role } = await req.json()
  if (!email || !password || role !== 'cashier') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const db = createServiceClient()
  const hash = await hashPassword(password)
  const { data, error } = await db
    .from('users')
    .insert({ email, password_hash: hash, role: 'cashier', status: 'active', tenant_id: session.tenant_id })
    .select('id, email, role, status, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
