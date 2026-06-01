import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.tenant_id || !['owner', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, price, image_url, category } = body

  const db = createServiceClient()
  // Verify ownership
  const { data: existing } = await db.from('products').select('tenant_id').eq('id', id).single()
  if (!existing || existing.tenant_id !== session.tenant_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await db
    .from('products')
    .update({ name, price: parseFloat(price), image_url: image_url || null, category })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.tenant_id || !['owner', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = createServiceClient()

  const { data: existing } = await db.from('products').select('tenant_id').eq('id', id).single()
  if (!existing || existing.tenant_id !== session.tenant_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await db.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
