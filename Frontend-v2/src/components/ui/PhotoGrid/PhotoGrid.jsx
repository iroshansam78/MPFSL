import SafeImage from '../SafeImage/SafeImage.jsx'
import './PhotoGrid.css'

// How wide each photo is shown, so the browser picks a small enough copy: one photo fills the card;
// two or more share it in two columns (and cards sit side by side on wider screens).
const SIZES_SINGLE = '(max-width: 760px) 100vw, 50vw'
const SIZES_GRID = '(max-width: 760px) 50vw, 25vw'

// Clickable thumbnails (1 photo full width, 2+ in a 2-column grid). Clicking opens the lightbox.
function PhotoGrid({ images, onOpen }) {
  const sizes = images.length === 1 ? SIZES_SINGLE : SIZES_GRID
  return (
    <div className={`photos n${Math.min(images.length, 4)}`}>
      {images.map((image, i) => (
        <button key={image.src} type="button" className="photo" onClick={() => onOpen(images, i)}>
          <SafeImage src={image.src} alt={image.alt} sizes={sizes} />
          <span className="zoom" aria-hidden="true">
            ＋
          </span>
        </button>
      ))}
    </div>
  )
}

export default PhotoGrid
