import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, generateTempPassword } from '@/lib/auth'
import { sendApprovedEmail } from '@/lib/email'
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
  const db = createServiceClient()

  const { data: request } = await db
    .from('signup_requests').select('*').eq('id', id).single()

  if (!request || request.status !== 'approved') {
    return NextResponse.json({ error: 'Request not found or not approved' }, { status: 404 })
  }

  // Find the user by email
  const { data: user } = await db
    .from('users').select('id').eq('email', request.email).single()

  if (!user) {
    return NextResponse.json({ error: 'User account not found' }, { status: 404 })
  }

  // Generate a fresh temp password
  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  await db.from('users').update({
    password_hash: passwordHash,
    force_password_change: true,
  }).eq('id', user.id)

  // Try to send email (may fail if Resend not configured)
  let emailSent = false
  try {
    await sendApprovedEmail({
      email: request.email,
      cafeName: request.cafe_name,
      tempPassword,
    })
    emailSent = true
  } catch (e) {
    console.error('[reset] email send failed:', e)
  }

  // Always return the temp password so admin can share it manually
  return NextResponse.json({ tempPassword, emailSent })
}
