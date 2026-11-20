import { Crosshair } from 'lucide-react'

function ContourLines() {
  const paths = Array.from({ length: 19 }, (_, index) => {
    const r = 30 + index * 13
    return Array.from({ length: 151 }, (_, point) => {
      const theta = point / 150 * Math.PI * 2
      const wave = 1 + .105 * Math.sin(theta * 3 + .5) + .055 * Math.cos(theta * 5 - .9) + .025 * Math.sin(theta * 8)
      const x = 490 + Math.cos(theta) * r * wave * 1.12
      const y = -24 + Math.sin(theta) * r * wave * .94
      return `${point === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ') + 'Z'
  })
  return (
    <svg className="contour-art" viewBox="0 0 500 330" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth=".78">{paths.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  )
}

export function FieldPoster() {
  return (
    <section className="field-poster" aria-labelledby="contact-heading">
      <ContourLines />
      <div className="poster-copy">
        <div className="poster-eyebrow"><span className="eyebrow-line" />STUDENT REGISTRATION</div>
        <h1 id="contact-heading" className="poster-banner">
          <img
            src="/images/registration-poster.jpeg"
            alt="Introducing Corporate E-Training Program — First Noble Step"
            width="1600"
            height="400"
            fetchPriority="high"
          />
        </h1>
        <p>Complete your details to review the fee notice<br className="desktop-break" /> and generate your challan.</p>
      </div>
      <div className="poster-art">
        <img src="/images/alpine-field-print.webp" alt="An engraved alpine landscape with pine forests, a winding river, and a golden sun." width="1200" height="800" fetchPriority="high" />
      </div>
      <div className="poster-foot">
        <span><Crosshair size={15} strokeWidth={1.35} /> FIELD SERIES</span>
        <span>FIG. 01 — ALPINE</span>
      </div>
    </section>
  )
}
