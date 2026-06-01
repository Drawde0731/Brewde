'use client'
import { useCart } from '@/store/cart'
import { DISCOUNT_LABELS, PAYMENT_LABELS, formatPeso } from '@/lib/utils'
import { DiscountType, PaymentMethod } from '@/types'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export function Cart() {
  const { items, discount, payment, addItem, removeItem, updateQty, setDiscount, setPayment, clear, subtotal, discountAmount, total } = useCart()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const completeOrder = async () => {
    if (!items.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, discount, payment }),
      })
      if (!res.ok) throw new Error()
      clear()
      toast('Order completed!', 'success')
    } catch {
      toast('Failed to complete order', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-100">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-neutral-100">
        <ShoppingCart size={18} style={{ color: 'var(--brand-primary)' }} />
        <h2 className="font-semibold text-neutral-900">Order</h2>
        {items.length > 0 && (
          <span className="ml-auto text-xs text-neutral-400 cursor-pointer hover:text-red-500 transition-colors" onClick={clear}>
            Clear all
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-neutral-300">
            <ShoppingCart size={36} className="mb-2" />
            <p className="text-sm">Tap a product to add</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.product_id} className="flex items-center gap-3 py-2">
              {/* Icon/image */}
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.image_url
                  ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-lg">{item.category === 'coffee' ? '☕' : item.category === 'food' ? '🍰' : '🧋'}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                <p className="text-xs text-neutral-500">{formatPeso(item.price)}</p>
              </div>
              {/* Qty controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQty(item.product_id, item.qty - 1)}
                  className="h-7 w-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 active:scale-95 transition-all"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.product_id, item.qty + 1)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-white active:scale-95 transition-all"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={() => removeItem(item.product_id)} className="text-neutral-300 hover:text-red-400 transition-colors ml-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="border-t border-neutral-100 px-4 pt-3 pb-4 space-y-3">
          {/* Discount */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1.5">Discount</p>
            <div className="flex gap-1.5">
              {(Object.keys(DISCOUNT_LABELS) as DiscountType[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDiscount(d)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium transition-all border',
                    discount === d
                      ? 'text-white border-transparent'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  )}
                  style={discount === d ? { background: 'var(--brand-primary)' } : {}}
                >
                  {d === 'none' ? 'None' : d === 'pwd' ? 'PWD' : 'Senior'}
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1.5">Payment</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-medium transition-all border',
                    payment === p
                      ? 'text-white border-transparent'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  )}
                  style={payment === p ? { background: 'var(--brand-secondary)' } : {}}
                >
                  {PAYMENT_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1 py-2 border-t border-neutral-100">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span>{formatPeso(subtotal())}</span>
            </div>
            {discount !== 'none' && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{DISCOUNT_LABELS[discount]}</span>
                <span>−{formatPeso(discountAmount())}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-1">
              <span>Total</span>
              <span style={{ color: 'var(--brand-primary)' }}>{formatPeso(total())}</span>
            </div>
          </div>

          <Button
            onClick={completeOrder}
            loading={loading}
            size="lg"
            className="w-full"
            disabled={!items.length}
          >
            Complete Order
          </Button>
        </div>
      )}
    </div>
  )
}
