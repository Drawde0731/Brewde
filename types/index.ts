export type UserRole = 'admin' | 'owner' | 'cashier'
export type UserStatus = 'pending' | 'active' | 'rejected'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type DiscountType = 'none' | 'pwd' | 'senior'
export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'online_bank' | 'card'
export type ProductCategory = 'coffee' | 'food' | 'drink'

export interface Tenant {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  auto_detect_colors: boolean
  owner_user_id: string
  created_at: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  tenant_id: string | null
  force_password_change: boolean
  created_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  price: number
  image_url: string | null
  category: ProductCategory
  created_at: string
}

export interface Order {
  id: string
  tenant_id: string
  subtotal: number
  discount_type: DiscountType
  discount_rate: number
  discount_amount: number
  total: number
  payment_method: PaymentMethod
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_name: string
  price: number
  qty: number
}

export interface SignupRequest {
  id: string
  email: string
  cafe_name: string
  message: string | null
  status: RequestStatus
  created_at: string
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  qty: number
  image_url: string | null
  category: ProductCategory
}

export interface BrandColors {
  primary_color: string
  secondary_color: string
  accent_color: string
}
