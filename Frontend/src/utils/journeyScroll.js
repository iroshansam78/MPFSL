import Lenis from 'lenis'

/*
 * Shared scroll state for the 3D journey.
 *
 * journeyScroll.progress  0 → 1 while scrolling through #journey (read every frame by the camera rig)
 * journeyScroll.zone      'journey' | 'content' | 'deep' (also mirrored to <body data-zone>)
 */
export const journeyScroll = { progress: 0, zone: 'journey' }

const HEADER_OFFSET = 72
const zoneListeners = new Set()
let lenis = null

export const getLenis = () => lenis

export function onZoneChange(listener) {
  zoneListeners.add(listener)
  return () => zoneListeners.delete(listener)
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function updateScrollState() {
  const journey = document.getElementById('journey')
  if (!journey) return

  const scrollable = Math.max(1, journey.offsetHeight - window.innerHeight)
  const y = window.scrollY
  journeyScroll.progress = Math.min(1, Math.max(0, y / scrollable))

  const vh = window.innerHeight
  let zone = 'deep'
  if (y < journey.offsetHeight - vh * 0.35) zone = 'journey'
  else if (y < journey.offsetHeight + vh * 0.8) zone = 'content'

  if (zone !== journeyScroll.zone) {
    journeyScroll.zone = zone
    document.body.dataset.zone = zone
    zoneListeners.forEach((listener) => listener(zone))
  }
}

// Smooth-scroll anchor links (#about, #top…) through Lenis, offset for the fixed header.
function handleAnchorClick(event) {
  const link = event.target.closest('a[href^="#"]')
  if (!link) return

  const hash = link.getAttribute('href')
  const target = hash === '#top' ? 0 : document.querySelector(hash)
  if (target === null) return

  event.preventDefault()
  if (lenis) {
    lenis.scrollTo(target, { offset: -HEADER_OFFSET, duration: 1.4 })
  } else {
    window.scrollTo({ top: target === 0 ? 0 : target.offsetTop - HEADER_OFFSET, behavior: 'auto' })
  }
  history.replaceState(null, '', hash)
}

// Starts Lenis (unless reduced motion is on) and scroll tracking. Returns a cleanup function.
export function startJourneyScroll() {
  let frame = 0

  if (!prefersReducedMotion()) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    lenis.on('scroll', updateScrollState)
  }

  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)
  document.addEventListener('click', handleAnchorClick)
  updateScrollState()

  return () => {
    cancelAnimationFrame(frame)
    lenis?.destroy()
    lenis = null
    window.removeEventListener('scroll', updateScrollState)
    window.removeEventListener('resize', updateScrollState)
    document.removeEventListener('click', handleAnchorClick)
  }
}
