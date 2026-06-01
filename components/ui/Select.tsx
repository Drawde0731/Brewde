import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900',
          'text-sm appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent',
          'transition-all duration-150',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
