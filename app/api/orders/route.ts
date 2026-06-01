import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { CartItem, DiscountType, PaymentMethod } from '@/types'
import { DISCOUNT_RATES } from '@/lib/utils'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.tenant_id) return NextResponse.json([])

  const { searchParams } = req.nextUrl
  const payment = searchParams.get('payment')
  const limit = parseInt(searchParams.get('limit') || '50')

  const db = createServiceClient()
  let query = db
    .from('orders')
    .select('*, order_items(*)')
    .eq('tenant_id', session.tenant_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (payment && payment !== 'all') {
    query = query.eq('payment_method', payment)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, discount, payment }: {
    items: CartItem[]
    discount: DiscountType
    payment: PaymentMethod
  } = await req.json()

  if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 })

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const rate = DISCOUNT_RATES[discount] || 0
  const discountAmount = subtotal * rate
  const total = subtotal - discountAmount

  const db = createServiceClient()
  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      tenant_id: session.tenant_id,
      subtotal,
      discount_type: discount,
      discount_rate: rate,
      discount_amount: discountAmount,
      total,
      payment_method: payment,
    })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orderItems = items.map(i => ({
    order_id: order.id,
    product_name: i.name,
    price: i.price,
    qty: i.qty,
  }))

  const { error: itemsError } = await db.from('order_items').insert(orderItems)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json(order, { status: 201 })
}
