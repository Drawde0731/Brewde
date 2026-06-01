import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'johnedward3101@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendApprovalRequestEmail(params: {
  requestId: string
  cafeName: string
  email: string
  message: string | null
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const approveUrl = `${APP_URL}/api/admin/approve?id=${params.requestId}`
  const rejectUrl = `${APP_URL}/api/admin/reject?id=${params.requestId}`

  await resend.emails.send({
    from: 'Brewde <noreply@brewde.onboarding.com>',
    to: ADMIN_EMAIL,
    subject: 'New Cafe Signup Request',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#6F4E37">New Cafe Signup Request</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#666;width:140px">Cafe Name</td><td style="padding:8px 0;font-weight:600">${params.cafeName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${params.email}</td></tr>
          ${params.message ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0">${params.message}</td></tr>` : ''}
        </table>
        <div>
          <a href="${approveUrl}" style="background:#22c55e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-right:12px">&#10003; Approve</a>
          <a href="${rejectUrl}" style="background:#ef4444;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">&#10007; Reject</a>
        </div>
      </div>
    `,
  })
}

export async function sendApprovedEmail(params: {
  email: string
  cafeName: string
  tempPassword: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Brewde <noreply@brewde.onboarding.com>',
    to: params.email,
    subject: 'Welcome to Brewde — Your account is ready',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#6F4E37">Welcome to Brewde</h2>
        <p>Your cafe <strong>${params.cafeName}</strong> has been approved.</p>
        <div style="background:#f9f5f1;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px 0;color:#666">Login Email</p>
          <p style="margin:0;font-weight:600;font-size:18px">${params.email}</p>
          <p style="margin:16px 0 8px 0;color:#666">Temporary Password</p>
          <p style="margin:0;font-weight:600;font-size:18px;font-family:monospace;background:#fff;padding:8px 12px;border-radius:4px;display:inline-block">${params.tempPassword}</p>
        </div>
        <p style="color:#ef4444;font-weight:600">You will be required to change your password on first login.</p>
        <a href="${APP_URL}/login" style="background:#6F4E37;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Login to Brewde</a>
      </div>
    `,
  })
}

export async function sendRejectedEmail(params: { email: string; cafeName: string }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Brewde <noreply@cafepos.app>',
    to: params.email,
    subject: 'Brewde Signup Request Update',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#6F4E37">Brewde Signup Request</h2>
        <p>Thank you for your interest in Brewde.</p>
        <p>Unfortunately, your request for <strong>${params.cafeName}</strong> was not approved at this time.</p>
        <p>If you believe this is an error, please contact us.</p>
      </div>
    `,
  })
}
