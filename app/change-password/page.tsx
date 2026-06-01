'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return }
    if (form.newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/pos')
      router.refresh()
    } catch {
      setError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF6EC] to-[#f3ede3] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Brewde" className="h-16 w-16 rounded-full shadow-md mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900">Set New Password</h1>
          <p className="text-sm text-neutral-500 mt-1">You must change your password before continuing</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <form onSubmit={submit} className="space-y-4">
            <Input label="Temporary Password" type="password" placeholder="••••••••"
              value={form.currentPassword}
              onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            <Input label="New Password" type="password" placeholder="Min. 8 characters"
              value={form.newPassword}
              onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} required />
            <Input label="Confirm New Password" type="password" placeholder="Re-enter password"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
            {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <Button type="submit" loading={loading} size="lg" className="w-full">Set Password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
