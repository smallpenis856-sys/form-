import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, GraduationCap, Landmark, Mail, Send, Upload, UserRound } from 'lucide-react'
import { academicLevelOptions, degreePrograms, emptyForm, FILE_ACCEPT, institutionCategories, saveInquiry, validate } from '../lib/inquiries'
import type { FieldErrors, FieldName, FileField, FormValues, Inquiry, InstitutionCategory, TextField } from '../lib/inquiries'
import { syncInquiryToSheet } from '../lib/sheets'

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 2c-5.516 0-9.992 4.476-9.992 9.992 0 1.763.461 3.484 1.336 5.002L2 22l5.137-1.348a9.956 9.956 0 0 0 4.894 1.281h.004c5.515 0 9.992-4.477 9.992-9.992A9.992 9.992 0 0 0 12.031 2zm0 18.234h-.003a8.294 8.294 0 0 1-4.229-1.158l-.303-.18-3.048.8.814-2.972-.198-.314a8.268 8.268 0 0 1-1.269-4.418c0-4.573 3.72-8.293 8.297-8.293 2.216 0 4.299.864 5.865 2.431a8.241 8.241 0 0 1 2.429 5.865c-.002 4.573-3.723 8.239-8.355 8.239zm4.549-6.212c-.25-.125-1.476-.729-1.705-.812-.229-.083-.395-.125-.562.125-.166.25-.645.812-.791.979-.146.166-.291.187-.541.062-.25-.125-1.055-.389-2.01-1.24-.743-.662-1.245-1.481-1.391-1.731-.146-.25-.016-.385.11-.51.112-.112.25-.291.375-.437.125-.146.166-.25.25-.416.083-.166.042-.312-.021-.437-.062-.125-.562-1.354-.77-1.854-.203-.487-.41-.421-.562-.429l-.479-.008c-.166 0-.437.062-.666.312-.229.25-.874.854-.874 2.083s.895 2.416 1.02 2.583c.125.166 1.762 2.691 4.269 3.773.596.257 1.062.411 1.425.526.599.19 1.144.163 1.575.099.48-.072 1.476-.604 1.684-1.187.208-.583.208-1.083.146-1.187-.062-.104-.229-.166-.479-.291z" />
    </svg>
  )
}

function FieldLabel({ name, optional, children }: { name: FieldName; optional?: boolean; children: string }) {
  return (
    <label htmlFor={name}>
      {children}{' '}
      {optional
        ? <span className="field-optional">(optional)</span>
        : <span className="required-star" aria-hidden="true">*</span>}
    </label>
  )
}

function FieldError({ name, errors }: { name: FieldName; errors: FieldErrors }) {
  return errors[name] ? <p id={`${name}-error`} className="field-error">{errors[name]}</p> : null
}

function DocumentField({ name, label, help, file, errors, onChange }: { name: FileField; label: string; help?: string; file: File | null; errors: FieldErrors; onChange: (file: File | null) => void }) {
  const describedBy = [help ? `${name}-help` : '', errors[name] ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="form-field">
      <FieldLabel name={name} optional>{label}</FieldLabel>
      {help && <p className="field-help" id={`${name}-help`}>{help}</p>}
      <div className={`document-input ${errors[name] ? 'has-error' : ''}`}>
        <Upload size={18} strokeWidth={1.5} aria-hidden="true" />
        <span className="document-caption"><strong>{file?.name || 'Choose a file'}</strong></span>
        <span className="document-browse">{file ? 'Replace' : 'Browse'}</span>
        <input type="file" id={name} name={name} accept={FILE_ACCEPT} aria-invalid={Boolean(errors[name])} aria-describedby={describedBy} onChange={event => onChange(event.target.files?.[0] || null)} />
      </div>
      <FieldError name={name} errors={errors} />
    </div>
  )
}

