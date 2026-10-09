import { lazy, Suspense, useCallback, useState } from 'react'
import Header from './components/layout/Header/Header.jsx'
import Hud from './components/layout/Hud/Hud.jsx'
import Footer from './components/layout/Footer/Footer.jsx'
import Lightbox from './components/ui/Lightbox/Lightbox.jsx'
import { useJourneyScroll } from './hooks/useJourneyScroll.js'
import { useReveal } from './hooks/useReveal.js'
import HomePage from './pages/HomePage.jsx'

// three.js is large, so the 3D scene loads in its own chunk after the page content.
const World = lazy(() => import('./scene/World.jsx'))

function App() {
  const zone = useJourneyScroll()
  const [score, setScore] = useState({ hits: 0, shots: 0 })
  const [lightbox, setLightbox] = useState(null)
  useReveal()

  const recordShot = useCallback(
    (hit) => setScore((s) => ({ hits: s.hits + (hit ? 1 : 0), shots: s.shots + 1 })),
    [],
  )
  const openPhotos = useCallback((images, index) => setLightbox({ images, index }), [])
  const closePhotos = useCallback(() => setLightbox(null), [])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense fallback={null}>
        <World onShot={recordShot} paused={zone === 'deep'} />
      </Suspense>
      <Hud />
      <Header />
      <main id="main-content">
        <HomePage score={score} onOpenPhotos={openPhotos} />
        <Footer />
      </main>
      {lightbox && <Lightbox {...lightbox} onClose={closePhotos} />}
    </>
  )
}

export default App
