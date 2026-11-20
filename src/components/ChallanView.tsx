import { useEffect, useMemo, useRef } from 'react'
import { Download, Printer, RotateCcw } from 'lucide-react'
import { buildChallan, fitChallanText } from '../lib/challan'
import { downloadInquiry } from '../lib/inquiries'
import type { Inquiry } from '../lib/inquiries'

export function ChallanView({ inquiry, onAnother }: { inquiry: Inquiry; onAnother: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const challan = useMemo(() => buildChallan(inquiry), [inquiry])

  useEffect(() => {
    fitChallanText(sheetRef.current)
    headingRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [challan.svg])

  function handlePrint() {
    const previousTitle = document.title
    document.title = challan.title
    const restore = () => {
      document.title = previousTitle
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
  }

  return (
    <section className="challan-view" id="challan-view" aria-labelledby="challan-title">
      <div className="challan-bar no-print">
        <div>
          <div className="micro-label">FIRST NOBLE STEP / FEE CHALLAN</div>
          <h2 id="challan-title" ref={headingRef} tabIndex={-1}>Your fee challan, {inquiry.name.split(/\s+/)[0]}.</h2>
          <p className="challan-meta">
            <span>{inquiry.reference}</span>
            <i>·</i>
            <span>Rs. {challan.fee}</span>
            <i>·</i>
            <span>Issued {challan.issue}</span>
            <i>·</i>
            <span>Valid till {challan.valid}</span>
          </p>
        </div>
        <div className="challan-actions">
          <button type="button" className="primary-button" onClick={handlePrint}><Printer size={16} />Print / Save as PDF</button>
          <button type="button" className="archive-button" onClick={() => downloadInquiry(inquiry)}><Download size={15} />Download copy</button>
          <button type="button" className="archive-button" onClick={onAnother}><RotateCcw size={15} />New registration</button>
        </div>
      </div>

      <div ref={sheetRef} className="challan-sheet" dangerouslySetInnerHTML={{ __html: challan.svg }} />

      <p className="challan-tip no-print">
        Three copies on one A4 landscape page (Bank, Student, and Company). In the print dialog, choose “Save as PDF”, paper A4, landscape, margins “None”, and keep “Background graphics” on.
      </p>
    </section>
  )
}
