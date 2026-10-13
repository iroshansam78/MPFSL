import { useEffect } from 'react'
import { startSmoothScroll } from '../utils/smoothScroll.js'

// Starts smooth scrolling and the header's scroll state. Call once, in App.
export function useSmoothScroll() {
  useEffect(() => startSmoothScroll(), [])
}
