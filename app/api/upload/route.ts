import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { extractColorsFromBuffer } from '@/lib/colors'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const c = cookieStore.get('session')
  return c ? JSON.parse(c.value) : null
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = formData.get('type') as string // 'product' | 'logo'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()
  const path = `${session.tenant_id}/${type}/${Date.now()}.${ext}`

  const db = createServiceClient()
  const { data, error } = await db.storage
    .from('cafe-assets')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = db.storage.from('cafe-assets').getPublicUrl(path)

  let colors = null
  if (type === 'logo') {
    colors = await extractColorsFromBuffer(buffer)
  }

  return NextResponse.json({ url: publicUrl, colors })
}
