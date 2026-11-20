import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { ChallanView } from './components/ChallanView'
import { InquiryForm } from './components/InquiryForm'
import { InquiryArchive } from './components/InquiryArchive'
import { Modal } from './components/Modal'
import { STORAGE_KEY, readInquiries } from './lib/inquiries'
import type { Inquiry } from './lib/inquiries'
import './App.css'

function App() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [dialog, setDialog] = useState<'archive' | 'privacy' | null>(null)
  const [activeChallan, setActiveChallan] = useState<Inquiry | null>(null)
  const refresh = useCallback(() => { void readInquiries().then(setInquiries) }, [])

  useEffect(() => {
    refresh()
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) refresh()
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [refresh])

  return (
    <div className="app-shell">
      <a className="skip-link no-print" href={activeChallan ? '#challan-view' : '#inquiry-form'}>Skip to {activeChallan ? 'fee challan' : 'registration form'}</a>
      <header className="site-header no-print">
        <div className="page-width header-inner">
          <div className="brand-group">
            <div className="wordmark" aria-label="FIRST NOBLE STEP">
              <img src="/images/fieldwork-mark.png" alt="" width="29" height="40" />
              <span>FIRST NOBLE STEP</span>
            </div>
            <span className="brand-divider" aria-hidden="true" />
            <span className="header-caption">Registration desk</span>
          </div>
          <div className="header-actions">
            <span className="desk-status"><span className="status-dot" />Registration open</span>
          </div>
        </div>
      </header>

      <main className="page-width main-content">
        {activeChallan ? (
          <ChallanView inquiry={activeChallan} />
        ) : (
          <div className="contact-layout">
            <div className="form-banner">
              <img
                src="/images/registration-poster.jpeg"
                alt="Introducing Corporate E-Training Program — First Noble Step"
                width="1600"
                height="400"
                fetchPriority="high"
              />
            </div>
            <InquiryForm
              onSaved={refresh}
              onGenerated={inquiry => { refresh(); setActiveChallan(inquiry) }}
            />
          </div>
        )}
      </main>

      <footer className="site-footer page-width no-print">
        <span className="copyright">© {new Date().getFullYear()} FIRST NOBLE STEP</span>
        <div className="footer-signature" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <button className="privacy-link" onClick={() => setDialog('privacy')}>
          Privacy note <ArrowUpRight size={14} strokeWidth={1.7} />
        </button>
      </footer>

      {dialog === 'archive' && (
        <InquiryArchive
          inquiries={inquiries}
          onChange={refresh}
          onViewChallan={inquiry => { setActiveChallan(inquiry); setDialog(null) }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'privacy' && (
        <Modal title="Privacy note" eyebrow="FIRST NOBLE STEP / YOUR INFORMATION" onClose={() => setDialog(null)}>
          <div className="privacy-content">
            <div className="dialog-symbol"><ShieldCheck size={26} strokeWidth={1.5} /></div>
            <h3>Your details stay with you.</h3>
            <p>Your registration and university card are saved in this browser, on this device. This form does not send them to the company, verify payments, or send confirmation emails.</p>
            <h4>You’re in control</h4>
            <p>Open <button type="button" className="font-semibold underline underline-offset-2" onClick={() => setDialog('archive')}>My registrations</button> to review your details, download your record and documents, or remove a registration. Removing it also deletes its saved attachments.</p>
            <div className="privacy-tip">On a shared device, remove your registration when you’re finished. Clearing site data or leaving a private browsing session can also remove saved registrations.</div>
            <button className="primary-button" onClick={() => setDialog(null)}>Got it <ArrowUpRight size={17} /></button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default App
