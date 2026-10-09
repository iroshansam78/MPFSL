import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D } from 'three'
import { COLORS, STAGE_Z, glow } from '../constants.js'

const Z = STAGE_Z.swim
const WATER_Y = -1
const POOL_SIZE = 52
const ROPE_XS = [-6, -3, 0, 3, 6]
const SWIMMER_LANES = [-4.5, -1.5, 1.5, 4.5]
const SWIMMER_SPEEDS = [5.2, 5.8, 5, 5.5]

// Same wave formula as the vertex shader, so floats and swimmers ride the surface.
const waveHeight = (x, y, t) =>
  Math.sin(x * 0.6 + t * 1.2) * 0.25 + Math.sin(y * 0.9 - t * 1.6) * 0.18 + Math.sin((x + y) * 1.7 + t * 2.1) * 0.06

const waterVertexShader = /* glsl */ `
  uniform float uTime;
  varying float vH;
  varying vec3 vPos;
  varying float vDepth;
  void main() {
    vec3 p = position;
    float h = sin(p.x*0.6 + uTime*1.2)*0.25 + sin(p.y*0.9 - uTime*1.6)*0.18 + sin((p.x+p.y)*1.7 + uTime*2.1)*0.06;
    p.z += h;
    vH = h; vPos = p;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  varying float vH;
  varying vec3 vPos;
  varying float vDepth;
  void main() {
    vec3 col = mix(uDeep, uShallow, smoothstep(-0.35, 0.45, vH) * 0.55);
    float caustic = pow(abs(sin(vPos.x*2.6 + uTime) * sin(vPos.y*2.6 - uTime*0.8)), 10.0);
    col += uShallow * caustic * 0.6;
    // pool floor lane markings seen through the water
    float lane = smoothstep(0.08, 0.0, abs(mod(vPos.x + 1.5, 3.0) - 1.5));
    col += vec3(0.05, 0.12, 0.2) * lane;
    float alpha = 1.0 - smoothstep(22.0, 40.0, vDepth);
    gl_FragColor = vec4(col, alpha);
  }
`

// Every lane-rope float as [x, distance along the pool].
function createFloats() {
  const floats = []
  for (const x of ROPE_XS) {
    for (let d = -POOL_SIZE / 2 + 2; d <= POOL_SIZE / 2 - 2; d += 0.5) floats.push([x, d])
  }
  return floats
}

// Stage 2: a wavy pool with bobbing lane ropes and four glowing swimmers racing down the lanes.
function SwimStage() {
  const water = useRef()
  const ropes = useRef()
  const swimmers = useRef([])
  const dummy = useMemo(() => new Object3D(), [])
  const floats = useMemo(() => createFloats(), [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new Color('#021a24') },
      uShallow: { value: new Color(COLORS.swim) },
    }),
    [],
  )

  // Colour the rope floats once: red near the walls, alternating teal/white elsewhere.
  const setupRopes = (mesh) => {
    if (!mesh) return
    ropes.current = mesh
    const color = new Color()
    floats.forEach(([, d], i) => {
      const nearWall = Math.abs(d) > POOL_SIZE / 2 - 7
      color.set(nearWall ? COLORS.laser : Math.floor(d * 2) % 4 < 2 ? COLORS.swim : '#ffffff')
      mesh.setColorAt(i, color)
    })
    mesh.instanceColor.needsUpdate = true
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    water.current.uniforms.uTime.value = t

    floats.forEach(([x, d], i) => {
      dummy.position.set(x, WATER_Y + waveHeight(x, -d, t) + 0.05, Z + d)
      dummy.updateMatrix()
      ropes.current.setMatrixAt(i, dummy.matrix)
    })
    ropes.current.instanceMatrix.needsUpdate = true

    swimmers.current.forEach((swimmer, i) => {
      if (!swimmer) return
      const x = SWIMMER_LANES[i]
      const d = ((t * SWIMMER_SPEEDS[i] + i * 7) % (POOL_SIZE - 6)) - (POOL_SIZE - 6) / 2
      swimmer.position.set(x, WATER_Y + waveHeight(x, d, t) + 0.08, Z - d)
    })
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, WATER_Y, Z]}>
        <planeGeometry args={[POOL_SIZE, POOL_SIZE, 160, 160]} />
        <shaderMaterial
          ref={water}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      <instancedMesh ref={setupRopes} args={[undefined, undefined, floats.length]} frustumCulled={false}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial roughness={0.3} emissive="#222" />
      </instancedMesh>

      {SWIMMER_LANES.map((_, i) => (
        <mesh key={i} ref={(el) => (swimmers.current[i] = el)} rotation-x={Math.PI / 2}>
          <capsuleGeometry args={[0.12, 0.9, 6, 12]} />
          <meshBasicMaterial color={glow(i === 1 ? COLORS.gold : '#e8fffb', 2.4)} toneMapped={false} />
        </mesh>
      ))}

      <pointLight position={[0, 4, Z]} intensity={30} distance={30} color={COLORS.swim} />
    </group>
  )
}

export default SwimStage
