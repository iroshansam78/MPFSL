import { useState } from 'react'
import './SafeImage.css'

// Lazy-loaded image that shows a striped placeholder with the alt text if it fails to load.
function SafeImage({ src, alt, className = '', ...props }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`img-fallback ${className}`.trim()} role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className || undefined}
      onError={() => setFailed(true)}
      {...props}
    />
  )
}

export default SafeImage
