'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { CheckCircle, XCircle, Clock, Building2, Mail, MessageSquare, RefreshCw, Copy, Check } from 'lucide-react'
import { SignupRequest } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200',  icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-50   text-red-600   border-red-200',    icon: XCircle },
}

interface CredentialResult {
  email: string
  cafeName: string
  tempPassword: string
  emailSent: boolean
}

function CredentialsModal({ creds, onClose }: { creds: CredentialResult; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAll = () => copy(`Email: ${creds.email}\nPassword: ${creds.tempPassword}\nLogin: ${window.location.origin}/login`)

  return (
    <Modal open onClose={onClose} title="Login Credentials">
      <div className="space-y-4">
        {/* Email status */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
          creds.emailSent ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        )}>
          {creds.emailSent
            ? <><CheckCircle size={15} /> Credentials sent to {creds.email}</>
            : <><XCircle size={15} /> Email delivery failed — share credentials manually below</>
          }
        </div>

        {/* Credentials card */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-3 border border-neutral-100">
          <div>
            <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wide font-medium">Cafe</p>
            <p className="text-sm font-semibold text-neutral-800">{creds.cafeName}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wide font-medium">Login Email</p>
            <p className="text-sm font-mono text-neutral-800">{creds.email}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wide font-medium">Temporary Password</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-neutral-900 tracking-wider">
                {creds.tempPassword}
              </code>
              <button
                onClick={() => copy(creds.tempPassword)}
                className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-600 font-medium">
            ⚠ User must change password on first login
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={copyAll}>
            <Copy size={14} /> Copy All
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<SignupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [creds, setCreds] = useState<CredentialResult | null>(null)

  const load = () => {
    fetch('/api/admin/requests')
      .then(r => r.json())
      .then(d => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const act = async (req: SignupRequest, action: 'approve' | 'reject') => {
    setActing(req.id + action)
    try {
      const res = await fetch(`/api/admin/requests/${req.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (action === 'approve') {
        setCreds({
          email: req.email,
          cafeName: req.cafe_name,
          tempPassword: data.tempPassword,
          emailSent: data.emailSent,
        })
      } else {
        toast('Request rejected', 'error')
      }
      load()
    } catch (err: any) {
      toast(err.message || 'Action failed', 'error')
    } finally {
      setActing(null)
    }
  }

  const resetCredentials = async (req: SignupRequest) => {
    setActing(req.id + 'reset')
    try {
      const res = await fetch(`/api/admin/requests/${req.id}/reset`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setCreds({
        email: req.email,
        cafeName: req.cafe_name,
        tempPassword: data.tempPassword,
        emailSent: data.emailSent,
      })
    } catch (err: any) {
      toast(err.message || 'Reset failed', 'error')
    } finally {
      setActing(null)
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="p-6 max-w-4xl page-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <img src="/logo.png" alt="Brewde" className="h-9 w-9 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Signup Requests</h1>
          <p className="text-sm text-neutral-500">Approve or reject cafe onboarding requests</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all border capitalize flex items-center gap-1.5',
              filter === f
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            )}
            style={filter === f ? { background: 'var(--brand-primary)' } : {}}
          >
            {f}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              filter === f ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
            )}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-5">
              <Skeleton className="h-5 w-48 mb-3" />
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-300">
          <CheckCircle size={48} className="mb-3" />
          <p className="text-sm">No {filter === 'all' ? '' : filter} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = cfg.icon
            const isActing = acting?.startsWith(req.id)

            return (
              <Card key={req.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Cafe name + status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={15} className="text-neutral-400 flex-shrink-0" />
                        <span className="font-semibold text-neutral-900">{req.cafe_name}</span>
                      </div>
                      <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border', cfg.color)}>
                        <StatusIcon size={11} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <Mail size={13} className="flex-shrink-0" />
                      <span>{req.email}</span>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <div className="flex items-start gap-1.5 text-sm text-neutral-500 bg-neutral-50 rounded-xl px-3 py-2">
                        <MessageSquare size={13} className="flex-shrink-0 mt-0.5" />
                        <span className="italic">{req.message}</span>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-neutral-400">
                      {new Date(req.created_at).toLocaleString('en-PH', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => act(req, 'approve')}
                          loading={acting === req.id + 'approve'}
                          disabled={!!acting}
                          className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                        >
                          <CheckCircle size={14} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => act(req, 'reject')}
                          loading={acting === req.id + 'reject'}
                          disabled={!!acting}
                          className="min-w-[100px]"
                        >
                          <XCircle size={14} /> Reject
                        </Button>
                      </>
                    )}

                    {req.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetCredentials(req)}
                        loading={acting === req.id + 'reset'}
                        disabled={!!acting}
                        className="min-w-[130px] text-xs"
                      >
                        <RefreshCw size={13} /> Reset Password
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Credentials modal */}
      {creds && <CredentialsModal creds={creds} onClose={() => setCreds(null)} />}
    </div>
  )
}
