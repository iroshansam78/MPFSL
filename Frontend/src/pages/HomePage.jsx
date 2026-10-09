import Journey from '../sections/Journey/Journey.jsx'
import About from '../sections/About/About.jsx'
import Programmes from '../sections/Programmes/Programmes.jsx'
import News from '../sections/News/News.jsx'
import Gallery from '../sections/Gallery/Gallery.jsx'
import Stats from '../sections/Stats/Stats.jsx'
import Contact from '../sections/Contact/Contact.jsx'

// The 3D journey intro, then the regular content sections.
function HomePage({ score, onOpenPhotos }) {
  return (
    <>
      <Journey score={score} />
      <div className="content">
        <About />
        <Programmes />
        <News onOpenPhotos={onOpenPhotos} />
        <Gallery onOpenPhotos={onOpenPhotos} />
        <Stats />
        <Contact />
      </div>
    </>
  )
}

export default HomePage
