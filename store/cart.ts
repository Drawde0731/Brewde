import { create } from 'zustand'
import { CartItem, DiscountType, PaymentMethod } from '@/types'
import { DISCOUNT_RATES } from '@/lib/utils'

interface CartState {
  items: CartItem[]
  discount: DiscountType
  payment: PaymentMethod
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  setDiscount: (d: DiscountType) => void
  setPayment: (p: PaymentMethod) => void
  clear: () => void
  subtotal: () => number
  discountAmount: () => number
  total: () => number
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  discount: 'none',
  payment: 'cash',

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(i => i.product_id === item.product_id)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product_id === item.product_id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return { items: [...state.items, { ...item, qty: 1 }] }
    })
  },

  removeItem: (productId) => {
    set(state => ({ items: state.items.filter(i => i.product_id !== productId) }))
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId)
      return
    }
    set(state => ({
      items: state.items.map(i => i.product_id === productId ? { ...i, qty } : i),
    }))
  },

  setDiscount: (discount) => set({ discount }),
  setPayment: (payment) => set({ payment }),
  clear: () => set({ items: [], discount: 'none', payment: 'cash' }),

  subtotal: () => {
    const { items } = get()
    return items.reduce((sum, i) => sum + i.price * i.qty, 0)
  },

  discountAmount: () => {
    const { discount } = get()
    return get().subtotal() * DISCOUNT_RATES[discount]
  },

  total: () => get().subtotal() - get().discountAmount(),
}))
