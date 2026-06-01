import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900',
          'placeholder:text-neutral-400 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent',
          'transition-all duration-150',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
