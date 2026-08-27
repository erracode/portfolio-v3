import { WORLD_CONFIG } from "@/lib/world-config"

interface WorldGroundProps {
  isDark: boolean
}

/** Flat sandbox ground + a grid overlay reinforcing the walkable bounds —
 * deliberately minimal (no terrain, no skybox) per the "very limited
 * sandbox" scope for this pass. */
export function WorldGround({ isDark }: WorldGroundProps) {
  const { size, colorLight, colorDark } = WORLD_CONFIG.ground
  const groundColor = isDark ? colorDark : colorLight
  const gridColor = isDark ? "#1a2417" : "#4a6b3d"

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>
      <gridHelper args={[size, size / 2, gridColor, gridColor]} position={[0, 0.01, 0]} />
    </group>
  )
}
