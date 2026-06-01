'use client'
import { Product } from '@/types'
import { CATEGORY_ICONS, formatPeso } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)
  const [flash, setFlash] = useState(false)

  const tap = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    })
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }

  return (
    <button
      onClick={tap}
      className={cn(
        'bg-white rounded-2xl border border-neutral-100 overflow-hidden text-left transition-all duration-150',
        'hover:shadow-md hover:border-neutral-200 active:scale-[0.97]',
        flash && 'ring-2 scale-[0.97]'
      )}
      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
    >
      {/* Image area */}
      <div className="aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl select-none">{CATEGORY_ICONS[product.category] || '📦'}</span>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-neutral-900 truncate leading-tight">{product.name}</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--brand-primary)' }}>
          {formatPeso(product.price)}
        </p>
      </div>
    </button>
  )
}
