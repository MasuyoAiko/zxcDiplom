import { createPortal } from 'react-dom'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

/**
 * Подсказка рендерится в document.body с position:fixed и высоким z-index,
 * чтобы не перекрывалась карточками и графиками.
 */
export function ExplainHint({ title, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const popRef = useRef(null)
  const [box, setBox] = useState({ top: 0, left: 0, width: 360, placement: 'below' })
  const headingId = useId()

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return undefined

    const update = () => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const margin = 8
      const width = Math.min(420, vw - margin * 2)
      let left =
        align === 'right' ? rect.right - width : rect.left
      left = Math.max(margin, Math.min(left, vw - width - margin))
      const gap = 8
      const belowTop = rect.bottom + gap
      const spaceBelow = window.innerHeight - rect.bottom
      const preferBelow = spaceBelow > 100
      const placement = preferBelow ? 'below' : 'above'
      let top = preferBelow ? belowTop : rect.top - gap - 280
      if (top < margin) top = margin
      setBox({ top, left, width, placement })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, align])

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      const t = e.target
      if (wrapRef.current?.contains(t)) return
      if (popRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const popover =
    open &&
    createPortal(
      <div
        ref={popRef}
        className="explain-popover explain-popover-portal animate-pop"
        id={headingId}
        role="dialog"
        aria-label={title}
        style={{
          position: 'fixed',
          top: box.top,
          left: box.left,
          width: box.width,
          zIndex: 2147483000,
          maxHeight: 'min(70vh, 420px)',
          overflowY: 'auto',
        }}
      >
        <p className="explain-popover-title">{title}</p>
        <div className="explain-popover-body">{children}</div>
      </div>,
      document.body,
    )

  return (
    <>
      <span className={`explain-wrap explain-wrap--${align}`} ref={wrapRef}>
        <button
          type="button"
          className="explain-btn"
          aria-expanded={open}
          aria-controls={headingId}
          onClick={() => setOpen((v) => !v)}
          title={title}
        >
          <span className="explain-icon" aria-hidden>
            !
          </span>
        </button>
      </span>
      {popover}
    </>
  )
}
