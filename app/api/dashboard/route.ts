import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const EMPTY = {
  allTimeSales: 0, totalSales: 0, totalOrders: 0, avgOrder: 0,
  totalDiscounts: 0, pwdCount: 0, seniorCount: 0,
  paymentBreakdown: {}, topProducts: [], recentOrders: [],
}

export async function GET() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  if (!c) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = JSON.parse(c.value)
  if (!session?.tenant_id) return NextResponse.json(EMPTY)

  const db = createServiceClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Parallel fetch: today's detailed orders + all-time total
  const [todayResult, allTimeResult] = await Promise.all([
    db.from('orders')
      .select('*, order_items(*)')
      .eq('tenant_id', session.tenant_id)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false }),

    db.from('orders')
      .select('total')
      .eq('tenant_id', session.tenant_id),
  ])

  const safeOrders = (todayResult.data || []) as any[]
  const allOrders  = (allTimeResult.data || []) as any[]

  const allTimeSales = allOrders.reduce((s: number, o: any) => s + Number(o.total), 0)
  const totalSales   = safeOrders.reduce((s: number, o: any) => s + Number(o.total), 0)
  const totalOrders  = safeOrders.length
  const avgOrder     = totalOrders > 0 ? totalSales / totalOrders : 0
  const totalDiscounts = safeOrders.reduce((s: number, o: any) => s + Number(o.discount_amount), 0)
  const pwdCount    = safeOrders.filter((o: any) => o.discount_type === 'pwd').length
  const seniorCount = safeOrders.filter((o: any) => o.discount_type === 'senior').length

  const paymentBreakdown: Record<string, number> = {}
  for (const o of safeOrders) {
    paymentBreakdown[o.payment_method] = (paymentBreakdown[o.payment_method] || 0) + Number(o.total)
  }

  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {}
  for (const o of safeOrders) {
    for (const item of (o.order_items || [])) {
      if (!productMap[item.product_name]) {
        productMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 }
      }
      productMap[item.product_name].qty += item.qty
      productMap[item.product_name].revenue += item.price * item.qty
    }
  }

  return NextResponse.json({
    allTimeSales,
    totalSales,
    totalOrders,
    avgOrder,
    totalDiscounts,
    pwdCount,
    seniorCount,
    paymentBreakdown,
    topProducts: Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5),
    recentOrders: safeOrders.slice(0, 5),
  })
}
