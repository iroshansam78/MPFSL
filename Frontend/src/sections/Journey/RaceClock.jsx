import { useEffect, useRef } from 'react'

// Broadcast-style race timer on the hero. Ticks only while the hero stage is active.
function RaceClock() {
  const time = useRef()

  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = (now) => {
      if (document.body.dataset.section === '0' && time.current) {
        const seconds = ((now - start) / 1000) % 60
        time.current.textContent = `00:${seconds.toFixed(2).padStart(5, '0')}`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="race-clock" aria-hidden="true">
      <div className="rc-lane">
        <b>4</b>
        <span>SRI</span>
        <i className="flag" />
      </div>
      <strong ref={time}>00:00.00</strong>
      <span className="rc-label">Laser Run · Live</span>
    </div>
  )
}

export default RaceClock
