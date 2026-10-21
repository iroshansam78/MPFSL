import { useEffect } from 'react'

const pending = (root) => [
  ...(root.matches?.('.reveal:not(.in)') ? [root] : []),
  ...(root.querySelectorAll?.('.reveal:not(.in)') ?? []),
]

// Adds .in to every .reveal element the first time it scrolls into view — including elements added
// later (e.g. gallery photos that arrive from the API after the page has loaded).
export function useReveal() {
  useEffect(() => {
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
