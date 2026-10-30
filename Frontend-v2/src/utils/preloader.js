/*
 * The preloader is plain HTML + CSS in index.html, so it shows before any JavaScript arrives.
 * hidePreloader() lifts it once the page behind it is worth seeing:
 *   - the fonts the page uses have loaded, and everything in `waitFor` has settled (failures count
 *     too — a missing photo mustn't block the site)
 *   - it has been on screen at least MIN_MS on a first visit, so the animation doesn't just flash
 *     (repeat visits in the same session skip the minimum)
 *   - but never longer than MAX_MS after the app starts, whatever is still loading
 */
const MIN_MS = 900
const MAX_MS = 2500
const EXIT_MS = 800 // a little longer than the exit transition in index.html
const SEEN_KEY = 'mpfsl-preloader-seen'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

// Fonts start loading when the page is laid out, so check after a frame — earlier,
// document.fonts.ready would already be resolved because nothing had asked for a font yet.
const fontsLoaded = () => nextFrame().then(() => document.fonts?.ready)

function seenThisSession() {
  try {
    const seen = sessionStorage.getItem(SEEN_KEY) === '1'
    sessionStorage.setItem(SEEN_KEY, '1')
    return seen
  } catch {
    return false // storage blocked — just use the normal minimum
  }
}

let started = false

export function hidePreloader(waitFor = []) {
  const el = document.getElementById('preloader')
  if (!el || started) return
  started = true

  const shownFor = performance.now()
  const minLeft = seenThisSession() ? 0 : Math.max(0, MIN_MS - shownFor)
  const settled = [fontsLoaded(), ...waitFor].map((p) => Promise.resolve(p).catch(() => {}))
  const ready = Promise.all([...settled, wait(minLeft)])

  Promise.race([ready, wait(MAX_MS)]).then(() => {
    el.classList.add('is-done')
    el.removeAttribute('role') // stop announcing "loading" to screen readers
    setTimeout(() => el.remove(), EXIT_MS)
  })
}

// Removes the preloader straight away (the admin panel, which never shows it).
export function removePreloader() {
  started = true
  document.getElementById('preloader')?.remove()
}
