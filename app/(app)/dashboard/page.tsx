'use client'
import { useEffect, useState, useCallback } from 'react'
import { formatPeso, PAYMENT_LABELS } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { TrendingUp, ShoppingBag, ReceiptText, Tag, Wallet } from 'lucide-react'
import { PaymentMethod } from '@/types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { cn } from '@/lib/utils'

interface DashboardData {
  allTimeSales: number
  totalSales: number
  totalOrders: number
  avgOrder: number
  totalDiscounts: number
  pwdCount: number
  seniorCount: number
  paymentBreakdown: Record<string, number>
  topProducts: { name: string; qty: number; revenue: number }[]
}

interface TrendPoint { date: string; label: string; sales: number }

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

// Custom tooltip for the chart
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-neutral-900">{formatPeso(payload[0].value)}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [range, setRange] = useState(7)
  const [loading, setLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(true)
  const [brandColor, setBrandColor] = useState('#6F4E37')

  // Read brand color from CSS var
  useEffect(() => {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
    if (c) setBrandColor(c)
  }, [])

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const loadTrend = useCallback((days: number) => {
    setTrendLoading(true)
    fetch(`/api/dashboard/trends?days=${days}`)
      .then(r => r.json())
      .then(d => setTrend(Array.isArray(d) ? d : []))
      .catch(() => setTrend([]))
      .finally(() => setTrendLoading(false))
  }, [])

  useEffect(() => { loadTrend(range) }, [range, loadTrend])

  const maxSales = trend.length ? Math.max(...trend.map(t => t.sales)) : 0

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
    {
      label: 'All-Time Sales',
      value: formatPeso(data.allTimeSales),
      icon: Wallet,
      bg: 'bg-[var(--brand-primary)]/10',
      color: 'text-[var(--brand-primary)]',
    },
    {
      label: 'Today Sales',
      value: formatPeso(data.totalSales),
      icon: TrendingUp,
      bg: 'bg-green-50',
      color: 'text-green-600',
    },
    {
      label: 'Orders Today',
      value: data.totalOrders.toString(),
      icon: ShoppingBag,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Avg. Order',
      value: formatPeso(data.avgOrder),
      icon: ReceiptText,
      bg: 'bg-purple-50',
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 page-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">Sales overview & today's performance</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 md:p-5">
            <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-xs text-neutral-500 mb-1 leading-tight">{s.label}</p>
            <p className="text-lg md:text-xl font-bold text-neutral-900 leading-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Sales Trend Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Sales Trend</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Daily revenue</p>
          </div>
          {/* Range toggle */}
          <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  range === r.days
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {trendLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : trend.every(t => t.sales === 0) ? (
          <div className="h-48 flex flex-col items-center justify-center text-neutral-300">
            <TrendingUp size={36} className="mb-2" />
            <p className="text-sm">No sales in this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={brandColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval={range === 7 ? 0 : range === 30 ? 4 : 9}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={60}
                tickFormatter={v => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: brandColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={brandColor}
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                dot={range === 7 ? { fill: brandColor, r: 4, strokeWidth: 2, stroke: '#fff' } : false}
                activeDot={{ r: 5, fill: brandColor, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Bottom row: payment breakdown + top products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(data.paymentBreakdown).length === 0 ? (
              <p className="text-sm text-neutral-400">No transactions today</p>
            ) : (
              Object.entries(data.paymentBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([method, amount]) => {
                  const pct = data.totalSales > 0 ? (amount / data.totalSales) * 100 : 0
                  return (
                    <div key={method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600 font-medium">
                          {PAYMENT_LABELS[method as PaymentMethod] || method}
                        </span>
                        <span className="text-neutral-900 font-semibold">{formatPeso(amount)}</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: 'var(--brand-primary)' }}
                        />
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </Card>

        {/* Top products */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Top Products Today</h3>
          <div className="space-y-2.5">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-neutral-400">No sales today</p>
            ) : (
              data.topProducts.map((p, i) => {
                const maxQty = data.topProducts[0]?.qty || 1
                const pct = (p.qty / maxQty) * 100
                return (
                  <div key={p.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-neutral-300 w-4">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium text-neutral-800 truncate">{p.name}</span>
                      <span className="text-xs text-neutral-500">{p.qty}×</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>
                        {formatPeso(p.revenue)}
                      </span>
                    </div>
                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden ml-6">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'var(--brand-accent, #D9A441)' }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Discount summary */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Discounts Today</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{data.pwdCount}</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">PWD</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{data.seniorCount}</p>
              <p className="text-xs text-purple-600 mt-1 font-medium">Senior Citizen</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center">
            <span className="text-sm text-neutral-500">Total Discounts Given</span>
            <span className="text-sm font-bold text-neutral-900">{formatPeso(data.totalDiscounts)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
