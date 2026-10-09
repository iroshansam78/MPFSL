import { useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Vector3 } from 'three'
import { glow } from '../constants.js'

const COUNT = 140

// Particle burst with gravity. Call ref.current.burst(worldPosition) to fire it.
function Sparks({ ref, color = '#ffd27a' }) {
  const points = useRef()
  const material = useRef()
  const state = useMemo(
    () => ({ pos: new Float32Array(COUNT * 3), vel: new Float32Array(COUNT * 3), life: 0 }),
    [],
  )

  useImperativeHandle(ref, () => ({
    burst(worldPosition) {
      const origin = points.current.parent.worldToLocal(worldPosition.clone())
      for (let i = 0; i < COUNT; i++) {
        state.pos.set([origin.x, origin.y, origin.z], i * 3)
        const v = new Vector3().randomDirection().multiplyScalar(2 + Math.random() * 5)
        state.vel.set([v.x, v.y + 1.5, v.z], i * 3)
      }
      state.life = 1
    },
  }))

  useFrame((_, delta) => {
    if (state.life <= 0) return
    state.life = Math.max(0, state.life - delta * 1.6)
    for (let i = 0; i < COUNT; i++) {
      state.vel[i * 3 + 1] -= 9.8 * delta * 0.6
      state.pos[i * 3] += state.vel[i * 3] * delta
      state.pos[i * 3 + 1] += state.vel[i * 3 + 1] * delta
      state.pos[i * 3 + 2] += state.vel[i * 3 + 2] * delta
    }
    points.current.geometry.attributes.position.needsUpdate = true
    material.current.opacity = state.life
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[state.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        size={0.06}
        color={glow(color, 3)}
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

export default Sparks
