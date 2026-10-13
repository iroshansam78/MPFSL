import { programmes } from '../../data/programmes.js'
import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import './Programmes.css'

const CARD_ACCENTS = ['var(--c-fencing)', 'var(--c-swim)', 'var(--c-obstacle)']

function Programmes() {
  return (
    <section id="programmes" className="section alt" style={{ '--accent': 'var(--c-swim)' }}>
      <div className="container">
        <SectionHead label={programmes.label} title={programmes.title} highlight={programmes.highlight} />
        <div className="cards-3">
          {programmes.items.map((item, i) => (
            <article
              key={item.title}
              className="prog-card reveal"
              style={{ '--accent': CARD_ACCENTS[i % CARD_ACCENTS.length], transitionDelay: `${i * 90}ms` }}
            >
              <figure className="prog-img">
                <SafeImage {...item.image} />
                <span className="prog-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </figure>
              <div className="prog-body">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programmes
