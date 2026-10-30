import { useEffect, useState } from 'react'

/*
 * The 3D slideshow is a treat for big screens on good connections. Phones, data-saver mode, slow
 * connections and "reduce motion" get the still photo only: three.js costs ~0.7 s of main-thread
 * time on a mid-range phone, which Lighthouse counts against the page (Total Blocking Time).
 */
function wantsSlideshow() {
  const connection = navigator.connection
  return (
    window.matchMedia('(min-width: 768px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !connection?.saveData &&
    !['slow-2g', '2g', '3g'].includes(connection?.effectiveType)
  )
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/*
 * Loads the hero slides as WebGL textures (three.js is fetched on demand).
 * Returns null while loading, [] if the slideshow is skipped (see above), WebGL is unavailable or
 * nothing loaded (the still photo stays),
 * otherwise the loaded slides.
 */
export function useHeroSlides(slides, fallback) {
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    let active = true

    if (!wantsSlideshow() || !supportsWebGL()) {
      Promise.resolve().then(() => active && setLoaded([]))
      return () => {
        active = false
      }
    }

    import('../scene/loadSlides.js')
      .then(async ({ loadSlides }) => {
        let result = await loadSlides(slides)
        if (!result.length) result = await loadSlides([fallback])
        if (active) setLoaded(result)
      })
      .catch(() => active && setLoaded([]))

    return () => {
      active = false
    }
  }, [slides, fallback])

  return loaded
}
