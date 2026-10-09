import { programmes } from '../../data/programmes.js'
import { COLORS } from '../../constants/colors.js'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import './Programmes.css'

const CARD_ACCENTS = [COLORS.fencing, COLORS.swim, COLORS.obstacle]

function Programmes() {
  return (
    <section id="programmes" className="section alt">
      <div className="container">
        <SectionHead label={programmes.label} title={programmes.title} />
        <div className="cards-3">
          {programmes.items.map((item, i) => (
            <article
              key={item.title}
              className="prog-card reveal"
              style={{ '--accent': CARD_ACCENTS[i], transitionDelay: `${i * 90}ms` }}
            >
              <span className="prog-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programmes
