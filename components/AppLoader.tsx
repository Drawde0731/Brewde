'use client'

export function AppLoader({ logo }: { logo?: string | null }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
      <img
        src={logo || '/logo.png'}
        alt="Brewde"
        className="h-20 w-20 object-contain rounded-full mb-6 shadow-md"
      />
      <p className="text-sm font-semibold text-neutral-400 tracking-widest uppercase mb-4">Brewde</p>
      <div className="w-32 h-1 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full animate-[loading_1.2s_ease-in-out_infinite]"
          style={{ background: 'var(--brand-primary)' }} />
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
