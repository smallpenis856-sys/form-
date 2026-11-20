import type { Inquiry, InstitutionCategory } from './inquiries'

// Extracted from FNS_Challan_Generator.html so the 3-copy A4 landscape challan matches exactly.
const LOGO = "data:image/png;base64,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"
const BANK = "data:image/png;base64,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"
const QR_PATH = "M0 0h7v1h-7zM8 0h1v1h-1zM10 0h2v1h-2zM15 0h2v1h-2zM19 0h2v1h-2zM22 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h1v1h-1zM11 1h2v1h-2zM14 1h2v1h-2zM17 1h2v1h-2zM20 1h1v1h-1zM22 1h1v1h-1zM28 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM9 2h2v1h-2zM13 2h3v1h-3zM18 2h1v1h-1zM20 2h1v1h-1zM22 2h1v1h-1zM24 2h3v1h-3zM28 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h4v1h-4zM17 3h3v1h-3zM22 3h1v1h-1zM24 3h3v1h-3zM28 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h2v1h-2zM12 4h2v1h-2zM18 4h2v1h-2zM22 4h1v1h-1zM24 4h3v1h-3zM28 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h2v1h-2zM14 5h1v1h-1zM19 5h2v1h-2zM22 5h1v1h-1zM28 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h7v1h-7zM8 7h2v1h-2zM13 7h2v1h-2zM17 7h2v1h-2zM0 8h1v1h-1zM2 8h2v1h-2zM5 8h3v1h-3zM10 8h1v1h-1zM13 8h2v1h-2zM16 8h1v1h-1zM18 8h2v1h-2zM22 8h1v1h-1zM25 8h1v1h-1zM27 8h2v1h-2zM0 9h1v1h-1zM2 9h2v1h-2zM11 9h2v1h-2zM15 9h2v1h-2zM19 9h2v1h-2zM22 9h3v1h-3zM28 9h1v1h-1zM0 10h1v1h-1zM3 10h2v1h-2zM6 10h3v1h-3zM10 10h2v1h-2zM14 10h1v1h-1zM16 10h1v1h-1zM20 10h1v1h-1zM26 10h2v1h-2zM1 11h2v1h-2zM5 11h1v1h-1zM9 11h2v1h-2zM12 11h3v1h-3zM16 11h1v1h-1zM18 11h4v1h-4zM23 11h2v1h-2zM28 11h1v1h-1zM0 12h1v1h-1zM2 12h1v1h-1zM6 12h1v1h-1zM11 12h1v1h-1zM16 12h1v1h-1zM21 12h1v1h-1zM25 12h2v1h-2zM1 13h3v1h-3zM5 13h1v1h-1zM11 13h3v1h-3zM15 13h1v1h-1zM17 13h2v1h-2zM22 13h1v1h-1zM26 13h3v1h-3zM2 14h2v1h-2zM5 14h4v1h-4zM14 14h1v1h-1zM19 14h1v1h-1zM21 14h1v1h-1zM24 14h1v1h-1zM26 14h3v1h-3zM0 15h1v1h-1zM2 15h1v1h-1zM4 15h2v1h-2zM8 15h1v1h-1zM13 15h1v1h-1zM16 15h1v1h-1zM19 15h4v1h-4zM24 15h1v1h-1zM27 15h1v1h-1zM1 16h3v1h-3zM6 16h1v1h-1zM16 16h1v1h-1zM18 16h4v1h-4zM24 16h2v1h-2zM27 16h1v1h-1zM1 17h2v1h-2zM9 17h1v1h-1zM11 17h3v1h-3zM15 17h2v1h-2zM19 17h2v1h-2zM23 17h1v1h-1zM25 17h3v1h-3zM0 18h1v1h-1zM4 18h4v1h-4zM9 18h1v1h-1zM15 18h1v1h-1zM20 18h1v1h-1zM23 18h1v1h-1zM26 18h1v1h-1zM4 19h1v1h-1zM7 19h3v1h-3zM11 19h1v1h-1zM17 19h3v1h-3zM21 19h2v1h-2zM24 19h1v1h-1zM26 19h1v1h-1zM1 20h2v1h-2zM4 20h4v1h-4zM9 20h2v1h-2zM12 20h2v1h-2zM17 20h2v1h-2zM20 20h7v1h-7zM8 21h1v1h-1zM13 21h2v1h-2zM16 21h1v1h-1zM20 21h1v1h-1zM24 21h5v1h-5zM0 22h7v1h-7zM8 22h1v1h-1zM11 22h3v1h-3zM17 22h1v1h-1zM19 22h2v1h-2zM22 22h1v1h-1zM24 22h2v1h-2zM27 22h1v1h-1zM0 23h1v1h-1zM6 23h1v1h-1zM8 23h1v1h-1zM10 23h2v1h-2zM15 23h1v1h-1zM19 23h2v1h-2zM24 23h2v1h-2zM27 23h1v1h-1zM0 24h1v1h-1zM2 24h3v1h-3zM6 24h1v1h-1zM9 24h3v1h-3zM14 24h2v1h-2zM17 24h1v1h-1zM20 24h5v1h-5zM26 24h2v1h-2zM0 25h1v1h-1zM2 25h3v1h-3zM6 25h1v1h-1zM8 25h1v1h-1zM12 25h3v1h-3zM16 25h2v1h-2zM19 25h3v1h-3zM23 25h3v1h-3zM28 25h1v1h-1zM0 26h1v1h-1zM2 26h3v1h-3zM6 26h1v1h-1zM8 26h1v1h-1zM10 26h2v1h-2zM13 26h1v1h-1zM16 26h1v1h-1zM23 26h1v1h-1zM26 26h1v1h-1zM28 26h1v1h-1zM0 27h1v1h-1zM6 27h1v1h-1zM11 27h4v1h-4zM16 27h1v1h-1zM20 27h1v1h-1zM22 27h1v1h-1zM25 27h1v1h-1zM27 27h1v1h-1zM0 28h7v1h-7zM8 28h4v1h-4zM16 28h5v1h-5zM27 28h1v1h-1z"

