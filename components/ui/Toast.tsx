'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'
interface Toast { id: number; message: string; type: ToastType }

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium',
              'animate-[slideIn_0.2s_ease]',
              t.type === 'success' ? 'bg-green-600' : 'bg-red-500'
            )}
          >
            {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {t.message}
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="ml-2 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
