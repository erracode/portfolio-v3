import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"

const AXE_FRAME_COUNT = 8
const AXE_SCALE = 0.012

const AXE_SHEET: SpriteSheetConfig = {
  src: "/game/axe-sheet.png",
  frameWidth: 220,
  frameHeight: 220,
  sheetWidth: 1760,
  sheetHeight: 220,
  rows: {
    idle: { row: 0, frameCount: AXE_FRAME_COUNT },
    walk: { row: 0, frameCount: AXE_FRAME_COUNT },
  },
}

interface AxeProjectileProps {
  from: [number, number, number]
  to: [number, number, number]
  startedAt: number
  durationMs: number
  onDone: () => void
}

/**
 * Lerps a spinning axe from `from` to `to` over `durationMs`, then calls
 * `onDone` so the parent removes it — a bounded lifetime by construction,
 * fixing v2's axe projectile that never despawned.
 */
export function AxeProjectile({ from, to, startedAt, durationMs, onDone }: AxeProjectileProps) {
  const groupRef = useRef<THREE.Group>(null)
  const fromVec = useMemo(() => new THREE.Vector3(...from), [from])
  const toVec = useMemo(() => new THREE.Vector3(...to), [to])
  const doneRef = useRef(false)

  useFrame(() => {
    if (doneRef.current) return

    const t = THREE.MathUtils.clamp((Date.now() - startedAt) / durationMs, 0, 1)
    if (groupRef.current) groupRef.current.position.lerpVectors(fromVec, toVec, t)

    if (t >= 1) {
      doneRef.current = true
      onDone()
    }
  })

  return (
    <group ref={groupRef} position={from}>
      <PixelSpriteBillboard sheet={AXE_SHEET} row={0} frameCount={AXE_FRAME_COUNT} fps={24} scale={AXE_SCALE} />
    </group>
  )
}
