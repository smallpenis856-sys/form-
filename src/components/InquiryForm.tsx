import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, GraduationCap, Landmark, Mail, Send, Upload, UserRound } from 'lucide-react'
import { academicLevelOptions, degreePrograms, emptyForm, FILE_ACCEPT, institutionCategories, saveInquiry, validate } from '../lib/inquiries'
import type { FieldErrors, FieldName, FileField, FormValues, Inquiry, InstitutionCategory, TextField } from '../lib/inquiries'
import { syncInquiryToSheet } from '../lib/sheets'

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  )
}

function FieldLabel({ name, children }: { name: FieldName; children: string }) {
  return <label htmlFor={name}>{children} <span className="required-star" aria-hidden="true">*</span></label>
}

function FieldError({ name, errors }: { name: FieldName; errors: FieldErrors }) {
  return errors[name] ? <p id={`${name}-error`} className="field-error">{errors[name]}</p> : null
}

function DocumentField({ name, label, help, file, errors, onChange }: { name: FileField; label: string; help?: string; file: File | null; errors: FieldErrors; onChange: (file: File | null) => void }) {
  const describedBy = [help ? `${name}-help` : '', errors[name] ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="form-field">
      <FieldLabel name={name}>{label}</FieldLabel>
      {help && <p className="field-help" id={`${name}-help`}>{help}</p>}
      <div className={`document-input ${errors[name] ? 'has-error' : ''}`}>
        <Upload size={18} strokeWidth={1.5} aria-hidden="true" />
        <span className="document-caption"><strong>{file?.name || 'Choose a file'}</strong></span>
        <span className="document-browse">{file ? 'Replace' : 'Browse'}</span>
        <input type="file" id={name} name={name} required accept={FILE_ACCEPT} aria-invalid={Boolean(errors[name])} aria-describedby={describedBy} onChange={event => onChange(event.target.files?.[0] || null)} />
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
        <div><dt>For Students of Public Universities &amp; Colleges:</dt><dd>Rs. 4,310/-</dd></div>
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
      const nextLevel = academicLevelOptions(String(value))
      if (!nextLevel.options.includes(values.semester)) nextSemester = ''
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
            <span className="form-number"><span className="tiny-cross">+</span> STEP 02</span>
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
        <div className="form-title-row"><h2 id="form-heading">Registration form</h2><span className="form-number"><span className="tiny-cross">+</span> STEP 01</span></div>
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
            {level.kind !== 'none' && (
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
      <span className="sr-only" id="required-note">All fields are required. Attach your student card, CNIC, or Intermediate certificate to continue.</span>
    </section>
  )
}
