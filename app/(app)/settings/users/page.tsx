'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, UserCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

interface StaffUser { id: string; email: string; role: string; status: string; created_at: string }

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'cashier' }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast('Cashier added', 'success')
      setOpen(false)
      setForm({ email: '', password: '' })
      load()
    } catch (err: any) {
      toast(err.message || 'Failed to add user', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl page-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff</h1>
          <p className="text-sm text-neutral-500">Manage cashiers</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Add Cashier</Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-neutral-300">
            <UserCheck size={36} className="mb-2" />
            <p className="text-sm">No staff yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-800">{u.email}</p>
                  <p className="text-xs text-neutral-400 capitalize">{u.role}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Cashier">
        <form onSubmit={add} className="space-y-4">
          <Input label="Email" type="email" placeholder="cashier@cafe.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={saving}>Add Cashier</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
