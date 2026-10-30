import { useEffect, useRef } from 'react'
import { pageTitle, pageUrl } from '../data/pages.js'
import { hidePreloader } from '../utils/preloader.js'
import { scrollToTop } from '../utils/smoothScroll.js'

/*
 * Makes <head> contain `<tag {...match} {key}={value}>`: updates the existing element, adds it if it's
 * missing (e.g. the 404 page has no canonical URL), or removes it when `value` is null.
 */
function setHead(tag, match, key, value) {
  const selector = tag + Object.entries(match).map(([name, val]) => `[${name}="${val}"]`).join('')
  let element = document.head.querySelector(selector)
  if (value === null) return element?.remove()
  if (!element) {
    element = document.createElement(tag)
    Object.entries(match).forEach(([name, val]) => element.setAttribute(name, val))
    document.head.appendChild(element)
  }
  element.setAttribute(key, value)
}

// Updates <head> to match the page. The pre-rendered HTML already has these for the first page
// (scripts/prerender.js); this keeps them right when moving between pages without reloading.
function updateHead(page) {
  const url = page.noindex ? null : pageUrl(page)
  document.title = pageTitle(page)
  setHead('meta', { name: 'description' }, 'content', page.description)
  setHead('meta', { property: 'og:title' }, 'content', pageTitle(page))
  setHead('meta', { property: 'og:description' }, 'content', page.description)
  setHead('meta', { property: 'og:url' }, 'content', url)
  setHead('link', { rel: 'canonical' }, 'href', url)
  setHead('meta', { name: 'robots' }, 'content', page.noindex ? 'noindex' : null)
}

/*
 * Everything that happens when the page changes:
 *   - <head> (title, description, canonical URL, social tags) follows the page
 *   - after moving to another page: back to the top, and focus on the main area so screen readers
 *     start reading the new page
 *   - on the first page load: inner pages lift the preloader (once the fonts are ready); the home
 *     page's hero does it itself, once its photo has loaded too
 */
export function usePageChange(page) {
  const firstLoad = useRef(true)

  useEffect(() => {
    updateHead(page)

    if (firstLoad.current) {
      firstLoad.current = false
      if (page.path !== '/') hidePreloader()
      return
    }

    scrollToTop()
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [page])
}
