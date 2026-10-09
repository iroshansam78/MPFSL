import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Only renders its children while the camera is within `range` units of the stage at `z`.
function StageGroup({ z, range = 70, children }) {
  const group = useRef()

  useFrame(({ camera }) => {
    group.current.visible = Math.abs(camera.position.z - z) < range
  })

  return <group ref={group}>{children}</group>
}

export default StageGroup
