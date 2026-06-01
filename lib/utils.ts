import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DiscountType, PaymentMethod, ProductCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const DISCOUNT_RATES: Record<DiscountType, number> = {
  none: 0,
  pwd: 0.20,
  senior: 0.20,
}

export const DISCOUNT_LABELS: Record<DiscountType, string> = {
  none: 'No Discount',
  pwd: 'PWD (20%)',
  senior: 'Senior Citizen (20%)',
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
  online_bank: 'Online Bank',
  card: 'Card',
}

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  coffee: '☕',
  food: '🍰',
  drink: '🧋',
}

export const DEFAULT_COLORS = {
  primary: '#6F4E37',
  secondary: '#A67C52',
  accent: '#D9A441',
}
