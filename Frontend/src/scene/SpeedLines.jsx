import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { cameraMotion } from './constants.js'

const COUNT = 350

function createStreaks() {
  return Array.from({ length: COUNT }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 10
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.6,
      z: -Math.random() * 60,
      speed: 0.5 + Math.random(),
    }
  })
}

// Thin streaks around the camera that stretch and brighten when scrolling fast.
function SpeedLines() {
  const mesh = useRef()
  const material = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const streaks = useMemo(() => createStreaks(), [])

  useFrame((state, delta) => {
    const cam = state.camera.position
    const speed = cameraMotion.speed

    for (let i = 0; i < COUNT; i++) {
      const s = streaks[i]
      s.z += delta * (2 + speed * 90) * s.speed
      if (s.z > 4) s.z -= 64
      dummy.position.set(cam.x + s.x, cam.y + s.y, cam.z + s.z)
      dummy.scale.set(1, 1, 0.4 + speed * 8)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    material.current.opacity = 0.08 + speed * 0.6
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.015, 0.015, 1]} />
      <meshBasicMaterial ref={material} color="#cfe3ff" transparent depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

export default SpeedLines
