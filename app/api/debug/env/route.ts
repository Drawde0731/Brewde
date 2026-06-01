import { NextResponse } from 'next/server'

// TEMPORARY diagnostic endpoint — DELETE after confirming login works
export async function GET() {
  return NextResponse.json({
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ MISSING',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ set' : '❌ MISSING',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ MISSING',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ set' : '❌ MISSING',
    NODE_ENV: process.env.NODE_ENV,
  })
}
