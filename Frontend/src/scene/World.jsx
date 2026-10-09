import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { COLORS, STAGE_Z } from './constants.js'
import CameraRig from './CameraRig.jsx'
import SpeedLines from './SpeedLines.jsx'
import StageGroup from './StageGroup.jsx'
import HeroStage from './stages/HeroStage.jsx'
import FencingStage from './stages/FencingStage.jsx'
import SwimStage from './stages/SwimStage.jsx'
import ObstacleStage from './stages/ObstacleStage.jsx'
import LaserStage from './stages/LaserStage.jsx'
import FinaleStage from './stages/FinaleStage.jsx'
import './World.css'

// Full-screen fixed 3D background. `paused` stops rendering once the visitor is deep in the content.
function World({ onShot, paused }) {
  return (
    <Canvas
      className="world"
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.4, 11], fov: 50, near: 0.1, far: 200 }}
    >
      <color attach="background" args={[COLORS.bg]} />
      <fog attach="fog" args={[COLORS.bg, 16, 58]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />

      <Environment resolution={128}>
        <Lightformer intensity={3} position={[0, 5, -4]} scale={[12, 2, 1]} />
        <Lightformer intensity={2} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} color={COLORS.fencing} />
        <Lightformer intensity={1.5} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} color={COLORS.gold} />
      </Environment>

      <Suspense fallback={null}>
        <CameraRig />
        <SpeedLines />
        <StageGroup z={STAGE_Z.hero}>
          <HeroStage />
        </StageGroup>
        <StageGroup z={STAGE_Z.fencing}>
          <FencingStage />
        </StageGroup>
        <StageGroup z={STAGE_Z.swim}>
          <SwimStage />
        </StageGroup>
        <StageGroup z={STAGE_Z.obstacle} range={80}>
          <ObstacleStage />
        </StageGroup>
        <StageGroup z={STAGE_Z.laser}>
          <LaserStage onShot={onShot} />
        </StageGroup>
        <StageGroup z={STAGE_Z.finale}>
          <FinaleStage />
        </StageGroup>

        <EffectComposer>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.65} luminanceSmoothing={0.2} />
          <Vignette darkness={0.65} offset={0.25} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}

export default World
