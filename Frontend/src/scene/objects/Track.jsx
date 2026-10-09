import { useFrame } from '@react-three/fiber'
import { RUN_SPEED, TRACK_Y } from '../constants.js'
import { useTrackTexture } from '../textures.js'

const LENGTH = 60
const TILE = 20

// Endless running track: the texture scrolls towards the camera, with grass and tarmac either side.
function Track() {
  const texture = useTrackTexture(LENGTH / TILE)

  useFrame((_, delta) => {
    texture.offset.y += (delta * RUN_SPEED) / TILE
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, TRACK_Y, 6 - LENGTH / 2]}>
        <planeGeometry args={[9.8, LENGTH]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} rotation-x={-Math.PI / 2} position={[side * 14.9, TRACK_Y - 0.01, 6 - LENGTH / 2]}>
          <planeGeometry args={[20, LENGTH]} />
          <meshStandardMaterial color={side < 0 ? '#0f2a1c' : '#16181d'} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

export default Track
