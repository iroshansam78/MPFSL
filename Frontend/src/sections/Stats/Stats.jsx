import { stats } from '../../data/stats.js'
import { COLORS } from '../../constants/colors.js'
import './Stats.css'

const STAT_ACCENTS = [COLORS.gold, COLORS.fencing, COLORS.swim, COLORS.obstacle]

function Stats() {
  return (
    <section className="stats-band" aria-label="Federation focus">
      <div className="container stats">
        {stats.map((stat, i) => (
          <div
            key={stat.value}
            className="stat reveal"
            style={{ '--accent': STAT_ACCENTS[i], transitionDelay: `${i * 80}ms` }}
          >
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stats
