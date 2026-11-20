export const STORAGE_KEY = 'first-noble-step.registrations.v1'
export const FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf'
export const degreePrograms = ['Intermediate', 'Graduation', 'Masters', 'Medical / Medicine', 'Computer Science (CS)', 'Other']
export const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8']
export type InstitutionCategory = 'public' | 'private'
export const institutionCategories: { value: InstitutionCategory; label: string; fee: number }[] = [
  { value: 'public', label: 'Public University / College — Rs. 4,310/-', fee: 4310 },
  { value: 'private', label: 'Private University / College — Rs. 4,870/-', fee: 4870 },
]

export const countries = [
  { id: 'PK', name: 'Pakistan', dial: '+92' },
  { id: 'US', name: 'United States', dial: '+1' },
  { id: 'GB', name: 'United Kingdom', dial: '+44' },
  { id: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { id: 'IN', name: 'India', dial: '+91' },
  { id: 'AF', name: 'Afghanistan', dial: '+93' },
  { id: 'AR', name: 'Argentina', dial: '+54' },
  { id: 'AU', name: 'Australia', dial: '+61' },
  { id: 'AT', name: 'Austria', dial: '+43' },
  { id: 'BH', name: 'Bahrain', dial: '+973' },
  { id: 'BD', name: 'Bangladesh', dial: '+880' },
  { id: 'BE', name: 'Belgium', dial: '+32' },
  { id: 'BR', name: 'Brazil', dial: '+55' },
  { id: 'CA', name: 'Canada', dial: '+1' },
  { id: 'CN', name: 'China', dial: '+86' },
  { id: 'DK', name: 'Denmark', dial: '+45' },
  { id: 'EG', name: 'Egypt', dial: '+20' },
  { id: 'FI', name: 'Finland', dial: '+358' },
  { id: 'FR', name: 'France', dial: '+33' },
  { id: 'DE', name: 'Germany', dial: '+49' },
  { id: 'GR', name: 'Greece', dial: '+30' },
  { id: 'HK', name: 'Hong Kong', dial: '+852' },
  { id: 'ID', name: 'Indonesia', dial: '+62' },
  { id: 'IE', name: 'Ireland', dial: '+353' },
  { id: 'IT', name: 'Italy', dial: '+39' },
  { id: 'JP', name: 'Japan', dial: '+81' },
  { id: 'KE', name: 'Kenya', dial: '+254' },
  { id: 'KW', name: 'Kuwait', dial: '+965' },
  { id: 'MY', name: 'Malaysia', dial: '+60' },
  { id: 'MX', name: 'Mexico', dial: '+52' },
  { id: 'MA', name: 'Morocco', dial: '+212' },
  { id: 'NP', name: 'Nepal', dial: '+977' },
  { id: 'NL', name: 'Netherlands', dial: '+31' },
  { id: 'NZ', name: 'New Zealand', dial: '+64' },
  { id: 'NG', name: 'Nigeria', dial: '+234' },
  { id: 'NO', name: 'Norway', dial: '+47' },
  { id: 'OM', name: 'Oman', dial: '+968' },
  { id: 'PH', name: 'Philippines', dial: '+63' },
  { id: 'PL', name: 'Poland', dial: '+48' },
  { id: 'PT', name: 'Portugal', dial: '+351' },
  { id: 'QA', name: 'Qatar', dial: '+974' },
  { id: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { id: 'SG', name: 'Singapore', dial: '+65' },
  { id: 'ZA', name: 'South Africa', dial: '+27' },
  { id: 'KR', name: 'South Korea', dial: '+82' },
  { id: 'ES', name: 'Spain', dial: '+34' },
  { id: 'LK', name: 'Sri Lanka', dial: '+94' },
  { id: 'SE', name: 'Sweden', dial: '+46' },
  { id: 'CH', name: 'Switzerland', dial: '+41' },
  { id: 'TW', name: 'Taiwan', dial: '+886' },
  { id: 'TH', name: 'Thailand', dial: '+66' },
  { id: 'TR', name: 'Türkiye', dial: '+90' },
  { id: 'VN', name: 'Vietnam', dial: '+84' },
  { id: 'OTHER', name: 'Other country — enter full international number', dial: '' },
]

export type FormValues = {
  name: string
  email: string
  phone: string
  address: string
  university: string
  institutionCategory: '' | InstitutionCategory
  degree: string
  semester: string
  universityCard: File | null
}
export type FileField = 'universityCard'
export type FieldName = keyof FormValues
export type TextField = Exclude<FieldName, FileField>
export type FieldErrors = Partial<Record<FieldName, string>>
export type Inquiry = Omit<FormValues, 'institutionCategory'> & Record<FileField, File> & {
  id: string
  reference: string
  createdAt: string
  country?: string
  institutionCategory?: InstitutionCategory
  status?: 'submitted' | 'confirmed'
  paymentProof?: File
}

export const emptyForm: FormValues = { name: '', email: '', phone: '', address: '', university: '', institutionCategory: '', degree: '', semester: '', universityCard: null }

export function validate(values: FormValues, { requireCategory = true }: { requireCategory?: boolean } = {}): FieldErrors {
  const errors: FieldErrors = {}
  const isIntermediate = values.degree === 'Intermediate'
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address, like name@example.com.'
  const phone = values.phone.trim()
  const digits = phone.replace(/\D/g, '')
  if (!phone) errors.phone = 'Please enter your WhatsApp number.'
  else if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) errors.phone = 'Enter a valid WhatsApp number with 7–15 digits.'
  if (!values.address.trim()) errors.address = 'Enter the address for your certificate and experience letter.'
  if (!values.university.trim()) errors.university = 'Please enter your university or college name.'
  if (requireCategory && values.institutionCategory !== 'public' && values.institutionCategory !== 'private') errors.institutionCategory = 'Please select your university or college category.'
  if (!degreePrograms.includes(values.degree)) errors.degree = 'Please select your degree program.'
  if (!isIntermediate && !semesterOptions.includes(values.semester)) errors.semester = 'Please select a semester from 1 to 8.'
  const file = values.universityCard
  if (!file) {
    errors.universityCard = isIntermediate
      ? 'Please attach your college / high school card, CNIC, or Intermediate certificate.'
      : 'Please attach your university card, CNIC, or Intermediate certificate.'
  }
  else if (!/\.(jpe?g|png|webp|pdf)$/i.test(file.name) || (file.type && !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type))) errors.universityCard = 'Choose a JPG, PNG, WebP, or PDF file.'
  else if (!file.size) errors.universityCard = 'This file is empty. Please choose another file.'
  else if (file.size > 5 * 1024 * 1024) errors.universityCard = 'Choose a file no larger than 5 MB.'
  return errors
}

