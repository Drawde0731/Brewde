'use client'
import { useEffect, useRef, useState } from 'react'
import { Product, ProductCategory } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CATEGORY_ICONS, formatPeso } from '@/lib/utils'
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

const EMPTY = { name: '', price: '', image_url: '', category: 'coffee' as ProductCategory }

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, price: String(p.price), image_url: p.image_url || '', category: p.category })
    setModalOpen(true)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'product')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm(p => ({ ...p, image_url: data.url }))
    } catch {
      toast('Image upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) return
    setSaving(true)
    try {
      const url = editing ? `/api/products/${editing.id}` : '/api/products'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      })
      if (!res.ok) throw new Error()
      toast(editing ? 'Product updated' : 'Product added', 'success')
      setModalOpen(false)
      load()
    } catch {
      toast('Failed to save product', 'error')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast('Product deleted', 'success')
      setProducts(p => p.filter(x => x.id !== id))
    } catch {
      toast('Failed to delete', 'error')
    }
    setDeleteId(null)
  }

  return (
    <div className="p-6 max-w-5xl page-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500">{products.length} items</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-300">
          <span className="text-5xl mb-3">📦</span>
          <p className="text-sm mb-4">No products yet</p>
          <Button onClick={openCreate} size="sm">Add your first product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden group">
              <div className="aspect-square bg-neutral-50 flex items-center justify-center relative overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  : <span className="text-4xl">{CATEGORY_ICONS[p.category]}</span>
                }
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(p)} className="bg-white text-neutral-700 p-2 rounded-xl hover:bg-neutral-100 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="bg-white text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>{formatPeso(p.price)}</p>
                <p className="text-xs text-neutral-400 capitalize mt-0.5">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={save} className="space-y-4">
          {/* Image upload */}
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Image</p>
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-video bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors overflow-hidden"
            >
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={24} className="text-neutral-400 mb-2" />
                  <p className="text-xs text-neutral-400">{uploading ? 'Uploading...' : 'Tap to upload image'}</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          </div>

          <Input label="Name" placeholder="Latte" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Price (₱)" type="number" step="0.01" min="0" placeholder="120.00"
            value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
          <Select label="Category" value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value as ProductCategory }))}>
            <option value="coffee">☕ Coffee</option>
            <option value="food">🍰 Food</option>
            <option value="drink">🧋 Drink</option>
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={saving || uploading}>
              {editing ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product">
        <p className="text-sm text-neutral-600 mb-6">This product will be removed. This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && del(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
