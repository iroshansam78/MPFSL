import Lenis from 'lenis'

const HEADER_OFFSET = 72
let lenis = null

// The active Lenis instance (null when reduced motion is on). The lightbox uses it to pause scrolling.
export const getLenis = () => lenis

// Adds body.scrolled once the visitor is past most of the hero (the header turns solid).
function updateScrolledClass() {
  document.body.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.6)
}

// Smooth-scroll anchor links (#about, #top…) with an offset for the fixed header.
function handleAnchorClick(event) {
  const link = event.target.closest('a[href^="#"]')
  if (!link) return

  const hash = link.getAttribute('href')
  const target = hash === '#top' ? 0 : document.querySelector(hash)
  if (target === null) return

  event.preventDefault()
  if (lenis) {
    lenis.scrollTo(target, { offset: -HEADER_OFFSET, duration: 1.2 })
  } else {
    window.scrollTo({ top: target === 0 ? 0 : target.offsetTop - HEADER_OFFSET })
  }
  history.replaceState(null, '', hash)
}

// Starts Lenis (unless reduced motion is on) and the scroll listeners. Returns a cleanup function.
export function startSmoothScroll() {
  let frame = 0

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
    const raf = (time) => {
      lenis?.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
  }

  window.addEventListener('scroll', updateScrolledClass, { passive: true })
  document.addEventListener('click', handleAnchorClick)
  updateScrolledClass()

  return () => {
    cancelAnimationFrame(frame)
    lenis?.destroy()
    lenis = null
    window.removeEventListener('scroll', updateScrolledClass)
    document.removeEventListener('click', handleAnchorClick)
  }
}