// IndexedDB keeps the original documents and their registration in one transaction.
async function accessStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(STORAGE_KEY, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('registrations', { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction('registrations', mode)
      const request = action(tx.objectStore('registrations'))
      tx.oncomplete = () => resolve(request.result)
      tx.onabort = tx.onerror = () => reject(tx.error || request.error)
    })
  } finally { db.close() }
}

export async function readInquiries(): Promise<Inquiry[]> {
  try {
    const records = await accessStore<Inquiry[]>('readonly', store => store.getAll())
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

function notifyChange() {
  try { localStorage.setItem(STORAGE_KEY, crypto.randomUUID()) } catch { /* Cross-tab notifications are optional. */ }
}

export async function saveInquiry(
  values: FormValues,
  existing?: Pick<Inquiry, 'id' | 'reference' | 'createdAt'>,
  status: 'submitted' | 'confirmed' = 'submitted',
): Promise<Inquiry> {
  if (!values.universityCard) throw new Error('University card is required.')
  const hasCategory = values.institutionCategory === 'public' || values.institutionCategory === 'private'
  if (status === 'confirmed' && !hasCategory) throw new Error('University / college category is required.')
  const id = existing?.id || crypto.randomUUID()
  const inquiry: Inquiry = {
    name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(),
    address: values.address.trim(), university: values.university.trim(),
    ...(hasCategory ? { institutionCategory: values.institutionCategory as InstitutionCategory } : {}),
    degree: values.degree.trim(),
    semester: values.degree === 'Intermediate' ? '' : values.semester.trim(),
    universityCard: values.universityCard,
    id,
    reference: existing?.reference || `FNS-${id.slice(0, 6).toUpperCase()}`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    status,
  }
  await accessStore('readwrite', store => store.put(inquiry))
  notifyChange()
  return inquiry
}

export async function removeInquiry(id: string) {
  await accessStore('readwrite', store => store.delete(id))
  notifyChange()
}

export function fullPhone(inquiry: Inquiry) {
  // Only older registrations had a separately selected dialing code.
  if (!inquiry.country) return inquiry.phone
  const dial = countries.find(country => country.id === inquiry.country)?.dial || ''
  return inquiry.phone.startsWith('+') ? inquiry.phone : `${dial} ${inquiry.phone}`.trim()
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function registrationDetails(inquiry: Inquiry) {
  const categoryLabel = inquiry.institutionCategory
    ? institutionCategories.find(c => c.value === inquiry.institutionCategory)?.label
    : undefined
  return [
    ['Full name', inquiry.name], ['Email address', inquiry.email], ['WhatsApp number', fullPhone(inquiry)],
    ['Correspondence address', inquiry.address], ['University / college', inquiry.university],
    ...(categoryLabel ? [['Student category', categoryLabel] as [string, string]] : []),
    ['Degree program', inquiry.degree],
    ...(inquiry.semester ? [['Current semester', inquiry.semester] as [string, string]] : []),
  ]
}

export function downloadFile(file: Blob, filename: string) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadInquiry(inquiry: Inquiry) {
  const text = [
    'FIRST NOBLE STEP — STUDENT REGISTRATION', `Reference: ${inquiry.reference}`,
    `Saved: ${new Date(inquiry.createdAt).toLocaleString()}`, '',
    ...registrationDetails(inquiry).map(([label, value]) => `${label}: ${value}`), '',
    `${inquiry.degree === 'Intermediate' ? 'College / high school card' : 'University card'}: ${inquiry.universityCard.name}`, ...(inquiry.paymentProof ? [`Payment proof: ${inquiry.paymentProof.name}`] : []), '',
    'Local registration record. This is not a payment confirmation.',
    'Access your documents under Privacy note → My registrations. This form has not sent them to the company.',
  ].join('\n')
  downloadFile(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${inquiry.reference}.txt`)
}
