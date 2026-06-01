import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, generateTempPassword } from '@/lib/auth'
import { sendApprovedEmail, sendRejectedEmail } from '@/lib/email'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action } = await req.json() // 'approve' | 'reject'
  const db = createServiceClient()

  const { data: request } = await db.from('signup_requests').select('*').eq('id', id).single()
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (request.status !== 'pending') return NextResponse.json({ error: 'Already processed' }, { status: 409 })

  if (action === 'approve') {
    const tempPassword = generateTempPassword()
    const passwordHash = await hashPassword(tempPassword)

    const { data: tenant } = await db
      .from('tenants').insert({ name: request.cafe_name }).select().single()

    const { data: user } = await db
      .from('users').insert({
        email: request.email,
        password_hash: passwordHash,
        role: 'owner',
        status: 'active',
        tenant_id: tenant.id,
        force_password_change: true,
      }).select().single()

    await db.from('tenants').update({ owner_user_id: user.id }).eq('id', tenant.id)
    await db.from('signup_requests').update({ status: 'approved' }).eq('id', id)

    // Try email but don't fail if it errors — always return tempPassword to admin
    let emailSent = false
    try {
      await sendApprovedEmail({ email: request.email, cafeName: request.cafe_name, tempPassword })
      emailSent = true
    } catch (e) {
      console.error('[approve] email failed:', e)
    }

    return NextResponse.json({ success: true, action: 'approved', tempPassword, emailSent })
  }

  if (action === 'reject') {
    await db.from('signup_requests').update({ status: 'rejected' }).eq('id', id)
    try {
      await sendRejectedEmail({ email: request.email, cafeName: request.cafe_name })
    } catch (e) {
      console.error('[reject] email failed:', e)
    }
    return NextResponse.json({ success: true, action: 'rejected' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
