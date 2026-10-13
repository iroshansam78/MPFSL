import { useState } from 'react'
import './SafeImage.css'

/*
 * Lazy-loaded image with two levels of fallback:
 * 1. if `src` fails and a `fallback` URL is given, show that instead
 * 2. if that fails too (or there is none), show a placeholder with the alt text
 */
function SafeImage({ src, alt, fallback, fallbackAlt, className = '', ...props }) {
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
