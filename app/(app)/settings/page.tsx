'use client'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { HexColorPicker } from 'react-colorful'
import { DEFAULT_COLORS } from '@/lib/utils'
import { Tenant } from '@/types'
import { useSession } from '@/components/SessionProvider'
import { ImagePlus, RefreshCw } from 'lucide-react'

const PRESETS = [
  { primary: '#6F4E37', secondary: '#A67C52', accent: '#D9A441' },
  { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560' },
  { primary: '#065f46', secondary: '#047857', accent: '#34d399' },
  { primary: '#1e3a5f', secondary: '#2563eb', accent: '#f59e0b' },
  { primary: '#581c87', secondary: '#7c3aed', accent: '#a78bfa' },
  { primary: '#9f1239', secondary: '#e11d48', accent: '#fb7185' },
]

type ColorKey = 'primary_color' | 'secondary_color' | 'accent_color'

export default function SettingsPage() {
  const { toast } = useToast()
  const { tenant, refresh } = useSession()
  const [colors, setColors] = useState({ primary_color: DEFAULT_COLORS.primary, secondary_color: DEFAULT_COLORS.secondary, accent_color: DEFAULT_COLORS.accent })
  const [logoUrl, setLogoUrl] = useState('')
  const [auto, setAuto] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [picker, setPicker] = useState<ColorKey | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tenant) {
      setColors({ primary_color: tenant.primary_color, secondary_color: tenant.secondary_color, accent_color: tenant.accent_color })
      setLogoUrl(tenant.logo_url || '')
      setAuto(tenant.auto_detect_colors)
    }
  }, [tenant])

  // Live preview
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--brand-primary', colors.primary_color)
    root.style.setProperty('--brand-secondary', colors.secondary_color)
    root.style.setProperty('--brand-accent', colors.accent_color)
  }, [colors])

  const uploadLogo = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'logo')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setLogoUrl(data.url)
        if (auto && data.colors) {
          setColors({ primary_color: data.colors.primary, secondary_color: data.colors.secondary, accent_color: data.colors.accent })
        }
        toast('Logo uploaded', 'success')
      }
    } catch {
      toast('Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tenants/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: logoUrl || null, ...colors, auto_detect_colors: auto }),
      })
      if (!res.ok) throw new Error()
      await refresh()
      toast('Settings saved', 'success')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const colorFields: { key: ColorKey; label: string }[] = [
    { key: 'primary_color', label: 'Primary' },
    { key: 'secondary_color', label: 'Secondary' },
    { key: 'accent_color', label: 'Accent' },
  ]

  return (
    <div className="p-6 max-w-2xl page-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Branding & appearance</p>
      </div>

      {/* Logo */}
      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Logo</h2>
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="h-20 w-20 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors overflow-hidden flex-shrink-0"
          >
            {logoUrl
              ? <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              : uploading
                ? <RefreshCw size={20} className="animate-spin text-neutral-400" />
                : <ImagePlus size={20} className="text-neutral-400" />
            }
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-1">Cafe Logo</p>
            <p className="text-xs text-neutral-400 mb-2">PNG, JPG up to 5MB. Colors auto-extracted when uploaded.</p>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading...' : 'Choose Image'}
            </Button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
      </Card>

      {/* Colors */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Brand Colors</h2>
          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <div
              onClick={() => setAuto(!auto)}
              className={`w-9 h-5 rounded-full transition-colors relative ${auto ? 'bg-[var(--brand-primary)]' : 'bg-neutral-200'}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${auto ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            Auto from logo
          </label>
        </div>

        {/* Preset swatches */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {PRESETS.map((preset, i) => (
            <button key={i}
              onClick={() => setColors({ primary_color: preset.primary, secondary_color: preset.secondary, accent_color: preset.accent })}
              className="h-8 w-8 rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ background: preset.primary }}
              title={preset.primary}
            />
          ))}
        </div>

        {/* Color pickers */}
        <div className="space-y-4">
          {colorFields.map(({ key, label }) => (
            <div key={key}>
              <p className="text-sm font-medium text-neutral-700 mb-2">{label}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPicker(picker === key ? null : key)}
                  className="h-10 w-10 rounded-xl border border-neutral-200 shadow-sm flex-shrink-0 hover:scale-105 transition-transform"
                  style={{ background: colors[key] }}
                />
                <Input
                  value={colors[key]}
                  onChange={e => setColors(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="#000000"
                  className="font-mono flex-1"
                />
              </div>
              {picker === key && (
                <div className="mt-3">
                  <HexColorPicker
                    color={colors[key]}
                    onChange={v => setColors(p => ({ ...p, [key]: v }))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Preview bar */}
      <Card className="p-4">
        <p className="text-xs text-neutral-500 mb-3">Live Preview</p>
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: colors.primary_color }}>Primary Button</button>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: colors.secondary_color }}>Secondary</button>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: colors.accent_color }}>Accent</button>
        </div>
      </Card>

      <Button size="lg" loading={saving} onClick={save} className="w-full">
        Save Settings
      </Button>
    </div>
  )
}
