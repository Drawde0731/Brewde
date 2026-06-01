'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(data.redirect || '/pos')
      router.refresh()
    } catch {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF6EC] to-[#f3ede3] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Brewde" className="h-16 w-16 rounded-full shadow-md mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900">Brewde</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@cafe.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/request-access" className="font-medium" style={{ color: 'var(--brand-primary)' }}>
            Request Access
          </Link>
        </p>
      </div>
    </div>
  )
}
