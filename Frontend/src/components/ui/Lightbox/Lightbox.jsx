import { useEffect, useRef, useState } from 'react'
import { getLenis } from '../../../utils/journeyScroll.js'
import SafeImage from '../SafeImage/SafeImage.jsx'
import './Lightbox.css'

// Full-screen photo viewer. Locks scrolling while open; Esc closes, ← / → browse.
function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index)
  const closeButton = useRef()
  const count = images.length
  const step = (delta) => setCurrent((i) => (i + delta + count) % count)

  useEffect(() => {
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.classList.add('locked')
    const previouslyFocused = document.activeElement
    closeButton.current?.focus()

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') setCurrent((i) => (i + 1) % count)
      if (event.key === 'ArrowLeft') setCurrent((i) => (i - 1 + count) % count)
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.documentElement.classList.remove('locked')
      lenis?.start()
      previouslyFocused?.focus?.()
    }
  }, [count, onClose])

  const image = images[current]

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <figure onClick={(event) => event.stopPropagation()}>
        <SafeImage key={image.src} src={image.src} alt={image.alt} loading="eager" />
        <figcaption>
          {image.alt}
          {count > 1 && (
            <span className="count">
              {current + 1} / {count}
            </span>
          )}
        </figcaption>
      </figure>

      <button ref={closeButton} className="lb-btn lb-close" type="button" onClick={onClose} aria-label="Close">
        ×
      </button>
      {count > 1 && (
        <>
          <button
            className="lb-btn lb-prev"
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              step(-1)
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            className="lb-btn lb-next"
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              step(1)
            }}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

export default Lightbox
