import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useWindowsStore } from "@/lib/windows-store"
import { WORLD_CONFIG } from "@/lib/world-config"

const ZEPPELIN_SPRITE: SpriteSheetConfig = {
  src: "/game/contact-sprite.png",
  frameWidth: 300,
  frameHeight: 150,
  sheetWidth: 1500,
  sheetHeight: 150,
  rows: {
    idle: { row: 0, frameCount: 5 },
    walk: { row: 0, frameCount: 5 },
  },
}

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Ambient background decoration ported from the sibling portfolio-v2
 * engine's `ZeppelinEntity`: floats slowly within a bounded patch of sky,
 * bouncing off its boundary and periodically turning by a small random
 * angle. Clicking it opens the Social & Contact window — the same purpose
 * the `contact-sprite.png` asset and v2's own click handler already
 * implied, now handled by r3f's built-in pointer events instead of v2's
 * manual `window.addEventListener("click")` + raycast.
 */
export function WorldZeppelin() {
  const groupRef = useRef<THREE.Group>(null)
  const { startPosition, speed, turnInterval, boundarySize, scale } = WORLD_CONFIG.zeppelin

  const position = useRef(
    new THREE.Vector3(startPosition.x, startPosition.y, startPosition.z)
  )
  const direction = useRef(new THREE.Vector3(1, 0, 0))
  const turnTimer = useRef(0)

  useFrame((_state, delta) => {
    turnTimer.current += delta
    if (turnTimer.current >= turnInterval) {
      turnTimer.current = 0
      const randomAngle = (Math.random() - 0.5) * (Math.PI / 2)
      direction.current.applyAxisAngle(UP, randomAngle).normalize()
    }

    position.current.addScaledVector(direction.current, speed * delta)

    if (Math.abs(position.current.x) > boundarySize) direction.current.x *= -1
    if (Math.abs(position.current.z) > boundarySize) direction.current.z *= -1

    if (groupRef.current) {
      groupRef.current.position.copy(position.current)
    }
  })

  return (
    <group ref={groupRef}>
      <PixelSpriteBillboard
        sheet={ZEPPELIN_SPRITE}
        row={ZEPPELIN_SPRITE.rows.idle.row}
        frameCount={ZEPPELIN_SPRITE.rows.idle.frameCount}
        fps={5}
        scale={scale}
        onClick={() => useWindowsStore.getState().openWindow("social")}
      />
    </group>
  )
}