const TERMS: [string, 'B' | 'R'][][][] = [
  [[['Acceptance of Terms.', 'B'], ['By depositing this challan, the depositor agrees to be bound by the', 'R']], [['Terms & Conditions and Privacy Policy of First Noble Step (Private) Limited.', 'R']]],
  [[['Payment Validity.', 'B'], ['The fee must be paid on or before the "Valid Till" date of this challan.', 'R']]],
  [[['Authenticity.', 'B'], ['Fabricated, forged or tampered payment slips shall not be entertained; the', 'R']], [['Company reserves the right to take strict legal action against the offender.', 'R']]],
  [[['Registration.', 'B'], ['After payment, the student must complete the registration form before this', 'R']], [['challan expires, failing which the Company shall not be liable for any resulting loss or', 'R']], [['damage.', 'R']]],
]

export const FEE_BY_CATEGORY: Record<InstitutionCategory, number> = {
  public: 4310,
  private: 4870,
}

const VALIDITY_DAYS = 7
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PW = 841.8898
const PH = 595.2756
const FONT = "Helvetica, Arial, 'Liberation Sans', sans-serif"

function below100(n: number) {
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}

function below1000(n: number) {
  const h = Math.floor(n / 100)
  const r = n % 100
  const out: string[] = []
  if (h) out.push(ONES[h] + ' Hundred')
  if (r) out.push(below100(r))
  return out.join(' ')
}

function intWords(n: number) {
  if (n === 0) return 'Zero'
  const parts: string[] = []
  const crore = Math.floor(n / 1e7); n %= 1e7
  const lakh = Math.floor(n / 1e5); n %= 1e5
  const th = Math.floor(n / 1e3); n %= 1e3
  if (crore) parts.push(below1000(crore) + ' Crore')
  if (lakh) parts.push(below1000(lakh) + ' Lakh')
  if (th) parts.push(below1000(th) + ' Thousand')
  if (n) parts.push(below1000(n))
  return parts.join(' ')
}