function PaymentNotice() {
  return (
    <section className="payment-notice" aria-labelledby="payment-notice-title">
      <div className="micro-label">REGISTRATION FEES &amp; PAYMENT</div>
      <h3 id="payment-notice-title">Notice</h3>
      <dl className="fee-list">
        <div><dt>For Students of Government Universities &amp; Colleges:</dt><dd>Rs. 4,310/-</dd></div>
        <div><dt>For Students of Private Universities &amp; Colleges:</dt><dd>Rs. 4,870/-</dd></div>
      </dl>
      <p>Payment will be confirmed by the company within <strong>48 working hours</strong>, followed by a confirmation email.</p>
      <p>Any form of fake or fraudulent payment proof will not be accepted.</p>
      <p>Please transfer your payment to the following account:</p>
      <div className="bank-account">
        <h4><Landmark size={17} strokeWidth={1.5} />Faysal Bank Limited</h4>
        <dl>
          <div><dt>Account Title</dt><dd>FIRST NOBLE STEP (PRIVATE) LIMITED</dd></div>
          <div><dt>Account Number</dt><dd className="account-digits">3291499000005525</dd></div>
          <div><dt>IBAN</dt><dd className="account-digits">PK03FAYS3291499000005525</dd></div>
        </dl>
      </div>
    </section>
  )
}

