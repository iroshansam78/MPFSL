import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { COLORS, glow } from '../constants.js'

const START_Z = -125
const END_Z = -186
const SPACING = 6.5
const OBSTACLE_TYPES = ['hoop', 'bars', 'gate']

const neon = (intensity = 2.2) => <meshBasicMaterial color={glow(COLORS.obstacle, intensity)} toneMapped={false} />

// Spinning ring with six white markers.
function Hoop({ index }) {
  const ring = useRef()

  useFrame((state) => {
    ring.current.rotation.z = state.clock.elapsedTime * 0.6 * (index % 2 ? 1 : -1)
  })

  return (
    <group ref={ring} position={[0, 1.2, 0]}>
      <mesh>
        <torusGeometry args={[2.2, 0.05, 12, 96]} />
        {neon(2.6)}
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation-z={(i / 6) * Math.PI * 2}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshBasicMaterial color={glow('#ffffff', 1.5)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// Two posts with a low and a high glowing bar.
function Bars() {
  return (
    <group>
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]}>
          <boxGeometry args={[0.14, 3.4, 0.14]} />
          <meshStandardMaterial color="#20232b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[4.8, 0.08, 0.08]} />
        {neon()}
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[4.8, 0.08, 0.08]} />
        {neon()}
      </mesh>
    </group>
  )
}

// Angled side walls with chevron arrows on the floor.
function Gate() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 2.7, 0.4, 0]} rotation-y={side * 0.35}>
          <boxGeometry args={[0.1, 2.8, 2.2]} />
          <meshStandardMaterial color="#14161c" emissive={COLORS.obstacle} emissiveIntensity={0.25} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, -0.98, 0]} rotation={[-Math.PI / 2, 0, x > 0 ? 0.8 : -0.8]}>
          <planeGeometry args={[0.12, 1.3]} />
          {neon(1.8)}
        </mesh>
      ))}
    </group>
  )
}

function createCourse() {
  const course = []
  let index = 0
  for (let z = START_Z; z > END_Z; z -= SPACING) {
    course.push({ z, type: OBSTACLE_TYPES[index % OBSTACLE_TYPES.length], index: index++ })
  }
  return course
}

// Stage 3: a corridor of hoops, bars and gates on a grid floor.
function ObstacleStage() {
  const course = useMemo(() => createCourse(), [])
  const centerZ = (START_Z + END_Z) / 2
  const length = START_Z - END_Z + 10

  return (
    <group>
      {course.map(({ z, type, index }) => (
        <group key={z} position={[0, 0, z]}>
          {type === 'hoop' && <Hoop index={index} />}
          {type === 'bars' && <Bars />}
          {type === 'gate' && <Gate />}
        </group>
      ))}

      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, -1, centerZ]}>
          <boxGeometry args={[0.05, 0.02, length]} />
          {neon(2)}
        </mesh>
      ))}

      <gridHelper args={[length, Math.round(length), '#3a2414', '#1a120c']} position={[0, -1.01, centerZ]} />
      <pointLight position={[0, 3, -150]} intensity={25} distance={30} color={COLORS.obstacle} />
    </group>
  )
}

export default ObstacleStage
