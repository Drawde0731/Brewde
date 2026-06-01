import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = JSON.parse(c.value)
  if (!session?.tenant_id) return NextResponse.json([])

  const days = parseInt(req.nextUrl.searchParams.get('days') || '7')
  const validDays = [7, 30, 90].includes(days) ? days : 7

  const db = createServiceClient()
  const since = new Date()
  since.setDate(since.getDate() - (validDays - 1))
  since.setHours(0, 0, 0, 0)

  const { data: orders } = await db
    .from('orders')
    .select('total, created_at')
    .eq('tenant_id', session.tenant_id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  // Build a map of all days in range → 0
  const dayMap: Record<string, number> = {}
  for (let i = 0; i < validDays; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    dayMap[key] = 0
  }

  // Aggregate server-side
  for (const order of orders || []) {
    const key = new Date(order.created_at).toISOString().slice(0, 10)
    if (key in dayMap) {
      dayMap[key] += Number(order.total)
    }
  }

  const result = Object.entries(dayMap).map(([date, sales]) => ({
    date,
    // Short label: "Jun 1"
    label: new Date(date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    sales: Math.round(sales * 100) / 100,
  }))

  return NextResponse.json(result)
}
