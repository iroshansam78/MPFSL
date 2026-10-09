import { useThree } from '@react-three/fiber'
import { STAGE_Z, TRACK_Y } from '../constants.js'
import FloodLight from '../objects/FloodLight.jsx'
import GlowSprite from '../objects/GlowSprite.jsx'
import Runner from '../objects/Runner.jsx'
import Track from '../objects/Track.jsx'
import TrackDust from '../objects/TrackDust.jsx'

// Stage 0: a sprinter on a floodlit night track.
function HeroStage() {
  const isMobile = useThree((state) => state.size.width < 760)

  return (
    <group position={[0, 0, STAGE_Z.hero]}>
      <Track />
      <FloodLight position={[-9, 6.5, -26]} />
      <FloodLight position={[9, 6.5, -26]} />
      <FloodLight position={[-14, 6, -6]} />
      <TrackDust />
      <GlowSprite position={isMobile ? [2, 1.2, -12] : [9, 1.4, -14]} />

      <hemisphereLight args={['#ffe2bd', '#1a0d10', 0.6]} />
      <spotLight position={[0, 10, -12]} angle={0.7} penumbra={1} intensity={120} distance={40} color="#ffe9cc" />
      <spotLight position={[6, 8, 10]} angle={0.6} penumbra={1} intensity={40} distance={30} color="#ffd9a8" />

      <Runner
        position={isMobile ? [0.6, TRACK_Y, 2.2] : [2.7, TRACK_Y, 3.4]}
        rotation-y={isMobile ? -0.7 : -0.95}
        scale={1.15}
      />
    </group>
  )
}

export default HeroStage
