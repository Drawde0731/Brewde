'use client'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { Cart } from '@/components/pos/Cart'
import { ShoppingCart, X } from 'lucide-react'
import { useCart } from '@/store/cart'
import { cn } from '@/lib/utils'

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const items = useCart(s => s.items)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        // Guard: API may return {error:...} if session isn't ready yet
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-[calc(100vh)] md:h-screen page-in">
      {/* Product area */}
      <div className="flex-1 min-w-0">
        <ProductGrid products={products} loading={loading} />
      </div>

      {/* Cart — desktop sidebar */}
      <div className="hidden md:flex w-80 lg:w-96 flex-col">
        <Cart />
      </div>

      {/* Cart — mobile floating button + sheet */}
      <button
        className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full text-white shadow-lg flex items-center justify-center"
        style={{ background: 'var(--brand-primary)' }}
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCart size={22} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </button>

      {/* Mobile cart sheet */}
      {cartOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <h2 className="font-semibold">Order</h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100">
                <X size={18} />
              </button>
            </div>
            <Cart />
          </div>
        </div>
      )}
    </div>
  )
}
