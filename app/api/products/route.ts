import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  // No session at all → 401. No tenant (admin) → return empty array, not error
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.tenant_id) return NextResponse.json([])

  const db = createServiceClient()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('tenant_id', session.tenant_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.tenant_id || !['owner', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, price, image_url, category } = body

  if (!name || !price || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('products')
    .insert({ tenant_id: session.tenant_id, name, price: parseFloat(price), image_url: image_url || null, category })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
