import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { COLORS, STAGE_Z, glow } from '../constants.js'

const DISCIPLINE_COLORS = [COLORS.fencing, COLORS.swim, COLORS.obstacle, COLORS.laser, COLORS.run]

// Stage 5: five discipline orbs circling a pulsing medal, with shockwave rings.
function FinaleStage() {
  const orbit = useRef()
  const rings = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    orbit.current.rotation.z = t * 0.3

    const beat = Math.pow(Math.abs(Math.sin(t * 2.2)), 8)
    const radius = 2.2 + beat * 0.35
    orbit.current.children.forEach((orb, i) => {
      const angle = (i / 5) * Math.PI * 2 + Math.PI / 2
      orb.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      orb.scale.setScalar(1 + beat * 0.4)
    })

    rings.current.forEach((ring, i) => {
      if (!ring) return
      const k = (t * 0.45 + i / 3) % 1
      ring.scale.setScalar(1 + k * 5)
      ring.material.opacity = (1 - k) * 0.7
    })
  })

  return (
    <group position={[0, 1.9, STAGE_Z.finale - 2]} scale={0.72}>
      <group ref={orbit}>
        {DISCIPLINE_COLORS.map((color) => (
          <mesh key={color}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshBasicMaterial color={glow(color, 2.4)} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <mesh>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial
          color={COLORS.maroon}
          emissive={COLORS.gold}
          emissiveIntensity={0.6}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)}>
          <torusGeometry args={[1, 0.015, 8, 128]} />
          <meshBasicMaterial color={glow(COLORS.gold, 2.5)} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default FinaleStage
