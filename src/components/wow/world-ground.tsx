import { useEffect, useMemo, useRef } from "react"
import { useLoader } from "@react-three/fiber"
import * as THREE from "three"

import { GROUND_MAP } from "@/data/ground-map"
import { WORLD_CONFIG } from "@/lib/world-config"

interface WorldGroundProps {
  isDark: boolean
}

/**
 * The ground is built as one small tile per "on" cell of `GROUND_MAP`
 * (extracted from a reference dot-art image), not a flat plane — per the
 * user's own request to recreate that pixel art using the same square
 * building blocks the ground already used. A single `InstancedMesh` keeps
 * the ~1,300 tiles to one draw call; every tile shares the same 16px
 * pixel-art texture (tinted per theme) instead of a flat color.
 */
export function WorldGround({ isDark }: WorldGroundProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { cellSize, tileHeight, textureSrc, colorLight, colorDark } = WORLD_CONFIG.ground
  const tint = isDark ? colorDark : colorLight
  const texture = useLoader(THREE.TextureLoader, textureSrc)

  // Crisp pixel-art sampling — same reasoning as `pixel-sprite-billboard.tsx`:
  // CSS `image-rendering: pixelated` has no effect on WebGL, so the filter
  // must be set on the texture object itself.
  useEffect(() => {
    /* eslint-disable react-hooks/immutability -- texture config objects are meant to be mutated after load; no ref-based escape hatch exists for non-ref hook results (see pixel-sprite-billboard.tsx for the same pattern). */
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    /* eslint-enable react-hooks/immutability */
  }, [texture])

  const positions = useMemo(() => {
    const rows = GROUND_MAP.length
    const cols = GROUND_MAP[0]?.length ?? 0
    const originX = -((cols - 1) * cellSize) / 2
    const originZ = -((rows - 1) * cellSize) / 2

    const cells: [number, number][] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (GROUND_MAP[r][c] === "1") {
          cells.push([originX + c * cellSize, originZ + r * cellSize])
        }
      }
    }
    return cells
  }, [cellSize])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    positions.forEach(([x, z], index) => {
      matrix.setPosition(x, -tileHeight / 2, z)
      mesh.setMatrixAt(index, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [positions, tileHeight])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
      <boxGeometry args={[cellSize * 1.02, tileHeight, cellSize * 1.02]} />
      <meshStandardMaterial map={texture} color={tint} />
    </instancedMesh>
  )
}
