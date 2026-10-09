import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { journeyScroll } from '../utils/journeyScroll.js'
import { CAMERA_PATH, cameraMotion } from './constants.js'

const scratch = new Vector3()

// Writes the camera position/target for progress `t` (0 → 1) into `pos` and `look`, easing between keyframes.
function sampleCameraPath(t, pos, look) {
  t = MathUtils.clamp(t, 0, 1)
  let i = 0
  while (i < CAMERA_PATH.length - 2 && t > CAMERA_PATH[i + 1].t) i++

  const from = CAMERA_PATH[i]
  const to = CAMERA_PATH[i + 1]
  let k = (t - from.t) / (to.t - from.t)
  k = k * k * (3 - 2 * k) // smoothstep

  pos.set(...from.pos).lerp(scratch.set(...to.pos), k)
  look.set(...from.look).lerp(scratch.set(...to.look), k)
}

// Flies the camera along CAMERA_PATH as the page scrolls, with a little mouse parallax and
// a FOV kick when moving fast. Also publishes --progress and <body data-section> for the HUD.
function CameraRig() {
  const progress = useRef(0)
  const lookAt = useRef(new Vector3())
  const previous = useRef(0)
  const section = useRef(-1)
  const targetPos = useMemo(() => new Vector3(), [])
  const targetLook = useMemo(() => new Vector3(), [])

  useFrame((state, delta) => {
    progress.current = MathUtils.damp(progress.current, journeyScroll.progress, 7, delta)
    const t = progress.current

    sampleCameraPath(t, targetPos, targetLook)
    targetPos.x += state.pointer.x * 0.5
    targetPos.y += state.pointer.y * 0.3

    const follow = 1 - Math.exp(-8 * delta)
    state.camera.position.lerp(targetPos, follow)
    lookAt.current.lerp(targetLook, follow)
    state.camera.lookAt(lookAt.current)

    const velocity = Math.abs(t - previous.current) / Math.max(delta, 0.001)
    previous.current = t
    cameraMotion.speed = MathUtils.damp(cameraMotion.speed, Math.min(velocity * 3, 1), 6, delta)
    state.camera.fov = 50 + cameraMotion.speed * 22
    state.camera.updateProjectionMatrix()

    document.documentElement.style.setProperty('--progress', t.toFixed(4))
    const current = Math.round(t * 5)
    if (current !== section.current) {
      section.current = current
      document.body.dataset.section = current
    }
  })

  return null
}

export default CameraRig