export function InquiryForm({ onSaved, onGenerated }: { onSaved: () => void; onGenerated: (inquiry: Inquiry) => void }) {
  const [step, setStep] = useState<'form' | 'notice'>('form')
  const [values, setValues] = useState<FormValues>({ ...emptyForm })
  const [savedInquiry, setSavedInquiry] = useState<Inquiry | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [storageError, setStorageError] = useState('')
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const noticeHeadingRef = useRef<HTMLHeadingElement>(null)
  const categorySelectRef = useRef<HTMLSelectElement>(null)
  const busy = useRef(false)

  useEffect(() => {
    if (step === 'notice') {
      noticeHeadingRef.current?.focus({ preventScroll: true })
      noticeHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    let nextSemester = values.semester
    if (field === 'degree') {
      const prevLevel = academicLevelOptions(values.degree)
      const nextLevel = academicLevelOptions(String(value))
      if (nextLevel.kind === 'none') {
        nextSemester = ''
      } else if (nextLevel.kind === 'custom') {
        if (prevLevel.kind !== 'custom') nextSemester = ''
      } else if (!nextLevel.options.includes(values.semester)) {
        nextSemester = ''
      }
    }
    const next = {
      ...values,
      [field]: value,
      ...(field === 'degree' ? { semester: nextSemester } : {}),
    }
    setValues(next)
    if (errors[field] || field === 'universityCard' || (field === 'degree' && (errors.semester || errors.universityCard))) {
      const checked = validate(next, { requireCategory: step === 'notice' })
      setErrors(previous => ({
        ...previous,
        [field]: checked[field],
        ...(field === 'degree' ? { semester: nextSemester ? checked.semester : undefined, universityCard: errors.universityCard ? checked.universityCard : previous.universityCard } : {}),
      }))
    }
    if (storageError) setStorageError('')
  }
  function onBlur(field: TextField) {
    if (values[field].trim()) setErrors(previous => ({ ...previous, [field]: validate(values, { requireCategory: step === 'notice' })[field] }))
  }
  function fieldProps(name: TextField) {
    return {
      id: name, name, required: true, value: values[name],
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
      onBlur: () => onBlur(name),
    }
  }
  async function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const nextErrors = validate(values, { requireCategory: false })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    try {
      busy.current = true
      setSaving(true)
      const saved = await saveInquiry(values, savedInquiry ?? undefined, 'submitted')
      setSavedInquiry(saved)
      setStorageError('')
      onSaved()
      void syncInquiryToSheet(saved, 'Form Submitted')
      setStep('notice')
    } catch {
      setStorageError('Your registration could not be saved. Please allow site storage or free some space, then try again. Your details and selected document are still here.')
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const categoryError = validate(values, { requireCategory: true }).institutionCategory
    if (categoryError) {
      setErrors(previous => ({ ...previous, institutionCategory: categoryError }))
      categorySelectRef.current?.focus()
      return
    }
    try {
      busy.current = true
      setSaving(true)
      const confirmed = await saveInquiry(values, savedInquiry ?? undefined, 'confirmed')
      setSavedInquiry(confirmed)
      setStorageError('')
      void syncInquiryToSheet(confirmed, 'Challan Generated')
      onGenerated(confirmed)
    } catch {
      if (savedInquiry) {
        const fallback = { ...savedInquiry, institutionCategory: values.institutionCategory as InstitutionCategory, status: 'confirmed' as const }
        void syncInquiryToSheet(fallback, 'Challan Generated')
        onGenerated(fallback)
      } else {
        setStorageError('Could not confirm your registration. Please try again.')
      }
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  if (step === 'notice') {
    return (
      <section className="form-card" id="inquiry-form" aria-labelledby="notice-step-heading" tabIndex={-1}>
        <div className="form-heading">
          <div className="form-title-row">
            <h2 id="notice-step-heading" ref={noticeHeadingRef} tabIndex={-1}>Fee &amp; payment notice</h2>
          </div>
          <p>Review the fee notice, select your university or college category, and confirm to generate your challan.</p>
        </div>
        <PaymentNotice />
        <form noValidate onSubmit={handleConfirm}>
          <div className="form-field step-category-field">
            <FieldLabel name="institutionCategory">University / college category</FieldLabel>
            <div className={`input-wrap ${errors.institutionCategory ? 'has-error' : ''}`}>
              <select
                ref={categorySelectRef}
                {...fieldProps('institutionCategory')}
                disabled={saving}
                onChange={event => update('institutionCategory', event.target.value as '' | InstitutionCategory)}
              >
                <option value="" disabled>Select university / college category</option>
                {institutionCategories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </div>
            <FieldError name="institutionCategory" errors={errors} />
          </div>
          {storageError && <div className="storage-error" role="alert">{storageError}</div>}
          <button className="primary-button submit-button" type="submit" disabled={saving}>
            <span><Check size={16} strokeWidth={1.8} />{saving ? 'Generating challan…' : 'Confirm & Generate Challan'}</span>
            <ArrowRight size={19} strokeWidth={1.7} />
          </button>
        </form>
        <button className="new-inquiry-button" type="button" disabled={saving} onClick={() => setStep('form')}>
          <ArrowLeft size={15} />Back to edit details
        </button>
      </section>
    )
  }

  const isIntermediate = values.degree === 'Intermediate'
  const level = academicLevelOptions(values.degree)

  return (
    <section className="form-card" id="inquiry-form" aria-labelledby="form-heading" tabIndex={-1}>
      <div className="form-heading">
        <div className="form-title-row"><h2 id="form-heading">Registration form</h2></div>
        <p>Enter your contact and academic details below.</p>
      </div>
      <form ref={formRef} noValidate onSubmit={handleContinue} aria-describedby="required-note">
        <fieldset className="form-fields" disabled={saving}>
          <legend className="sr-only">Student registration details</legend>
          <div className="form-field">
            <FieldLabel name="name">Full name</FieldLabel>
            <div className={`input-wrap ${errors.name ? 'has-error' : ''}`}>
              <UserRound size={18} strokeWidth={1.55} />
              <input {...fieldProps('name')} type="text" autoComplete="name" maxLength={100} placeholder="Your full name" onChange={event => update('name', event.target.value)} />
            </div>
            <FieldError name="name" errors={errors} />
          </div>
          <div className="form-field">
            <FieldLabel name="email">Email address</FieldLabel>
            <div className={`input-wrap ${errors.email ? 'has-error' : ''}`}>
              <Mail size={18} strokeWidth={1.55} />
              <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" spellCheck={false} autoCapitalize="none" onChange={event => update('email', event.target.value)} />
            </div>
            <FieldError name="email" errors={errors} />
          </div>
          <div className="form-field">
            <FieldLabel name="phone">WhatsApp number</FieldLabel>
            <div className={`input-wrap ${errors.phone ? 'has-error' : ''}`}>
              <WhatsAppIcon />
              <input {...fieldProps('phone')} type="tel" autoComplete="tel" inputMode="tel" maxLength={30} placeholder="Enter WhatsApp number" onChange={event => update('phone', event.target.value)} />
            </div>
            <FieldError name="phone" errors={errors} />
          </div>
          <div className="form-field">
            <FieldLabel name="address">Correspondence address</FieldLabel>
            <p className="field-help" id="address-hint">For certificate and experience letter dispatch.</p>
            <div className={`textarea-wrap ${errors.address ? 'has-error' : ''}`}>
              <textarea {...fieldProps('address')} aria-describedby={`address-hint${errors.address ? ' address-error' : ''}`} autoComplete="street-address" maxLength={2000} placeholder="House / street, area, city and postal code" rows={2} onChange={event => update('address', event.target.value)} />
            </div>
            <FieldError name="address" errors={errors} />
          </div>
          <div className="form-field">
            <FieldLabel name="university">University / college name</FieldLabel>
            <div className={`input-wrap ${errors.university ? 'has-error' : ''}`}>
              <GraduationCap size={18} strokeWidth={1.55} />
              <input {...fieldProps('university')} type="text" autoComplete="organization" maxLength={200} placeholder="Your university or college name" onChange={event => update('university', event.target.value)} />
            </div>
            <FieldError name="university" errors={errors} />
          </div>
          <div className={level.kind === 'none' ? 'academic-row academic-row-single' : 'academic-row'}>
            <div className="form-field">
              <FieldLabel name="degree">Degree program</FieldLabel>
              <div className={`input-wrap ${errors.degree ? 'has-error' : ''}`}>
                <select {...fieldProps('degree')} onChange={event => update('degree', event.target.value)}>
                  <option value="" disabled>Select degree program</option>
                  {degreePrograms.map(program => <option key={program} value={program}>{program}</option>)}
                </select>
              </div>
              <FieldError name="degree" errors={errors} />
            </div>
            {level.kind === 'custom' && (
              <div className="form-field">
                <FieldLabel name="semester">Semester / year</FieldLabel>
                <div className={`input-wrap ${errors.semester ? 'has-error' : ''}`}>
                  <input {...fieldProps('semester')} type="text" maxLength={60} placeholder="e.g., Semester 2, Year 1, Diploma" onChange={event => update('semester', event.target.value)} />
                </div>
                <FieldError name="semester" errors={errors} />
              </div>
            )}
            {(level.kind === 'semester' || level.kind === 'year') && (
              <div className="form-field">
                <FieldLabel name="semester">{level.kind === 'year' ? 'Current year' : 'Current semester'}</FieldLabel>
                <div className={`input-wrap ${errors.semester ? 'has-error' : ''}`}>
                  <select {...fieldProps('semester')} onChange={event => update('semester', event.target.value)}>
                    <option value="" disabled>{level.kind === 'year' ? 'Select year' : 'Select semester'}</option>
                    {level.options.map(option => (
                      <option key={option} value={option}>
                        {level.kind === 'year' ? option : `Semester ${option}`}
                      </option>
                    ))}
                  </select>
                </div>
                <FieldError name="semester" errors={errors} />
              </div>
            )}
          </div>
          <DocumentField
            name="universityCard"
            label={isIntermediate ? 'Upload college / high school card' : 'Upload university card'}
            help="If you don’t have a card, upload your CNIC or Intermediate certificate."
            file={values.universityCard}
            errors={errors}
            onChange={file => update('universityCard', file)}
          />
        </fieldset>
        {storageError && <div className="storage-error" role="alert">{storageError}</div>}
        <button className="primary-button submit-button" type="submit" disabled={saving}><span><Send size={16} strokeWidth={1.65} />{saving ? 'Saving…' : 'Continue'}</span><ArrowRight size={19} strokeWidth={1.7} /></button>
      </form>
      <span className="sr-only" id="required-note">Fields marked with * are required. Uploading a student card is optional.</span>
    </section>
  )
}
