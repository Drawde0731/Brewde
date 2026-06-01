import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const db = createServiceClient()

    // Simple select — no join, avoids potential schema issues
    const { data: user, error: dbError } = await db
      .from('users')
      .select('id, email, password_hash, role, status, tenant_id, force_password_change')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (dbError || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Your account is not active yet' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      force_password_change: user.force_password_change,
    }

    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Redirect destination based on role
    const redirect = user.force_password_change
      ? '/change-password'
      : user.role === 'admin'
        ? '/admin/requests'
        : '/pos'

    return NextResponse.json({ user: sessionData, redirect })
  } catch (err: any) {
    console.error('[login]', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Login failed' }, { status: 500 })
  }
}
