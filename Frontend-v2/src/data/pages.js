import { site } from './site.js'

// The public site's canonical address (mpfsl.lk redirects here). Used for canonical URLs, social
// previews, structured data and the sitemap.
export const SITE_URL = 'https://www.mpfsl.lk'

/*
 * Every public page. One list feeds the router (App.jsx), the menu, each page's <title>,
 * description and banner, the breadcrumbs, and — at build time — the pre-rendered HTML files and
 * sitemap.xml (scripts/prerender.js). Add a page here and it gets all of those.
 *
 *   path         URL
 *   label        name in the menu and breadcrumbs
 *   title        <title> (the site name is added after it — keep the total under ~60 characters
 *                so search results show it in full) and social-preview title
 *   description  meta description: one or two sentences, under ~160 characters
 *   heading      the page's <h1>, shown in its banner (not used on the home page, whose h1 is in the hero)
 *   intro        the line under the heading
 */
export const pages = [
  {
    path: '/',
    label: 'Home',
    title: site.name,
    description:
      'Official website of the Modern Pentathlon Federation of Sri Lanka: news, athletes, coaching and competitions in fencing, swimming, obstacle, shooting and running.',
  },
  {
    path: '/about',
    label: 'About',
    title: 'About the sport',
    description:
      'Modern pentathlon explained, and how Sri Lanka joined the sport: UIPM membership since 2013, coaching programmes and the road to LA 2028.',
    heading: 'About modern pentathlon',
    intro: 'Five disciplines, one complete athlete — and how modern pentathlon took root in Sri Lanka.',
  },
  {
    path: '/programmes',
    label: 'Programmes',
    title: 'Programmes',
    description:
      'How the federation develops modern pentathlon in Sri Lanka: athlete development pathways, national competitions and a growing community.',
    heading: 'Programmes',
    intro: 'Developing athletes, running competitions and growing the sport across Sri Lanka.',
  },
  {
    path: '/news',
    label: 'News',
    title: 'News',
    description:
      'Latest news from the Modern Pentathlon Federation of Sri Lanka: Asian Games results, national championships and UIPM coaching programmes.',
    heading: 'News',
    intro: 'Results, milestones and stories from Sri Lankan modern pentathlon.',
  },
  {
    path: '/gallery',
    label: 'Gallery',
    title: 'Gallery',
    description: 'Photos of modern pentathlon: fencing, swimming, obstacle, shooting and running.',
    heading: 'Gallery',
    intro: 'The five disciplines of modern pentathlon in pictures.',
  },
  {
    path: '/contact',
    label: 'Contact',
    title: 'Contact',
    description:
      'Contact the Modern Pentathlon Federation of Sri Lanka — for athletes, coaches, schools and partners who want to get involved.',
    heading: 'Contact',
    intro: 'Athletes, coaches, schools and partners — get in touch with the federation.',
  },
]

// Shown for any address that isn't in `pages`. Not in the sitemap; tells search engines not to index it.
export const notFoundPage = {
  path: '/404',
  label: 'Page not found',
  title: 'Page not found',
  description: 'This page doesn’t exist on the Modern Pentathlon Federation of Sri Lanka website.',
  heading: 'Page not found',
  intro: 'The page you were looking for has moved or never existed.',
  noindex: true,
}

export const findPage = (pathname) => {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return pages.find((page) => page.path === path) ?? notFoundPage
}

export const pageTitle = (page) => (page.path === '/' ? site.name : `${page.title} | ${site.name}`)

export const pageUrl = (page) => SITE_URL + page.path

// Menu: every page except home
export const menuPages = pages.filter((page) => page.path !== '/')
