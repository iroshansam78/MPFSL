import { AdditiveBlending } from 'three'
import { glow } from '../constants.js'
import { useGlowTexture } from '../textures.js'

const LAMPS = Array.from({ length: 12 }, (_, i) => [(i % 4) * 0.42 - 0.63, Math.floor(i / 4) * 0.42 - 0.2, 0])
const LAMP_COLOR = glow('#fff4dc', 4)

// Stadium floodlight: a pole, a 4×3 grid of bright lamps and a soft halo.
function FloodLight({ position }) {
  const halo = useGlowTexture()

  return (
    <group position={position}>
      <mesh position={[0, -4.5, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 9, 8]} />
        <meshStandardMaterial color="#1b1d22" />
      </mesh>
      {LAMPS.map((lampPosition, i) => (
        <mesh key={i} position={lampPosition}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial color={LAMP_COLOR} toneMapped={false} />
        </mesh>
      ))}
      <sprite scale={[9, 9, 1]}>
        <spriteMaterial map={halo} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  )
}

export default FloodLight
