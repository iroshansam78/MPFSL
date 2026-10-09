import { useEffect, useState } from 'react'
import { journeyScroll, onZoneChange, startJourneyScroll } from '../utils/journeyScroll.js'

// Starts smooth scrolling + journey tracking and returns the current zone
// ('journey' | 'content' | 'deep'). Call once, in App.
export function useJourneyScroll() {
  const [zone, setZone] = useState(journeyScroll.zone)

  useEffect(() => {
    const stop = startJourneyScroll()
    const unsubscribe = onZoneChange(setZone)
    return () => {
      unsubscribe()
      stop()
    }
  }, [])

  return zone
}
