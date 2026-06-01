import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Brewde <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'johnedward3101@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendApprovalRequestEmail(params: {
  requestId: string
  cafeName: string
  email: string
  message: string | null
}) {
  const approveUrl = `${APP_URL}/api/admin/approve?id=${params.requestId}`
  const rejectUrl  = `${APP_URL}/api/admin/reject?id=${params.requestId}`

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: params.email,
    subject: `[Brewde] New Cafe Signup — ${params.cafeName}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border-radius:12px">
        <h2 style="color:#6F4E37;margin-bottom:24px">New Cafe Signup Request</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#888;width:140px">Cafe Name</td><td style="padding:8px 0;font-weight:600;color:#111">${params.cafeName}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0;color:#111">${params.email}</td></tr>
          ${params.message ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top">Message</td><td style="padding:8px 0;color:#111">${params.message}</td></tr>` : ''}
        </table>
        <div style="display:flex;gap:12px">
          <a href="${approveUrl}" style="background:#22c55e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-right:12px">✓ Approve</a>
          <a href="${rejectUrl}"  style="background:#ef4444;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">✗ Reject</a>
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
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: '[Brewde] Your account is ready — Login credentials',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border-radius:12px">
        <h2 style="color:#6F4E37;margin-bottom:8px">Welcome to Brewde</h2>
        <p style="color:#555;margin-bottom:24px">Your cafe <strong>${params.cafeName}</strong> has been approved. Here are your login credentials:</p>
        <div style="background:#f9f5f1;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 4px;color:#888;font-size:13px">Email</p>
          <p style="margin:0 0 16px;font-weight:600;font-size:16px;color:#111">${params.email}</p>
          <p style="margin:0 0 4px;color:#888;font-size:13px">Temporary Password</p>
          <p style="margin:0;font-weight:700;font-size:18px;font-family:monospace;background:#fff;padding:10px 14px;border-radius:6px;display:inline-block;border:1px solid #e5e7eb;color:#111;letter-spacing:2px">${params.tempPassword}</p>
        </div>
        <p style="color:#ef4444;font-size:13px;font-weight:600;margin-bottom:24px">⚠ You will be asked to change this password on first login.</p>
        <a href="${APP_URL}/login" style="background:#6F4E37;color:#fff;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Login to Brewde →</a>
      </div>
    `,
  })
}

export async function sendRejectedEmail(params: { email: string; cafeName: string }) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: '[Brewde] Signup Request Update',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border-radius:12px">
        <h2 style="color:#6F4E37;margin-bottom:8px">Brewde Signup Request</h2>
        <p style="color:#555">Thank you for your interest in Brewde.</p>
        <p style="color:#555">Unfortunately, your request for <strong>${params.cafeName}</strong> was not approved at this time.</p>
        <p style="color:#888;font-size:13px">If you believe this is an error, please reply to this email.</p>
      </div>
    `,
  })
}
