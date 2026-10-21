import { gallery } from '../../data/gallery.js'
import { site } from '../../data/site.js'
import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import { galleryPhotoKey } from '../../data/photoSpots.js'
import { applyPhotoChange, largest, useSitePhotoChanges } from '../../hooks/useSitePhotos.js'
import './Gallery.css'

function Gallery({ onOpenPhotos }) {
  const changes = useSitePhotoChanges()
  const images = gallery.images.map((image, i) => applyPhotoChange(image, changes.get(galleryPhotoKey(i))))
  const openPhoto = (index) => onOpenPhotos(largest(images), index)

  return (
    <section id="gallery" className="section alt" style={{ '--accent': 'var(--c-laser)' }}>
      <div className="container">
        <div className="row-between">
          <SectionHead label={gallery.label} title={gallery.title} highlight={gallery.highlight} />
          <a className="text-link reveal" href={site.facebook} target="_blank" rel="noreferrer">
            View Facebook <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="gallery">
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              className={`g-item reveal ${image.size ?? ''}`.trim()}
              style={{ transitionDelay: `${i * 80}ms` }}
              onClick={() => openPhoto(i)}
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
