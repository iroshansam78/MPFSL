import { stageLabels } from '../../../data/journey.js'
import './Hud.css'

// Stage rail + progress bar shown over the 3D journey. The active stage is styled from <body data-section>.
function Hud() {
  return (
    <div className="hud" aria-hidden="true">
      <ol className="rail">
        {stageLabels.map((label, i) => (
          <li key={label} data-i={i}>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <div className="progress" />
    </div>
  )
}

export default Hud
