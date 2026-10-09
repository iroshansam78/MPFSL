import { Color } from 'three'

export { COLORS } from '../constants/colors.js'

// Z position of each stage along the journey; the camera flies from 0 towards -250.
export const STAGE_Z = {
  hero: 0,
  fencing: -50,
  swim: -100,
  obstacle: -150,
  laser: -200,
  finale: -250,
}

// Hero running track: floor height and how fast it scrolls towards the camera.
export const TRACK_Y = -1.4
export const RUN_SPEED = 9

// Camera keyframes: `t` is journey scroll progress (0 → 1).
export const CAMERA_PATH = [
  { t: 0, pos: [0, -0.25, 9], look: [0.6, 0.05, 0] },
  { t: 0.2, pos: [1.4, 1.1, -44.5], look: [0, 0.35, -50] },
  { t: 0.4, pos: [0, 2.2, -90], look: [0, -0.6, -102] },
  { t: 0.6, pos: [0, 1.2, -140], look: [0, 1.2, -165] },
  { t: 0.8, pos: [0, 0.8, -192], look: [0, 0.4, -202] },
  { t: 1, pos: [0, 0.2, -241], look: [0, 0.2, -252] },
]

// Shared, mutable per-frame value: how fast the camera is moving (0 → 1). Drives FOV and speed lines.
export const cameraMotion = { speed: 0 }

// A colour pushed above 1.0 so the bloom pass makes it glow.
export const glow = (color, intensity = 2) => new Color(color).multiplyScalar(intensity)
