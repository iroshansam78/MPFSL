import { miniStats, site } from '../../data/site.js'
import { COLORS } from '../../constants/colors.js'
import RaceClock from './RaceClock.jsx'
import StagePanel from './StagePanel.jsx'
import './Journey.css'

// The scroll-driven intro: six screen-high panels whose text overlays the matching 3D stage.
// `score` is the laser-shooting tally ({ hits, shots }) from the Laser stage.
function Journey({ score }) {
  const accuracy = score.shots ? Math.round((score.hits / score.shots) * 100) : 0

  return (
    <div id="journey">
      <StagePanel accent={COLORS.gold} className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Official national federation</p>
          <h1 className="hero-name">{site.name}</h1>
          <p className="display" aria-hidden="true">
            <span>Five disciplines.</span>
            <span>
              <span className="accent">One</span> champion.
            </span>
          </p>
          <p className="lead">
            <span lang="si" className="si">
              {site.sinhala}
            </span>{' '}
            — developing athletes, growing competition, and elevating the sport across the nation.
          </p>
          <div className="cta-row">
            <a className="btn primary" href={site.facebook} target="_blank" rel="noreferrer">
              Follow on Facebook <span aria-hidden="true">↗</span>
            </a>
            <a className="btn" href="#news">
              Latest news
            </a>
          </div>
          <ul className="mini-stats" aria-label="Federation highlights">
            {miniStats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong> {stat.label}
              </li>
            ))}
          </ul>
        </div>
        <RaceClock />
        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll to compete</span>
          <i />
        </div>
      </StagePanel>

      <StagePanel accent={COLORS.fencing}>
        <div className="lower">
          <p className="kicker">
            <b>01</b> Fencing · Épée
          </p>
          <h2>
            One touch.
            <br />
            One point.
          </h2>
          <p>Ranking round and bonus round. Every athlete faces everyone — reflexes and nerve under the lights.</p>
          <p className="hint">Click near the blades to clash</p>
        </div>
      </StagePanel>

      <StagePanel accent={COLORS.swim}>
        <div className="lower">
          <p className="kicker">
            <b>02</b> Swimming
          </p>
          <h2>
            200m
            <br />
            freestyle.
          </h2>
          <p>Four lengths, flat out. Every second you gain in the pool becomes points on the board.</p>
        </div>
      </StagePanel>

      <StagePanel accent={COLORS.obstacle}>
        <div className="lower">
          <p className="kicker">
            <b>03</b> Obstacle · The new era
          </p>
          <h2>
            Climb. Swing.
            <br />
            Fly.
          </h2>
          <p>Riding has been replaced. A ninja-style obstacle course now tests raw power, grip and agility.</p>
        </div>
      </StagePanel>

      <StagePanel accent={COLORS.laser}>
        <div className="lower">
          <p className="kicker">
            <b>04 + 05</b> Laser Run · Shoot + Run
          </p>
          <h2>
            Steady hand.
            <br />
            Racing heart.
          </h2>
          <p>Handicap start: the leader goes first. Hit five targets, run, repeat. First across the line wins.</p>
          <div className="score" aria-live="polite">
            <div>
              <strong>{score.hits}</strong>
              <span>hits</span>
            </div>
            <div>
              <strong>{score.shots}</strong>
              <span>shots</span>
            </div>
            <div>
              <strong>{accuracy}%</strong>
              <span>accuracy</span>
            </div>
          </div>
          <p className="hint">Click the target to fire</p>
        </div>
      </StagePanel>

      <StagePanel accent={COLORS.gold} className="finale">
        <div className="finale-copy">
          <p className="kicker">Sri Lanka · Road to LA 2028</p>
          <h2>
            Be the next
            <br />
            <span className="accent">pentathlete.</span>
          </h2>
          <div className="cta-row center">
            <a className="btn primary" href="#about">
              Discover the sport
            </a>
            <a className="btn" href="#contact">
              Contact the federation
            </a>
          </div>
        </div>
      </StagePanel>
    </div>
  )
}

export default Journey
