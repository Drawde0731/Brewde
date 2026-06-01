'use client'
import { Product, ProductCategory } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'coffee', label: '☕ Coffee' },
  { value: 'food', label: '🍰 Food' },
  { value: 'drink', label: '🧋 Drinks' },
]

interface ProductGridProps {
  products: Product[]
  loading: boolean
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')

  const filtered = category === 'all' ? products : products.filter(p => p.category === category)

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-2 p-4 pb-2 overflow-x-auto flex-shrink-0">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              category === c.value
                ? 'text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            )}
            style={category === c.value ? { background: 'var(--brand-primary)' } : {}}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <span className="text-4xl mb-3">📦</span>
            <p className="text-sm">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
