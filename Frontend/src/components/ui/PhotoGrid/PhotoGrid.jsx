import SafeImage from '../SafeImage/SafeImage.jsx'
import './PhotoGrid.css'

// Clickable thumbnails (1 photo full width, 2–4 in a 2-column grid). Clicking opens the lightbox.
function PhotoGrid({ images, onOpen }) {
  return (
    <div className={`photos n${Math.min(images.length, 4)}`}>
      {images.map((image, i) => (
        <button key={image.src} type="button" className="photo" onClick={() => onOpen(images, i)}>
          <SafeImage src={image.src} alt={image.alt} />
          <span className="zoom" aria-hidden="true">
            ＋
          </span>
        </button>
      ))}
    </div>
  )
}

export default PhotoGrid
