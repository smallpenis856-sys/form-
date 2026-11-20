import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = { title: string; eyebrow: string; onClose: () => void; children: ReactNode }

export function Modal({ title, eyebrow, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = overflow
      previous?.focus({ preventScroll: true })
    }
  }, [])
  return (
    <dialog ref={ref} className="modal" aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal-inner">
        <div className="modal-heading">
          <div><div className="micro-label">{eyebrow}</div><h2 id={titleId}>{title}</h2></div>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
