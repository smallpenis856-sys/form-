import { buildChallan } from './challan'
import { fullPhone } from './inquiries'
import type { Inquiry } from './inquiries'

export type SheetSyncStatus = 'Form Submitted' | 'Challan Generated'

export type SheetPayload = {
  reference: string
  submittedAt: string
  status: SheetSyncStatus
  name: string
  email: string
  phone: string
  address: string
  university: string
  institutionCategory: string
  fee: number | ''
  degree: string
  semester: string
  universityCardFile: string
  issueDate: string
  validTill: string
}

export function buildSheetPayload(inquiry: Inquiry, status: SheetSyncStatus): SheetPayload {
  const hasCategory = inquiry.institutionCategory === 'public' || inquiry.institutionCategory === 'private'
  const challan = hasCategory ? buildChallan(inquiry) : null
  return {
    reference: inquiry.reference,
    submittedAt: inquiry.createdAt,
    status,
    name: inquiry.name,
    email: inquiry.email,
    phone: fullPhone(inquiry),
    address: inquiry.address,
    university: inquiry.university,
    institutionCategory: hasCategory
      ? (inquiry.institutionCategory === 'private' ? 'Private University / College' : 'Government University / College')
      : '',
    fee: challan ? challan.amount : '',
    degree: inquiry.degree,
    semester: inquiry.semester,
    universityCardFile: inquiry.universityCard?.name || '',
    issueDate: challan ? challan.issue : '',
    validTill: challan ? challan.valid : '',
  }
}

export async function syncInquiryToSheet(inquiry: Inquiry, status: SheetSyncStatus): Promise<boolean> {
  const url = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL?.trim()
  if (!url) return false
  try {
    // text/plain avoids CORS preflight OPTIONS, which Google Apps Script Web Apps do not serve.
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(buildSheetPayload(inquiry, status)),
      keepalive: true,
    })
    return response.ok
  } catch {
    return false
  }
}
