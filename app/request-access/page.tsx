'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RequestAccessPage() {
  const [form, setForm] = useState({ email: '', cafe_name: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/signup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDone(true)
    } catch {
      setError('Failed to submit. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF6EC] to-[#f3ede3] p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 text-3xl mb-5">
            ✓
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Request Submitted</h2>
          <p className="text-sm text-neutral-500 mb-6">
            We&apos;ll review your request and send login credentials to <strong>{form.email}</strong> if approved.
          </p>
          <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF6EC] to-[#f3ede3] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Brewde" className="h-16 w-16 rounded-full shadow-md mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900">Request Access</h1>
          <p className="text-sm text-neutral-500 mt-1">Your request will be reviewed by our team</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Cafe Name"
              placeholder="My Coffee Shop"
              value={form.cafe_name}
              onChange={e => setForm(p => ({ ...p, cafe_name: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="owner@mycafe.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Message (optional)</label>
              <textarea
                placeholder="Tell us about your cafe..."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent resize-none"
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Submit Request
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--brand-primary)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
