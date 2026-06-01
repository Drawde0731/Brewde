import sharp from 'sharp'

interface RGB { r: number; g: number; b: number }

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function luminance({ r, g, b }: RGB): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export async function extractColorsFromBuffer(buffer: Buffer): Promise<{
  primary: string
  secondary: string
  accent: string
}> {
  try {
    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels: RGB[] = []
    for (let i = 0; i < data.length; i += info.channels) {
      pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
    }

    // Simple k-means with k=3 - find 3 dominant colors
    const sampled = pixels.filter((_, i) => i % 10 === 0)
    const sorted = sampled.sort((a, b) => luminance(b) - luminance(a))
    const third = Math.floor(sorted.length / 3)

    const avg = (arr: RGB[]): RGB => ({
      r: Math.round(arr.reduce((s, p) => s + p.r, 0) / arr.length),
      g: Math.round(arr.reduce((s, p) => s + p.g, 0) / arr.length),
      b: Math.round(arr.reduce((s, p) => s + p.b, 0) / arr.length),
    })

    const light = avg(sorted.slice(0, third))
    const mid = avg(sorted.slice(third, third * 2))
    const dark = avg(sorted.slice(third * 2))

    // primary = darkest, secondary = mid, accent = lightest vivid
    return {
      primary: rgbToHex(dark),
      secondary: rgbToHex(mid),
      accent: rgbToHex(light),
    }
  } catch {
    return {
      primary: '#6F4E37',
      secondary: '#A67C52',
      accent: '#D9A441',
    }
  }
}
