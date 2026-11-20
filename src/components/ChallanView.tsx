import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { buildChallan, fitChallanText } from '../lib/challan'
import { downloadChallanPdf } from '../lib/challanPdf'
import type { Inquiry } from '../lib/inquiries'

export function ChallanView({ inquiry }: { inquiry: Inquiry }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [savingPdf, setSavingPdf] = useState(false)
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

  async function handleSavePdf() {
    const svg = sheetRef.current?.querySelector('svg')
    if (!svg || savingPdf) return
    try {
      setSavingPdf(true)
      await downloadChallanPdf(svg, challan.title)
    } catch {
      handlePrint()
    } finally {
      setSavingPdf(false)
    }
  }

  return (
    <section className="challan-view" id="challan-view" aria-labelledby="challan-title">
      <div className="challan-bar no-print">
        <div>
          <h2 id="challan-title" ref={headingRef} tabIndex={-1}>Your fee challan, {inquiry.name.split(/\s+/)[0]}.</h2>
        </div>
        <div className="challan-actions">
          <button type="button" className="primary-button" onClick={handlePrint}><Printer size={16} />Print</button>
          <button type="button" className="archive-button" disabled={savingPdf} onClick={handleSavePdf}>
            <Download size={15} />{savingPdf ? 'Saving PDF…' : 'Save as PDF'}
          </button>
        </div>
      </div>

      <div ref={sheetRef} className="challan-sheet" dangerouslySetInnerHTML={{ __html: challan.svg }} />
    </section>
  )
}
