import { Canvas } from '@react-three/fiber'
import SlideshowPlane from './SlideshowPlane.jsx'

// WebGL layer behind the hero text. Loaded lazily by sections/Hero so three.js isn't in the main bundle.
// `paused` stops rendering while the hero is off screen.
function HeroCanvas({ slides, index, paused, reduced }) {
  return (
    <Canvas
      className="hero-canvas"
      flat
      linear
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 1] }}
    >
      <SlideshowPlane slides={slides} index={index} reduced={reduced} />
    </Canvas>
  )
}

export default HeroCanvas
