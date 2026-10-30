import { useCallback, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
// Public-site styles (loaded only on mpfsl.lk — the admin panel has its own, see src/main.jsx)
import './styles/variables.css'
import './styles/global.css'
import Header from './components/layout/Header/Header.jsx'
import Footer from './components/layout/Footer/Footer.jsx'
import Lightbox from './components/ui/Lightbox/Lightbox.jsx'
import { findPage } from './data/pages.js'
import { usePageChange } from './hooks/usePageChange.js'
import { useReveal } from './hooks/useReveal.js'
import { useSmoothScroll } from './hooks/useSmoothScroll.js'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import Page from './pages/Page.jsx'
import About from './sections/About/About.jsx'
import Contact from './sections/Contact/Contact.jsx'
import Gallery from './sections/Gallery/Gallery.jsx'
import News from './sections/News/News.jsx'
import Programmes from './sections/Programmes/Programmes.jsx'
import Stats from './sections/Stats/Stats.jsx'

/*
 * The public site. Rendered in the browser (PublicSite.jsx, with BrowserRouter) and at build time
 * for every page in data/pages.js (entry-server.jsx, with StaticRouter), so it must not touch
 * `window` or `document` while rendering — only in effects.
 */
function App() {
  const [lightbox, setLightbox] = useState(null)
  const { pathname } = useLocation()
  const page = findPage(pathname)
  useSmoothScroll()
  useReveal()
  usePageChange(page)

  const openPhotos = useCallback((images, index) => setLightbox({ images, index }), [])
  const closePhotos = useCallback(() => setLightbox(null), [])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage onOpenPhotos={openPhotos} />} />
          <Route
            path="/about"
            element={
              <Page path="/about">
                <About />
                <Stats />
              </Page>
            }
          />
          <Route
            path="/programmes"
            element={
              <Page path="/programmes">
                <Programmes />
              </Page>
            }
          />
          <Route
            path="/news"
            element={
              <Page path="/news">
                <News onOpenPhotos={openPhotos} priority />
              </Page>
            }
          />
          <Route
            path="/gallery"
            element={
              <Page path="/gallery">
                <Gallery onOpenPhotos={openPhotos} />
              </Page>
            }
          />
          <Route
            path="/contact"
            element={
              <Page path="/contact">
                <Contact />
              </Page>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {lightbox && <Lightbox {...lightbox} onClose={closePhotos} />}
    </>
  )
}

export default App
