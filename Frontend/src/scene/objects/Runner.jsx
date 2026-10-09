import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRimMaterial } from '../materials.js'

const capsule = (radius, length) => <capsuleGeometry args={[radius, length, 6, 14]} />

// A limb segment hanging down from its pivot; `children` attach at the far end (e.g. a forearm).
function Limb({ limbRef, radius, length, material, children }) {
  return (
    <group ref={limbRef}>
      <mesh position={[0, -length / 2, 0]} material={material}>
        {capsule(radius, length)}
      </mesh>
      <group position={[0, -length, 0]}>{children}</group>
    </group>
  )
}

// Rim-lit sprinter built from capsules, animated with a procedural running cycle.
function Runner(props) {
  const skin = useRimMaterial('#0a0708', '#ffd7a0')
  const kit = useRimMaterial('#2a0711', '#ffc46b', 1.3)
  const shorts = useRimMaterial('#060608', '#ffd7a0', 0.9)

  const hips = useRef()
  const torso = useRef()
  const thighL = useRef()
  const shinL = useRef()
  const thighR = useRef()
  const shinR = useRef()
  const armL = useRef()
  const foreL = useRef()
  const armR = useRef()
  const foreR = useRef()

  useFrame((state) => {
    const phase = state.clock.elapsedTime * 9.5
    const swingLeg = (thigh, shin, p) => {
      thigh.current.rotation.x = -Math.sin(p) * 0.95 - 0.1
      shin.current.rotation.x = 0.25 + 1.55 * Math.max(0, Math.cos(p - 0.35))
    }

    swingLeg(thighL, shinL, phase)
    swingLeg(thighR, shinR, phase + Math.PI)
    armL.current.rotation.x = Math.sin(phase) * 0.95
    armR.current.rotation.x = Math.sin(phase + Math.PI) * 0.95
    foreL.current.rotation.x = -1.45 + Math.sin(phase) * 0.25
    foreR.current.rotation.x = -1.45 - Math.sin(phase) * 0.25
    hips.current.position.y = 0.95 + Math.abs(Math.cos(phase)) * 0.06
    torso.current.rotation.y = Math.sin(phase) * 0.14
  })

  const shoe = (
    <mesh position={[0, -0.03, 0.07]} material={kit}>
      <boxGeometry args={[0.09, 0.06, 0.24]} />
    </mesh>
  )

  return (
    <group {...props}>
      {/* contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0.1]} scale={[0.7, 1, 1]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <group ref={hips} position={[0, 0.95, 0]}>
        <mesh material={shorts} rotation-z={Math.PI / 2} scale={[0.85, 1, 0.8]}>
          {capsule(0.11, 0.12)}
        </mesh>

        <group ref={torso} rotation-x={0.22}>
          <mesh position={[0, 0.17, 0]} material={kit} scale={[1, 1, 0.75]}>
            {capsule(0.115, 0.14)}
          </mesh>
          <mesh position={[0, 0.4, 0]} material={kit} scale={[1.15, 1, 0.72]}>
            {capsule(0.14, 0.16)}
          </mesh>
          <mesh position={[0, 0.6, 0.01]} material={skin}>
            {capsule(0.042, 0.07)}
          </mesh>
          <mesh position={[0, 0.73, 0.03]} material={skin} scale={[0.9, 1.08, 1]}>
            <sphereGeometry args={[0.1, 24, 24]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.2, 0.5, 0]} material={kit}>
              <sphereGeometry args={[0.06, 16, 16]} />
            </mesh>
          ))}

          <group position={[-0.21, 0.5, 0]}>
            <Limb limbRef={armL} radius={0.045} length={0.29} material={skin}>
              <Limb limbRef={foreL} radius={0.038} length={0.27} material={skin} />
            </Limb>
          </group>
          <group position={[0.21, 0.5, 0]}>
            <Limb limbRef={armR} radius={0.045} length={0.29} material={skin}>
              <Limb limbRef={foreR} radius={0.038} length={0.27} material={skin} />
            </Limb>
          </group>
        </group>

        <group position={[-0.1, -0.04, 0]}>
          <Limb limbRef={thighL} radius={0.08} length={0.47} material={shorts}>
            <Limb limbRef={shinL} radius={0.055} length={0.47} material={skin}>
              {shoe}
            </Limb>
          </Limb>
        </group>
        <group position={[0.1, -0.04, 0]}>
          <Limb limbRef={thighR} radius={0.08} length={0.47} material={shorts}>
            <Limb limbRef={shinR} radius={0.055} length={0.47} material={skin}>
              {shoe}
            </Limb>
          </Limb>
        </group>
      </group>
    </group>
  )
}

export default Runner
