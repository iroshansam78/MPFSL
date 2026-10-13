import { stats } from '../../data/stats.js'
import './Stats.css'

function Stats() {
  return (
    <section className="stats-band" aria-label="Federation focus">
      <div className="container stats">
        {stats.map((stat, i) => (
          <div key={stat.value} className="stat reveal" style={{ transitionDelay: `${i * 80}ms` }}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stats
