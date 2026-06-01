'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPath.current) {
      // Path changed = navigation completed
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 300)
      prevPath.current = pathname
    }
  }, [pathname])

  // Intercept link clicks to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a || !a.href || a.target === '_blank') return
      const url = new URL(a.href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.pathname === pathname) return
      // Start the bar
      setVisible(true)
      setWidth(30)
      timerRef.current = setTimeout(() => setWidth(70), 200)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-[3px] pointer-events-none">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${width}%`,
          background: 'var(--brand-primary)',
          boxShadow: '0 0 8px var(--brand-primary)',
        }}
      />
    </div>
  )
}
