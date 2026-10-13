import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector2 } from 'three'
import { flatTexture } from './loadSlides.js'
import { fragmentShader, vertexShader } from './shaders.js'

const TRANSITION_SECONDS = 1.6
const TRANSITION_SECONDS_REDUCED = 0.6

// Full-screen shader plane that transitions to slide `index` whenever it changes,
// following the mouse (or phone tilt) for a subtle parallax.
function SlideshowPlane({ slides, index, reduced }) {
  const material = useRef()
  const size = useThree((state) => state.size)
  const motion = useRef({
    from: index,
    to: index,
    mix: 1,
    ageA: 0,
    ageB: 0,
    pointer: new Vector2(),
    target: new Vector2(),
  })

  const uniforms = useMemo(
    () => ({
      uImgA: { value: flatTexture },
      uDepA: { value: flatTexture },
      uImgB: { value: flatTexture },
      uDepB: { value: flatTexture },
      uAspectA: { value: new Vector2(1.5, 0) },
      uAspectB: { value: new Vector2(1.5, 0) },
      uFocusA: { value: new Vector2(0.5, 0.5) },
      uFocusB: { value: new Vector2(0.5, 0.5) },
      uView: { value: 1 },
      uMix: { value: 1 },
      uAgeA: { value: 0 },
      uAgeB: { value: 0 },
      uPointer: { value: new Vector2() },
      uStrength: { value: 0.022 },
    }),
    [],
  )

  // Pointer / device tilt → parallax target (-1..1)
  useEffect(() => {
    const m = motion.current
    const onPointer = (e) => m.target.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
    const onTilt = (e) => {
      if (e.gamma == null) return
      m.target.set(MathUtils.clamp(e.gamma / 25, -1, 1), MathUtils.clamp((e.beta - 45) / 25, -1, 1))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [])

  // Start a transition when the active slide changes
  useEffect(() => {
    const m = motion.current
    if (index === m.to) return
    m.from = m.to
    m.to = index
    m.mix = 0
    m.ageA = m.ageB
    m.ageB = 0
  }, [index])

  useFrame((state, delta) => {
    const m = motion.current
    const u = material.current.uniforms
    const a = slides[m.from] || slides[0]
    const b = slides[m.to] || slides[0]
    if (!a || !b) return

    m.mix = Math.min(1, m.mix + delta / (reduced ? TRANSITION_SECONDS_REDUCED : TRANSITION_SECONDS))
    m.ageA += delta
    m.ageB += delta

    // idle drift so the photo keeps breathing even without mouse movement
    const t = state.clock.elapsedTime
    const drift = reduced ? 0 : 1
    const tx = m.target.x + Math.sin(t * 0.23) * 0.35 * drift
    const ty = m.target.y + Math.cos(t * 0.17) * 0.25 * drift
    m.pointer.x = MathUtils.damp(m.pointer.x, reduced ? 0 : tx, 2.5, delta)
    m.pointer.y = MathUtils.damp(m.pointer.y, reduced ? 0 : ty, 2.5, delta)

    u.uImgA.value = a.img
    u.uDepA.value = a.dep
    u.uImgB.value = b.img
    u.uDepB.value = b.dep
    u.uAspectA.value.set(a.aspect, a.hasDepth)
    u.uAspectB.value.set(b.aspect, b.hasDepth)
    u.uFocusA.value.set(...(a.focus || [0.5, 0.5]))
    u.uFocusB.value.set(...(b.focus || [0.5, 0.5]))
    u.uView.value = size.width / size.height
    u.uMix.value = m.mix * m.mix * (3 - 2 * m.mix)
    u.uAgeA.value = reduced ? 0 : m.ageA
    u.uAgeB.value = reduced ? 0 : m.ageB
    u.uPointer.value.copy(m.pointer)
    u.uStrength.value = size.width < 760 ? 0.016 : 0.022
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
      />
    </mesh>
  )
}

export default SlideshowPlane
