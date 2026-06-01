import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword, generateTempPassword } from '@/lib/auth'
import { sendApprovedEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new NextResponse('Missing request ID', { status: 400 })

  const db = createServiceClient()

  const { data: request, error } = await db
    .from('signup_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !request) return new NextResponse('Request not found', { status: 404 })
  if (request.status !== 'pending') {
    return new NextResponse(`<html><body style="font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto"><h2>Already Processed</h2><p>This request has already been ${request.status}.</p></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  try {
    const tempPassword = generateTempPassword()
    const passwordHash = await hashPassword(tempPassword)

    // Create tenant
    const { data: tenant } = await db
      .from('tenants')
      .insert({ name: request.cafe_name })
      .select()
      .single()

    // Create owner user
    const { data: user } = await db
      .from('users')
      .insert({
        email: request.email,
        password_hash: passwordHash,
        role: 'owner',
        status: 'active',
        tenant_id: tenant.id,
        force_password_change: true,
      })
      .select()
      .single()

    // Link owner to tenant
    await db.from('tenants').update({ owner_user_id: user.id }).eq('id', tenant.id)

    // Mark request approved
    await db.from('signup_requests').update({ status: 'approved' }).eq('id', id)

    await sendApprovedEmail({
      email: request.email,
      cafeName: request.cafe_name,
      tempPassword,
    })

    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;text-align:center">
        <h2 style="color:#22c55e">✓ Approved</h2>
        <p><strong>${request.cafe_name}</strong> has been approved.</p>
        <p>Login credentials have been sent to <strong>${request.email}</strong>.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (err) {
    console.error(err)
    return new NextResponse('Approval failed', { status: 500 })
  }
}
