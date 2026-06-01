import { create } from 'zustand'
import { Tenant, User } from '@/types'
import { DEFAULT_COLORS } from '@/lib/utils'

interface TenantState {
  tenant: Tenant | null
  user: User | null
  colors: { primary: string; secondary: string; accent: string }
  setTenant: (t: Tenant | null) => void
  setUser: (u: User | null) => void
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  user: null,
  colors: DEFAULT_COLORS,
  setTenant: (tenant) =>
    set({
      tenant,
      colors: tenant
        ? {
            primary: tenant.primary_color || DEFAULT_COLORS.primary,
            secondary: tenant.secondary_color || DEFAULT_COLORS.secondary,
            accent: tenant.accent_color || DEFAULT_COLORS.accent,
          }
        : DEFAULT_COLORS,
    }),
  setUser: (user) => set({ user }),
}))
