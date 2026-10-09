import { AdditiveBlending } from 'three'
import { useGlowTexture } from '../textures.js'

// Large warm haze behind the runner.
function GlowSprite({ position }) {
  const texture = useGlowTexture()

  return (
    <sprite position={position} scale={[22, 14, 1]}>
      <spriteMaterial
        map={texture}
        color="#ffcf91"
        transparent
        opacity={0.45}
        blending={AdditiveBlending}
        depthWrite={false}
        fog={false}
      />
    </sprite>
  )
}

export default GlowSprite
