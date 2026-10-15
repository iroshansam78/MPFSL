import { useCallback, useState } from 'react'
// Public-site styles (loaded only on website.lk — the admin panel has its own, see src/main.jsx)
import './styles/variables.css'
import './styles/global.css'
import Header from './components/layout/Header/Header.jsx'
import Footer from './components/layout/Footer/Footer.jsx'
import Lightbox from './components/ui/Lightbox/Lightbox.jsx'
import { useReveal } from './hooks/useReveal.js'
import { useSmoothScroll } from './hooks/useSmoothScroll.js'
import HomePage from './pages/HomePage.jsx'

function App() {
  const [lightbox, setLightbox] = useState(null)
  useSmoothScroll()
  useReveal()

  const openPhotos = useCallback((images, index) => setLightbox({ images, index }), [])
  const closePhotos = useCallback(() => setLightbox(null), [])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <HomePage onOpenPhotos={openPhotos} />
      </main>
      <Footer />
      {lightbox && <Lightbox {...lightbox} onClose={closePhotos} />}
    </>
  )
}

export default App
