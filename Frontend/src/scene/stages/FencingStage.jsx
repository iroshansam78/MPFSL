import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { COLORS, STAGE_Z, glow } from '../constants.js'
import Epee from '../objects/Epee.jsx'
import Sparks from '../objects/Sparks.jsx'

const Z = STAGE_Z.fencing
const DEFAULT_CLASH = new Vector3(0, 0.95, Z)

// Stage 1: two épées lunging at each other above a lit piste. Clicking near them makes them clash.
function FencingStage() {
  const left = useRef()
  const right = useRef()
  const sparks = useRef()
  const recoil = useRef(0)
  const nextAutoClash = useRef(1.5)

  const clash = (point) => {
    recoil.current = 1
    sparks.current?.burst(point ?? DEFAULT_CLASH)
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    recoil.current = Math.max(0, recoil.current - delta * 3)
    const kick = recoil.current * 0.35

    left.current.position.x = -2.3 + Math.max(0, Math.sin(t * 2.2)) * 0.4
    left.current.rotation.z = 0.22 + Math.sin(t * 2.9) * 0.08 + kick
    right.current.position.x = 2.3 - Math.max(0, Math.sin(t * 2.2 + 1.7)) * 0.4
    right.current.rotation.z = 0.22 + Math.sin(t * 2.9 + 1.2) * 0.08 + kick

    if (t > nextAutoClash.current) {
      nextAutoClash.current = t + 2.2 + Math.random() * 1.5
      clash()
    }
  })

  return (
    <group>
      <group ref={left} position={[-2.3, 0.4, Z]}>
        <group scale={1.25}>
          <Epee />
        </group>
      </group>
      <group ref={right} position={[2.3, 0.4, Z]} rotation-y={Math.PI}>
        <group scale={1.25}>
          <Epee />
        </group>
      </group>
      <Sparks ref={sparks} />

      {/* piste */}
      <group position={[0, -1.2, Z]}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[16, 1.8]} />
          <meshStandardMaterial color="#0e1422" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-0.9, 0.9].map((z) => (
          <mesh key={z} position={[0, 0.01, z]}>
            <boxGeometry args={[16, 0.01, 0.03]} />
            <meshBasicMaterial color={glow(COLORS.fencing, 2.5)} toneMapped={false} />
          </mesh>
        ))}
        {[-2, 0, 2].map((x) => (
          <mesh key={x} position={[x, 0.01, 0]}>
            <boxGeometry args={[0.03, 0.01, 1.8]} />
            <meshBasicMaterial color={glow('#ffffff', 1.2)} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <spotLight position={[0, 6, Z + 2]} angle={0.5} penumbra={0.8} intensity={40} color={COLORS.fencing} />

      {/* invisible click target around the blades */}
      <mesh
        position={[0, 0.5, Z + 0.5]}
        onClick={(event) => {
          event.stopPropagation()
          clash(event.point)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default FencingStage
