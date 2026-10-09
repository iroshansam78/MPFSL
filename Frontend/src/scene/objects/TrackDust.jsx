import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RUN_SPEED, TRACK_Y } from '../constants.js'

const COUNT = 400

function createDust() {
  const positions = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16
    positions[i * 3 + 1] = TRACK_Y + Math.random() * 6
    positions[i * 3 + 2] = 8 - Math.random() * 40
  }
  return positions
}

// Floating dust specks drifting past with the track.
function TrackDust() {
  const points = useRef()
  const positions = useMemo(() => createDust(), [])

  useFrame((_, delta) => {
    const array = points.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      array[i * 3 + 2] += delta * RUN_SPEED * 0.6
      if (array[i * 3 + 2] > 9) array[i * 3 + 2] -= 40
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffe6c4" transparent opacity={0.5} depthWrite={false} />
    </points>
  )
}

export default TrackDust
