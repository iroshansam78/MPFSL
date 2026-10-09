import { about } from '../../data/about.js'
import { COLORS } from '../../constants/colors.js'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import './About.css'

const TIMELINE_ACCENTS = [COLORS.fencing, COLORS.swim, COLORS.obstacle, COLORS.laser]

function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="split">
          <SectionHead label={about.label} title={about.title} />
          <div className="intro reveal">
            <p className="intro-text">{about.intro}</p>
            <p className="note">{about.note}</p>
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
