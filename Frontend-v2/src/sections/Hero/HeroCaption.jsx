import { hero } from '../../data/hero.js'

// Current slide's title/caption plus one progress bar per slide (click to jump).
function HeroCaption({ slides, current, index, onSelect, playing }) {
  return (
    <div className="hero-caption">
      <p className="cap-text" key={current.src}>
        <strong>{current.title}</strong>
        <span>{current.caption}</span>
      </p>
      {slides.length > 1 && (
        <div className="cap-bars" role="group" aria-label="Choose photo">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              className={i === index ? 'on' : ''}
              aria-label={`Show photo ${i + 1}: ${slide.title}`}
              aria-current={i === index}
              onClick={() => onSelect(i)}
              style={{ '--dur': `${hero.slideDuration}ms`, '--play': playing ? 'running' : 'paused' }}
            >
              <i />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeroCaption
