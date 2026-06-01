'use client'
import { useEffect } from 'react'
import { Tenant } from '@/types'
import { DEFAULT_COLORS } from '@/lib/utils'

export function BrandProvider({ tenant, children }: { tenant: Tenant | null; children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    const primary = tenant?.primary_color || DEFAULT_COLORS.primary
    const secondary = tenant?.secondary_color || DEFAULT_COLORS.secondary
    const accent = tenant?.accent_color || DEFAULT_COLORS.accent
    root.style.setProperty('--brand-primary', primary)
    root.style.setProperty('--brand-secondary', secondary)
    root.style.setProperty('--brand-accent', accent)
  }, [tenant])

  return <>{children}</>
}
