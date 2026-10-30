import { useState } from 'react'
import responsiveImages from '../../../data/responsiveImages.json'
import './SafeImage.css'

// Smaller WebP copies of a federation photo, if `npm run images` has made them (see scripts/optimize-images.js)
const srcSetFor = (src) =>
  responsiveImages[src]?.map((width) => `${src.replace(/\.[a-z]+$/i, '')}-${width}.webp ${width}w`).join(', ')

/*
 * Lazy-loaded image with two levels of fallback:
 * 1. if `src` fails and a `fallback` URL is given, show that instead
 * 2. if that fails too (or there is none), show a placeholder with the alt text
 * Federation photos get a srcset of smaller WebP copies; `sizes` says how wide the photo is shown
 * (the default suits most cards: full width on phones, about half the page on wider screens).
 */
function SafeImage({ src, alt, fallback, fallbackAlt, className = '', sizes = '(max-width: 760px) 100vw, 50vw', ...props }) {
  const [attempt, setAttempt] = useState(0) // 0 = src, 1 = fallback, 2 = placeholder

  if (attempt === 2) {
    return (
      <div className={`img-fallback ${className}`.trim()} role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    )
  }

  return (
    <img
      key={attempt}
      src={attempt === 0 ? src : fallback}
      srcSet={attempt === 0 ? srcSetFor(src) : undefined}
      sizes={attempt === 0 && srcSetFor(src) ? sizes : undefined}
      alt={attempt === 0 ? alt : fallbackAlt || alt}
      loading="lazy"
      decoding="async"
      className={className || undefined}
      onError={() => setAttempt((a) => (a === 0 && fallback ? 1 : 2))}
      {...props}
    />
  )
}

export default SafeImage
