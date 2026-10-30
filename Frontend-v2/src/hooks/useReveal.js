import { useEffect } from 'react'

const pending = (root) => [
  ...(root.matches?.('.reveal:not(.in)') ? [root] : []),
  ...(root.querySelectorAll?.('.reveal:not(.in)') ?? []),
]

/*
 * Adds .in to every .reveal element the first time it scrolls into view — including elements added
 * later (e.g. on another page, or gallery photos that arrive from the API).
 *
 * The pre-rendered page arrives with everything visible. So first, whatever is already on screen is
 * marked as revealed (no animation, nothing disappears); only then does html.reveal-ready hide the
 * rest until it's scrolled to. Those elements are off screen, so the switch is never seen.
 */
export function useReveal() {
  useEffect(() => {
    pending(document)
      .filter((el) => el.getBoundingClientRect().top < window.innerHeight)
      .forEach((el) => el.classList.add('in'))
    document.documentElement.classList.add('reveal-ready')

    if (!('IntersectionObserver' in window)) {
      const showAll = () => pending(document).forEach((el) => el.classList.add('in'))
      showAll()
      const mutations = new MutationObserver(showAll)
      mutations.observe(document.body, { childList: true, subtree: true })
      return () => mutations.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    pending(document).forEach((el) => observer.observe(el))

    const mutations = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach((node) => pending(node).forEach((el) => observer.observe(el)))),
    )
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
    }
  }, [])
}
