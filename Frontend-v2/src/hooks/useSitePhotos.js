import { useEffect, useState } from 'react'

// Same API address as the admin panel: VITE_API_URL in production, the dev server's /api proxy locally.
const API_URL = import.meta.env.VITE_API_URL || '/api'

const NO_CHANGES = new Map()
let request = null

// Loaded once per visit and shared by every section. If the API can't be reached, nothing changes.
const loadChanges = () =>
  (request ??= fetch(`${API_URL}/site-photos`)
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => new Map((data?.photos ?? []).map((photo) => [photo.key, photo])))
    .catch(() => NO_CHANGES))

/**
 * Photos and captions changed in the admin panel, by spot name (see data/photoSpots.js).
 * Empty until loaded, so the original photos show first.
 * @returns {Map<string, { key: string, alt: string, src?: string, large?: string }>}
 */
export function useSitePhotoChanges() {
  const [changes, setChanges] = useState(NO_CHANGES)

  useEffect(() => {
    let active = true
    loadChanges().then((loaded) => active && setChanges(loaded))
    return () => {
      active = false
    }
  }, [])

  return changes
}

/** An original photo ({ src, alt, ... }) with its spot's change applied, if there is one. */
export function applyPhotoChange(original, change) {
  if (!change) return original
  return { ...original, alt: change.alt, ...(change.src && { src: change.src, large: change.large }) }
}

/** For the lightbox: the biggest version of each photo (replaced photos come in three sizes). */
export const largest = (images) => images.map((image) => ({ ...image, src: image.large ?? image.src }))
