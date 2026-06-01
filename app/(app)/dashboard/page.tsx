'use client'
import { useEffect, useState } from 'react'
import { formatPeso, PAYMENT_LABELS } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { TrendingUp, ShoppingBag, ReceiptText, Tag } from 'lucide-react'
import { PaymentMethod } from '@/types'

interface DashboardData {
  totalSales: number
  totalOrders: number
  avgOrder: number
  totalDiscounts: number
  pwdCount: number
  seniorCount: number
  paymentBreakdown: Record<string, number>
  topProducts: { name: string; qty: number; revenue: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 page-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">Today's overview</p>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: 'Today Sales', value: formatPeso(data.totalSales), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Orders', value: data.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Order', value: formatPeso(data.avgOrder), icon: ReceiptText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Discounts Given', value: formatPeso(data.totalDiscounts), icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="p-6 space-y-6 page-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">Today's performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-neutral-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(data.paymentBreakdown).length === 0 ? (
              <p className="text-sm text-neutral-400">No transactions today</p>
            ) : (
              Object.entries(data.paymentBreakdown).map(([method, amount]) => {
                const pct = data.totalSales > 0 ? (amount / data.totalSales) * 100 : 0
                return (
                  <div key={method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-700 font-medium">
                        {PAYMENT_LABELS[method as PaymentMethod] || method}
                      </span>
                      <span className="text-neutral-900 font-semibold">{formatPeso(amount)}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--brand-primary)' }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Top products */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Top Products</h3>
          <div className="space-y-2">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-neutral-400">No sales today</p>
            ) : (
              data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">{p.qty} sold</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>{formatPeso(p.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Discount summary */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Discounts Today</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{data.pwdCount}</p>
              <p className="text-xs text-blue-600 mt-1">PWD</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{data.seniorCount}</p>
              <p className="text-xs text-purple-600 mt-1">Senior Citizen</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between">
            <span className="text-sm text-neutral-500">Total Discounts</span>
            <span className="text-sm font-bold text-neutral-900">{formatPeso(data.totalDiscounts)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
