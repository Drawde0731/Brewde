'use client'
import { useEffect, useState } from 'react'
import { Order, PaymentMethod } from '@/types'
import { formatPeso, PAYMENT_LABELS, DISCOUNT_LABELS } from '@/lib/utils'
import { OrderListSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'

const PAYMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Payments' },
  ...Object.entries(PAYMENT_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async (payment: string) => {
    setLoading(true)
    const url = payment === 'all' ? '/api/orders?limit=100' : `/api/orders?payment=${payment}&limit=100`
    fetch(url)
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  return (
    <div className="p-6 max-w-3xl page-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Order History</h1>
          <p className="text-sm text-neutral-500">Recent transactions</p>
        </div>
        <div className="w-44">
          <Select value={filter} onChange={e => setFilter(e.target.value)}>
            {PAYMENT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <OrderListSkeleton />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
          <span className="text-5xl mb-3">📋</span>
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const num = orders.length - i
            const items = order.order_items || []
            const names = items.map(i => `${i.product_name} ×${i.qty}`).join(', ')
            return (
              <div key={order.id} className="bg-white rounded-xl border border-neutral-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-neutral-400">#{String(num).padStart(3, '0')}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        order.payment_method === 'cash' ? 'bg-green-50 text-green-700' :
                        order.payment_method === 'gcash' ? 'bg-blue-50 text-blue-700' :
                        order.payment_method === 'maya' ? 'bg-purple-50 text-purple-700' :
                        'bg-neutral-100 text-neutral-600'
                      )}>
                        {PAYMENT_LABELS[order.payment_method as PaymentMethod]}
                      </span>
                      {order.discount_type !== 'none' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
                          {order.discount_type === 'pwd' ? 'PWD' : 'Senior'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 truncate">{names || '—'}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(order.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold" style={{ color: 'var(--brand-primary)' }}>{formatPeso(order.total)}</p>
                    {order.discount_amount > 0 && (
                      <p className="text-xs text-green-600">−{formatPeso(order.discount_amount)}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
