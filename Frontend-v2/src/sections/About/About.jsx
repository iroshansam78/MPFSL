import { about } from '../../data/about.js'
import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import './About.css'

const TIMELINE_ACCENTS = ['var(--c-fencing)', 'var(--c-swim)', 'var(--c-obstacle)', 'var(--c-laser)', 'var(--c-run)']

function About() {
  return (
    <section id="about" className="section" style={{ '--accent': 'var(--c-fencing)' }}>
      <div className="container">
        <div className="about-grid">
          <div>
            <SectionHead label={about.label} title={about.title} highlight={about.highlight} />
            <div className="intro reveal">
              <p className="intro-text">{about.intro}</p>
              <p className="note">{about.note}</p>
            </div>
          </div>

          <div className="about-photos reveal">
            {about.images.map((image, i) => (
              <figure key={image.src} className={`ap ap-${i}`}>
                <SafeImage {...image} />
              </figure>
            ))}
            <blockquote className="quote">
              “{about.quote.text}”<cite>{about.quote.cite}</cite>
            </blockquote>
          </div>
        </div>

        <ol className="timeline" aria-label="Modern pentathlon development in Sri Lanka">
          {about.timeline.map((entry, i) => (
            <li
              key={entry.year}
              className="t-entry reveal"
              style={{ '--accent': TIMELINE_ACCENTS[i % TIMELINE_ACCENTS.length] }}
            >
              <p className="t-year">{entry.year}</p>
              <div className="t-body">
                <h3>{entry.title}</h3>
                {entry.body.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default About
