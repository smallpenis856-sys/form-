import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, Download, FileText, Inbox, Plus, Trash2 } from 'lucide-react'
import { downloadFile, downloadInquiry, formatDate, registrationDetails, removeInquiry } from '../lib/inquiries'
import type { Inquiry } from '../lib/inquiries'
import { Modal } from './Modal'

type ArchiveProps = { inquiries: Inquiry[]; onChange: () => void; onViewChallan: (inquiry: Inquiry) => void; onClose: () => void }

export function InquiryArchive({ inquiries, onChange, onViewChallan, onClose }: ArchiveProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  async function remove(id: string) {
    try {
      await removeInquiry(id)
      setExpanded(null)
      setConfirmDelete(null)
      setMessage('Registration and documents removed from this device.')
      onChange()
    } catch {
      setMessage('Could not remove this registration. Please check your browser’s site storage settings.')
    }
  }
  return (
    <Modal title="My registrations" eyebrow="FIRST NOBLE STEP / PERSONAL ARCHIVE" onClose={onClose}>
      <div className="archive-content">
        {message && <div className="archive-notice" role="status"><Check size={14} />{message}</div>}
        {inquiries.length === 0 ? (
          <div className="archive-empty">
            <div className="empty-illustration"><Inbox size={35} strokeWidth={1.2} /><span><Plus size={11} /></span></div>
            <h3>A fresh page.</h3>
            <p>No registrations saved yet. Complete the registration form to keep your record and documents here.</p>
            <button className="primary-button" onClick={onClose}>Back to the form <ArrowRight size={16} /></button>
          </div>
        ) : (
          <>
            <div className="archive-summary"><span>{inquiries.length} saved {inquiries.length === 1 ? 'registration' : 'registrations'}</span><span className="local-badge"><i />On this device</span></div>
            <div className="archive-list">{inquiries.map(inquiry => (
              <article key={inquiry.id} className={`archive-entry ${expanded === inquiry.id ? 'is-expanded' : ''}`}>
                <button className="entry-toggle" aria-expanded={expanded === inquiry.id} aria-controls={`record-${inquiry.id}`} onClick={() => { setExpanded(expanded === inquiry.id ? null : inquiry.id); setConfirmDelete(null); setMessage('') }}>
                  <span className="entry-text"><span className="entry-meta">{inquiry.reference} <i>·</i> {formatDate(inquiry.createdAt)}</span><strong>{inquiry.name}</strong><span className="entry-preview">{inquiry.degree} · {inquiry.university}</span></span>
                  <ChevronDown size={18} />
                </button>
                {expanded === inquiry.id && <div className="entry-detail" id={`record-${inquiry.id}`}>
                  <dl>{registrationDetails(inquiry).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                  <div className="saved-documents">
                    <button className="small-button" onClick={() => downloadFile(inquiry.universityCard, inquiry.universityCard.name)}><Download size={14} />University card</button>
                    {inquiry.paymentProof && <button className="small-button" onClick={() => downloadFile(inquiry.paymentProof!, inquiry.paymentProof!.name)}><Download size={14} />Payment proof</button>}
                  </div>
                  {confirmDelete === inquiry.id ? <div className="delete-confirmation"><p>Remove this registration and its saved documents from this device? This can’t be undone.</p><div><button type="button" className="small-button" onClick={() => setConfirmDelete(null)}>Keep registration</button><button type="button" className="small-button danger-button" onClick={() => remove(inquiry.id)}>Remove registration</button></div></div> :
                    <div className="entry-actions"><div className="entry-actions-left">{inquiry.institutionCategory && <button type="button" className="small-button" onClick={() => onViewChallan(inquiry)}><FileText size={14} />View challan</button>}<button type="button" className="small-button" onClick={() => downloadInquiry(inquiry)}><Download size={14} />Download</button></div><button type="button" className="remove-button" onClick={() => setConfirmDelete(inquiry.id)}><Trash2 size={14} />Remove</button></div>}
                </div>}
              </article>
            ))}</div>
            <p className="archive-footnote">Saved in this browser. Download a copy to keep a separate record.</p>
          </>
        )}
      </div>
    </Modal>
  )
}
