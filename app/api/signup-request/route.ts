import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendApprovalRequestEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, cafe_name, message } = await req.json()
    if (!email || !cafe_name) {
      return NextResponse.json({ error: 'Email and cafe name required' }, { status: 400 })
    }

    const db = createServiceClient()

    // Check duplicate pending/approved
    const { data: existing } = await db
      .from('signup_requests')
      .select('id, status')
      .eq('email', email)
      .in('status', ['pending', 'approved'])
      .single()

    if (existing) {
      return NextResponse.json({ error: 'A request with this email already exists' }, { status: 409 })
    }

    const { data, error } = await db
      .from('signup_requests')
      .insert({ email, cafe_name, message: message || null, status: 'pending' })
      .select()
      .single()

    if (error) throw error

    await sendApprovalRequestEmail({
      requestId: data.id,
      cafeName: cafe_name,
      email,
      message: message || null,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
