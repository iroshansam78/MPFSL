import { gallery } from '../../data/gallery.js'
import { site } from '../../data/site.js'
import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import './Gallery.css'

function Gallery({ onOpenPhotos }) {
  return (
    <section id="gallery" className="section alt">
      <div className="container">
        <div className="row-between">
          <SectionHead label={gallery.label} title={gallery.title} />
          <a className="text-link reveal" href={site.facebook} target="_blank" rel="noreferrer">
            View Facebook <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="gallery">
          {gallery.images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              className={`g-item reveal ${image.size ?? ''}`.trim()}
              style={{ transitionDelay: `${i * 80}ms` }}
              onClick={() => onOpenPhotos(gallery.images, i)}
            >
              <SafeImage src={image.src} alt={image.alt} />
              <span className="g-cap">{image.alt}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
