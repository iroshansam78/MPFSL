import { useEffect, useState } from 'react'

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
 * Returns null while loading, [] if WebGL is unavailable or nothing loaded (the static photo stays),
 * otherwise the loaded slides.
 */
export function useHeroSlides(slides, fallback) {
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    let active = true

    if (!supportsWebGL()) {
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
