import { useState } from 'react'
import { ChallanView } from './components/ChallanView'
import { InquiryForm } from './components/InquiryForm'
import type { Inquiry } from './lib/inquiries'
import './App.css'

function App() {
  const [activeChallan, setActiveChallan] = useState<Inquiry | null>(null)

  return (
    <div className="app-shell">
      <a className="skip-link no-print" href={activeChallan ? '#challan-view' : '#inquiry-form'}>Skip to {activeChallan ? 'fee challan' : 'registration form'}</a>
      <header className="site-header no-print">
        <div className="page-width header-inner">
          <div className="wordmark" aria-label="FIRST NOBLE STEP">
            <img src="/images/fieldwork-mark.png" alt="FIRST NOBLE STEP" width="32" height="44" />
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
              onSaved={() => {}}
              onGenerated={inquiry => setActiveChallan(inquiry)}
            />
          </div>
        )}
      </main>

      <footer className="site-footer page-width no-print">
        <span className="copyright">© {new Date().getFullYear()} FIRST NOBLE STEP</span>
        <div className="footer-signature" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
      </footer>
    </div>
  )
}

export default App
