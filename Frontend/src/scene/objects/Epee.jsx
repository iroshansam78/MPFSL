import { DoubleSide } from 'three'
import { COLORS, glow } from '../constants.js'

// Fencing épée lying along +X: blade, bell guard, grip, pommel and a glowing tip.
function Epee() {
  const steel = <meshStandardMaterial color="#e3e9f0" metalness={1} roughness={0.15} />

  return (
    <group>
      <mesh position={[1.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.022, 3, 8]} />
        {steel}
      </mesh>
      <mesh position={[-0.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.27, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
        <meshStandardMaterial color="#cfd6de" metalness={1} roughness={0.25} side={DoubleSide} />
      </mesh>
      <mesh position={[-0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.6} />
      </mesh>
      <mesh position={[-0.66, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        {steel}
      </mesh>
      <mesh position={[3.06, 0, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={glow(COLORS.fencing, 4)} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default Epee
