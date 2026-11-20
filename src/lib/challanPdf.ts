import { downloadFile } from './inquiries'

const A4_LANDSCAPE_W_PT = 841.89
const A4_LANDSCAPE_H_PT = 595.28

/**
 * Wraps a JPEG byte array into a single-page A4 landscape PDF 1.4 document.
 */
export function buildSinglePagePdf(jpegBytes: Uint8Array, widthPx: number, heightPx: number): Uint8Array {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let byteLength = 0

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes)
    byteLength += bytes.length
  }
  const pushText = (text: string) => pushBytes(encoder.encode(text))

  // Binary comment line marks PDF as containing binary image data.
  pushText('%PDF-1.4\n')
  pushBytes(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  const startObj = (id: number) => {
    offsets[id] = byteLength
    pushText(`${id} 0 obj\n`)
  }

  // 1: Catalog
  startObj(1)
  pushText('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  // 2: Pages
  startObj(2)
  pushText('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')

  // 3: Page (A4 landscape in points)
  startObj(3)
  pushText(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_LANDSCAPE_W_PT} ${A4_LANDSCAPE_H_PT}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  )

  // 4: JPEG Image XObject
  startObj(4)
  pushText(
    `<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  )
  pushBytes(jpegBytes)
  pushText('\nendstream\nendobj\n')

  // 5: Page drawing content stream
  const content = `q\n${A4_LANDSCAPE_W_PT} 0 0 ${A4_LANDSCAPE_H_PT} 0 0 cm\n/Im0 Do\nQ\n`
  const contentBytes = encoder.encode(content)
  startObj(5)
  pushText(`<< /Length ${contentBytes.length} >>\nstream\n`)
  pushBytes(contentBytes)
  pushText('endstream\nendobj\n')

  // Cross-reference table
  const xrefOffset = byteLength
  pushText('xref\n0 6\n0000000000 65535 f \n')
  for (let id = 1; id <= 5; id++) {
    pushText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`)
  }
  pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`)

  const pdf = new Uint8Array(byteLength)
  let cursor = 0
  for (const chunk of chunks) {
    pdf.set(chunk, cursor)
    cursor += chunk.length
  }
  return pdf
}

/**
 * Renders the live challan SVG at ~250 DPI onto a canvas and downloads an A4 landscape PDF.
 */
export async function downloadChallanPdf(svgElement: SVGSVGElement, title: string): Promise<void> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', String(A4_LANDSCAPE_W_PT))
  clone.setAttribute('height', String(A4_LANDSCAPE_H_PT))
  clone.querySelectorAll('image').forEach(img => {
    const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    if (href) {
      img.setAttribute('href', href)
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href)
    }
  })

  const svgMarkup = new XMLSerializer().serializeToString(clone)
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to render challan image.'))
      img.src = svgUrl
    })
    if (typeof image.decode === 'function') {
      await image.decode().catch(() => {})
    }

    const scale = 2.5
    const widthPx = Math.round(A4_LANDSCAPE_W_PT * scale)
    const heightPx = Math.round(A4_LANDSCAPE_H_PT * scale)
    const canvas = document.createElement('canvas')
    canvas.width = widthPx
    canvas.height = heightPx
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable.')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, widthPx, heightPx)
    ctx.drawImage(image, 0, 0, widthPx, heightPx)

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Failed to encode challan image.'))),
        'image/jpeg',
        0.95,
      )
    })

    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())
    const pdfBytes = buildSinglePagePdf(jpegBytes, widthPx, heightPx)
    const safeFilename = title.replace(/[^a-zA-Z0-9._-]+/g, '_') + '.pdf'
    downloadFile(new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), safeFilename)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
