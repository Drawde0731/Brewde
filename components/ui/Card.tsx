import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white rounded-2xl border border-neutral-100 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}
