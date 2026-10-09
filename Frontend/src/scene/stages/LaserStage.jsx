import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { EllipseCurve, Vector3 } from 'three'
import { COLORS, STAGE_Z, glow } from '../constants.js'

const TARGET_Z = STAGE_Z.laser - 2
const TRACK = { y: -1.6, z: STAGE_Z.laser - 8, rx: 9, rz: 4 }
const BULLSEYE_RADIUS = 0.45
const UP = new Vector3(0, 1, 0)
const MUZZLE_OFFSET = new Vector3(0.45, -0.35, -1)
const TRAIL_LENGTH = 10
const RUNNERS = 4
const TARGET_RINGS = [0.55, 0.8, 1.05, 1.25]

const laneRadius = (lane) => ({ x: TRACK.rx + lane * 0.45, z: TRACK.rz + lane * 0.45 })

function createLaneLines() {
  return [0, 1, 2, 3, 4, 5].map((lane) => {
    const { x, z } = laneRadius(lane)
    return new EllipseCurve(0, 0, x, z).getPoints(120).map((p) => [p.x, 0, p.y])
  })
}

// Stage 4: a clickable shooting target with a laser beam, plus an oval track of runners with light trails.
// onShot(hit) is called after every shot.
function LaserStage({ onShot }) {
  const target = useRef()
  const bullseye = useRef()
  const beam = useRef()
  const beamLife = useRef(0)
  const hitFlash = useRef(0)
  const runners = useRef([])
  const laneLines = useMemo(() => createLaneLines(), [])

  const fire = (event) => {
    event.stopPropagation()
    const camera = event.camera
    const muzzle = camera.position.clone().add(MUZZLE_OFFSET.clone().applyQuaternion(camera.quaternion))
    const impact = event.point.clone()
    const direction = impact.clone().sub(muzzle)
    const distance = direction.length()

    beam.current.position.copy(muzzle).add(impact).multiplyScalar(0.5)
    beam.current.quaternion.setFromUnitVectors(UP, direction.normalize())
    beam.current.scale.set(1, distance, 1)
    beamLife.current = 1

    const local = target.current.worldToLocal(event.point.clone())
    const hit = Math.hypot(local.x, local.y) < BULLSEYE_RADIUS
    if (hit) hitFlash.current = 1
    onShot?.(hit)
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    beamLife.current = Math.max(0, beamLife.current - delta * 4)
    hitFlash.current = Math.max(0, hitFlash.current - delta * 1.2)

    beam.current.material.opacity = beamLife.current
    beam.current.visible = beamLife.current > 0
    bullseye.current.material.color.copy(
      hitFlash.current > 0
        ? glow(COLORS.run, 1 + hitFlash.current * 3)
        : glow(COLORS.laser, 1.2 + Math.sin(t * 4) * 0.3),
    )

    runners.current.forEach((runner, i) => {
      if (!runner) return
      const { x: rx, z: rz } = laneRadius(i + 1)
      runner.children.forEach((dot, j) => {
        const angle = t * (0.55 + i * 0.04) + i - j * 0.025
        dot.position.set(Math.cos(angle) * rx, 0.15, Math.sin(angle) * rz)
      })
    })
  })

  return (
    <group>
      {/* target */}
      <group ref={target} position={[0, 0.6, TARGET_Z]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[3, 3, 0.08]} />
          <meshStandardMaterial color="#15171d" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh
          onClick={fire}
          onPointerOver={() => (document.body.style.cursor = 'crosshair')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          <circleGeometry args={[1.25, 64]} />
          <meshStandardMaterial color="#0b0c10" />
        </mesh>
        {TARGET_RINGS.map((r) => (
          <mesh key={r} position={[0, 0, 0.005]}>
            <ringGeometry args={[r - 0.02, r, 96]} />
            <meshBasicMaterial color={glow('#ffffff', 1.3)} toneMapped={false} />
          </mesh>
        ))}
        <mesh ref={bullseye} position={[0, 0, 0.01]}>
          <circleGeometry args={[0.3, 48]} />
          <meshBasicMaterial toneMapped={false} />
        </mesh>
      </group>

      {/* laser beam (stretched along its path when fired) */}
      <mesh ref={beam} visible={false}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshBasicMaterial color={glow(COLORS.laser, 5)} transparent toneMapped={false} depthWrite={false} />
      </mesh>

      {/* oval running track */}
      <group position={[0, TRACK.y, TRACK.z]}>
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[TRACK.rx - 0.4, TRACK.rx + 3, 96]} />
          <meshStandardMaterial color="#2a0d14" roughness={0.9} />
        </mesh>
        {laneLines.map((points, i) => (
          <Line key={i} points={points} color="#ffffff" lineWidth={1} transparent opacity={0.35} />
        ))}
        {Array.from({ length: RUNNERS }, (_, i) => (
          <group key={i} ref={(el) => (runners.current[i] = el)}>
            {Array.from({ length: TRAIL_LENGTH }, (_, j) => (
              <mesh key={j} scale={1 - j / TRAIL_LENGTH}>
                <sphereGeometry args={[0.13, 12, 12]} />
                <meshBasicMaterial
                  color={glow(i === 0 ? COLORS.gold : COLORS.run, 3)}
                  transparent
                  opacity={1 - j / TRAIL_LENGTH}
                  toneMapped={false}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <pointLight position={[0, 3, STAGE_Z.laser]} intensity={20} distance={25} color={COLORS.laser} />
    </group>
  )
}

export default LaserStage
