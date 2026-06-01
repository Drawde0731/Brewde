import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendRejectedEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new NextResponse('Missing request ID', { status: 400 })

  const db = createServiceClient()

  const { data: request } = await db
    .from('signup_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!request) return new NextResponse('Request not found', { status: 404 })
  if (request.status !== 'pending') {
    return new NextResponse(`<html><body style="font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto"><h2>Already Processed</h2><p>This request has already been ${request.status}.</p></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  await db.from('signup_requests').update({ status: 'rejected' }).eq('id', id)
  await sendRejectedEmail({ email: request.email, cafeName: request.cafe_name })

  return new NextResponse(
    `<html><body style="font-family:sans-serif;padding:40px;max-width:500px;margin:0 auto;text-align:center">
      <h2 style="color:#ef4444">✗ Rejected</h2>
      <p>The request from <strong>${request.email}</strong> has been rejected.</p>
      <p>A notification has been sent to the applicant.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
