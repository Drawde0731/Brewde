import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session?.tenant_id || session.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { logo_url, primary_color, secondary_color, accent_color, auto_detect_colors } = await req.json()

  const db = createServiceClient()
  const { data, error } = await db
    .from('tenants')
    .update({ logo_url, primary_color, secondary_color, accent_color, auto_detect_colors })
    .eq('id', session.tenant_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
