import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = JSON.parse(sessionCookie.value)
    const { currentPassword, newPassword } = await req.json()

    const db = createServiceClient()
    const { data: user } = await db.from('users').select('*').eq('id', session.id).single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })

    const hash = await hashPassword(newPassword)
    await db.from('users').update({ password_hash: hash, force_password_change: false }).eq('id', user.id)

    // Update session cookie
    const updated = { ...session, force_password_change: false }
    cookieStore.set('session', JSON.stringify(updated), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
