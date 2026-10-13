import Hero from '../sections/Hero/Hero.jsx'
import About from '../sections/About/About.jsx'
import Programmes from '../sections/Programmes/Programmes.jsx'
import News from '../sections/News/News.jsx'
import Gallery from '../sections/Gallery/Gallery.jsx'
import Stats from '../sections/Stats/Stats.jsx'
import Contact from '../sections/Contact/Contact.jsx'

function HomePage({ onOpenPhotos }) {
  return (
    <>
      <Hero />
      <About />
      <Programmes />
      <News onOpenPhotos={onOpenPhotos} />
      <Gallery onOpenPhotos={onOpenPhotos} />
      <Stats />
      <Contact />
    </>
  )
}

export default HomePage
