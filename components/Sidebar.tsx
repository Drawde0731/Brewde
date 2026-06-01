'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, LogOut, Users, ChevronLeft, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useSession } from './SessionProvider'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/requests', icon: ShieldCheck, label: 'Requests',  roles: ['admin'] },
  { href: '/pos',            icon: ShoppingCart, label: 'POS',       roles: ['owner', 'cashier'] },
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard', roles: ['owner'] },
  { href: '/products',      icon: Package,      label: 'Products',  roles: ['owner'] },
  { href: '/orders',        icon: FileText,     label: 'Orders',    roles: ['owner', 'cashier'] },
  { href: '/settings',      icon: Settings,     label: 'Settings',  roles: ['owner'] },
  { href: '/settings/users',icon: Users,        label: 'Staff',     roles: ['owner'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, tenant } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const links = NAV.filter(n => user?.role && n.roles.includes(user.role))

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col bg-white border-r border-neutral-100 transition-all duration-200 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-100">
          <img
            src={tenant?.logo_url || '/logo.png'}
            alt="Brewde"
            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
          />
          {!collapsed && (
            <span className="text-sm font-semibold text-neutral-900 truncate">
              {tenant?.name || 'Brewde'}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {links.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                  collapsed && 'justify-center'
                )}
                style={active ? { background: 'var(--brand-primary)' } : {}}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-100 p-2 space-y-1">
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn('flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:bg-neutral-50 transition-colors', collapsed && 'justify-center')}
          >
            <ChevronLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-100 flex">
        {links.slice(0, 4).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={cn('flex-1 flex flex-col items-center justify-center py-2 text-xs gap-1', active ? 'text-[var(--brand-primary)]' : 'text-neutral-400')}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
        <button onClick={logout} className="flex-1 flex flex-col items-center justify-center py-2 text-xs gap-1 text-neutral-400">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </>
  )
}