export function amountWords(amount: number) {
  const cents = Math.round(amount * 100)
  const rupees = Math.floor(cents / 100)
  const paisa = cents % 100
  let s = intWords(rupees) + ' Rupees'
  if (paisa) s += ' and ' + intWords(paisa) + ' Paisa'
  return s + ' Only'
}

export function fmtMoney(amount: number) {
  const cents = Math.round(amount * 100)
  const r = Math.floor(cents / 100)
  const p = cents % 100
  let s = String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (p) s += '.' + (p < 10 ? '0' : '') + p
  return s + '/-'
}

export function fmtChallanDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`
}

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

let measureCtx: CanvasRenderingContext2D | null | undefined

function wrapWords(str: string) {
  if (typeof document === 'undefined') return { lines: [str], fs: 7.4 }
  if (measureCtx === undefined) measureCtx = document.createElement('canvas').getContext('2d')
  if (!measureCtx) return { lines: [str], fs: 7.4 }
  const maxw = 244
  for (let fs = 8; fs >= 5.6; fs -= 0.2) {
    measureCtx.font = `bold ${fs}px Arial, Helvetica, sans-serif`
    const words = str.split(' ')
    const lines: string[] = []
    let cur = ''
    for (const word of words) {
      const tr = cur ? cur + ' ' + word : word
      if (measureCtx.measureText(tr).width <= maxw) cur = tr
      else {
        if (cur) lines.push(cur)
        cur = word
      }
    }
    if (cur) lines.push(cur)
    if (lines.length <= 2) return { lines, fs: +fs.toFixed(1) }
  }
  return { lines: [str], fs: 5.6 }
}

type PanelData = {
  name: string
  app: string
  issue: string
  valid: string
  fee: string
  wordsLines: string[]
  wordsFs: number
}

function panel(ox: number, copy: string, d: PanelData) {
  const X = (u: number) => +(ox + u).toFixed(2)
  const Y = (y: number) => +(PH - y).toFixed(2)
  let s = ''

  function T(u: number, y: number, str: string, o: { fs?: number; b?: number; i?: number; fill?: string; ls?: number; anchor?: string; fit?: number; raw?: number } = {}) {
    s += `<text x="${X(u)}" y="${Y(y)}" font-size="${o.fs || 6.4}"${o.b ? ' font-weight="700"' : ''}${o.i ? ' font-style="italic"' : ''} fill="${o.fill || '#000'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.fit ? ` data-fit="${o.fit}"` : ''} xml:space="preserve" style="white-space:pre">${o.raw ? str : esc(str)}</text>`
  }

  function L(u1: number, y1: number, u2: number, y2: number, w: number, dash?: string) {
    s += `<line x1="${X(u1)}" y1="${Y(y1)}" x2="${X(u2)}" y2="${Y(y2)}" stroke="#000" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
  }

  function R(u: number, yb: number, w: number, h: number, o: { rx?: number; fill?: string; sw?: number } = {}) {
    s += `<rect x="${X(u)}" y="${Y(yb + h)}" width="${w}" height="${h}"${o.rx ? ` rx="${o.rx}"` : ''} fill="${o.fill || 'none'}"${o.sw ? ` stroke="#000" stroke-width="${o.sw}"` : ''}/>`
  }

  const G = '#444'
  const W = 247.2966

  // header
  T(0, 565.2756, 'FEE DEPOSIT SLIP', { fs: 6.8, b: 1, ls: 1.4 })
  R(181.2966, 562.2756, 66, 12, { rx: 6, sw: 0.8 })
  T(214.2966, 565.7756, copy, { fs: 6.2, b: 1, anchor: 'middle' })
  s += `<image href="${LOGO}" x="${X(0)}" y="${Y(549.2756)}" width="30" height="36"/>`
  T(36, 539.2756, 'First Noble Step (Private) Limited', { fs: 10.5, b: 1 })
  T(36, 529.2756, '129 CCA-3, Block-X, DHA Phase 7, Lahore', { fs: 6.4, fill: G })
  T(36, 521.2756, 'CUIN/PP/REG/INC No. 0325574  |  NTN: I489045-3', { fs: 6.4, fill: G })
  T(36, 513.2756, 'support@firstnoblestep.com  |  0333 2288877  |  0300 3339811', { fs: 6.4, fill: G })
  T(0, 493.2756, 'Corporate E-Training Program', { fs: 14, b: 1 })
  L(0, 486.2756, 34, 486.2756, 1.6)

  // deposit box
  R(0, 368.2756, W, 103, { rx: 6, sw: 1 })
  R(10, 466.2756, 64, 10, { fill: '#fff' })
  T(14, 468.7756, 'DEPOSIT TO', { fs: 6.4, b: 1, ls: 1.2 })
  s += `<image href="${BANK}" x="${X(147.2966)}" y="${Y(461.2756)}" width="88" height="22"/>`
  const rows: [string, string, number][] = [
    ['Account Title', 'FIRST NOBLE STEP (PRIVATE) LIMITED', 427.2756],
    ['Account No.', '3291499000005525', 414.2756],
    ['IBAN', 'PK03FAYS3291499000005525', 401.2756],
    ['Bank', 'Faysal Bank Limited', 388.2756],
  ]
  for (const r of rows) {
    T(12, r[2], r[0], { fs: 6.6, fill: G })
    T(66, r[2], r[1], { fs: 7.8, b: 1 })
  }
  for (const y of [422.7756, 409.7756, 396.7756]) L(12, y, 235.2966, y, 0.4, '1 2')
  T(12, 375.2756, 'Payable at any Faysal Bank Limited branch (cash only)', { fs: 6.3, i: 1, fill: G })

  // student fields
  L(0, 338.2756, 72, 338.2756, 0.6); T(0, 330.2756, 'DATE OF ISSUE', { fill: G })
  L(80, 338.2756, 150, 338.2756, 0.6); T(80, 330.2756, 'VALID TILL', { fill: G })
  L(0, 304.2756, 150, 304.2756, 0.6); T(0, 296.2756, 'STUDENT NAME', { fill: G })
  L(0, 270.2756, 150, 270.2756, 0.6); T(0, 262.2756, 'APPLICATION #', { fill: G })
  T(1, 341.6, d.issue, { fs: 8.5, b: 1, fit: 69 })
  T(81, 341.6, d.valid, { fs: 8.5, b: 1, fit: 68 })
  T(1, 307.6, d.name, { fs: 9, b: 1, fit: 148 })
  T(1, 273.6, d.app, { fs: 9, b: 1, fit: 148 })

  // QR column
  const cx = 158 + (W - 158) / 2
  R(158, 257, W - 158, 106, { sw: 0.6 })
  R(158, 353, W - 158, 10, { fill: '#000' })
  T(cx, 355.8, 'STUDENT REGISTRATION', { fs: 5.6, b: 1, ls: 0.5, fill: '#fff', anchor: 'middle' })
  T(cx, 345, 'Fill the registration form <tspan font-weight="700">as soon</tspan>', { fs: 5.6, anchor: 'middle', raw: 1 })
  T(cx, 338.2, '<tspan font-weight="700">as possible</tspan> after fee', { fs: 5.6, anchor: 'middle', raw: 1 })
  T(cx, 331.4, 'submission.', { fs: 5.6, anchor: 'middle' })
  const q = 63.4
  s += `<g transform="translate(${X(cx - q / 2)} ${Y(263 + q)}) scale(${q / 29})"><path d="${QR_PATH}" fill="#000" shape-rendering="crispEdges"/></g>`

  // fee + total boxes
  R(0, 228.2756, W, 22, { sw: 1.2 })
  L(182, 228.2756, 182, 250.2756, 0.8)
  T(8, 236.2756, 'Corporate E-Training Program Registration Fee', { fs: 7.4, b: 1 })
  T(185, 236.2756, 'Rs.', { fs: 6.2, fill: G })
  T(W - 6, 236.2756, d.fee, { fs: 8.5, b: 1, anchor: 'end', fit: 43 })
  R(0, 206.2756, W, 22, { sw: 1.2 })
  L(182, 206.2756, 182, 228.2756, 0.8)
  T(8, 214.2756, 'TOTAL PAYABLE (Rs.)', { fs: 8.2, b: 1 })
  T(W - 6, 214.2756, d.fee, { fs: 9, b: 1, anchor: 'end', fit: 56 })

  // amount in words
  L(0, 184.2756, W, 184.2756, 0.6)
  L(0, 166.2756, W, 166.2756, 0.6)
  T(0, 158.2756, 'AMOUNT IN WORDS (RUPEES)', { fill: G })
  d.wordsLines.forEach((ln, i) => { T(1, i ? 169.6 : 187.6, ln, { fs: d.wordsFs, b: 1 }) })

  // signatures
  L(0, 124.2756, 116.6483, 124.2756, 0.6)
  L(130.6483, 124.2756, W, 124.2756, 0.6)
  T(0, 116.2756, "DEPOSITOR'S SIGNATURE", { fill: G })
  T(130.6483, 116.2756, 'BANK OFFICER / STAMP', { fill: G })
  T(0, 102.2756, 'Fee is non-refundable once the program has started.', { fs: 6.2, i: 1, fill: G })

  // terms
  R(0, 86.4, W, 9.2, { fill: '#000' })
  T(5, 89, 'TERMS & CONDITIONS', { fs: 6.4, b: 1, ls: 1.2, fill: '#fff' })
  let y = 78
  TERMS.forEach((cl, i) => {
    T(1, y, `${i + 1}.`, { fs: 5.7, b: 1 })
    for (const line of cl) {
      const t = line.map((sg, k) => {
        const txt = (k ? ' ' : '') + sg[0]
        return sg[1] === 'B' ? `<tspan font-weight="700">${esc(txt)}</tspan>` : esc(txt)
      }).join('')
      T(10, y, t, { fs: 5.7, raw: 1 })
      y -= 6.6
    }
    y -= 2
  })
  L(0, y + 3, W, y + 3, 0.5)
  return s
}

export function buildChallan(inquiry: Pick<Inquiry, 'name' | 'reference' | 'createdAt' | 'institutionCategory'>) {
  const issueDate = new Date(inquiry.createdAt)
  const validDate = new Date(issueDate.getFullYear(), issueDate.getMonth(), issueDate.getDate() + VALIDITY_DAYS)
  const category: InstitutionCategory = inquiry.institutionCategory === 'private' ? 'private' : 'public'
  const amount = FEE_BY_CATEGORY[category]
  const issue = fmtChallanDate(issueDate)
  const valid = fmtChallanDate(validDate)
  const fee = fmtMoney(amount)
  const words = amountWords(amount)
  const wrapped = wrapWords(words)

  const data: PanelData = {
    name: inquiry.name.trim().replace(/\s+/g, ' '),
    app: inquiry.reference,
    issue,
    valid,
    fee,
    wordsLines: wrapped.lines,
    wordsFs: wrapped.fs,
  }

  const oxList = [26, 297.2966, 568.5932]
  const copies = ['BANK COPY', 'STUDENT COPY', 'COMPANY COPY']
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" font-family="${FONT}" role="img" aria-label="Fee deposit challan, three copies"><rect width="${PW}" height="${PH}" fill="#fff"/>`
  oxList.forEach((ox, i) => { svg += panel(ox, copies[i], data) })
  for (const x of [285.2966, 556.5932]) {
    svg += `<line x1="${x}" y1="${PH - 583.2756}" x2="${x}" y2="${PH - 12}" stroke="#000" stroke-width=".5" stroke-dasharray="3 3"/>`
  }
  svg += '</svg>'

  const title = `Challan_${data.app.replace(/[^\w-]+/g, '_')}_${data.name.replace(/[^\w-]+/g, '_')}`
  return { svg, title, issue, valid, fee, amount, words }
}

export function fitChallanText(root: Element | null) {
  if (!root) return
  root.querySelectorAll<SVGTextElement>('text[data-fit]').forEach(t => {
    const max = parseFloat(t.getAttribute('data-fit') || '0')
    let fs = parseFloat(t.getAttribute('font-size') || '8')
    let guard = 0
    while (t.getComputedTextLength() > max && fs > 4.5 && guard++ < 60) {
      fs -= 0.25
      t.setAttribute('font-size', String(fs))
    }
  })
}
