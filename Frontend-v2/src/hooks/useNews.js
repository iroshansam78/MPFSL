import { useEffect, useState } from 'react'
import { builtInNews } from '../data/news.js'
import { API_URL } from '../utils/api.js'

/**
 * The news written in the admin panel: { featured, stories }. Shows the built-in stories until the
 * API answers, and keeps them if it can't be reached.
 */
export function useNews() {
  const [news, setNews] = useState(builtInNews)

  useEffect(() => {
    if (!API_URL) return // no API yet — the built-in stories stay
    const controller = new AbortController()
    fetch(`${API_URL}/news`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setNews({ featured: data.featured, stories: data.stories }))
      .catch(() => {}) // keep the built-in stories
    return () => controller.abort()
  }, [])

  return news
}
