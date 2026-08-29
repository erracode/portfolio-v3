import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import { PLAYER_SPRITE } from "@/data/sprites"
import { useCombatStore } from "@/lib/combat-store"
import type { MovementInput } from "@/lib/use-movement-input"
import { WORLD_CONFIG } from "@/lib/world-config"

const PLAYER_SCALE = 0.006
const SPRITE_HEIGHT = PLAYER_SPRITE.frameHeight * PLAYER_SCALE
const UP = new THREE.Vector3(0, 1, 0)
const FLIP_THRESHOLD = 0.1

interface WorldPlayerProps extends Pick<MovementInput, "movementRef" | "interactPressedRef"> {
  positionRef: RefObject<THREE.Vector3>
  onNearNpcChange: (isNear: boolean) => void
  onInteract: () => void
}

/**
 * The playable character: a `PixelSpriteBillboard` moved via camera-relative
 * WASD input (math reused from portfolio-v2's proven approach), clamped to
 * the sandbox bounds instead of walking an infinite plane. Position is
 * mutated directly on `positionRef`/the group's `.position` inside
 * `useFrame` — never through React state — so movement never triggers a
 * re-render; only the (rare) idle/walk + facing-direction transitions do.
 */
export function WorldPlayer({
  positionRef,
  movementRef,
  interactPressedRef,
  onNearNpcChange,
  onInteract,
}: WorldPlayerProps) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const [moving, setMoving] = useState(false)
  const [flipX, setFlipX] = useState(false)
  const wasNearRef = useRef(false)

  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const input = useRef(new THREE.Vector3())
  const npcPosition = useRef(
    new THREE.Vector3(
      WORLD_CONFIG.npc.position.x,
      WORLD_CONFIG.npc.position.y,
      WORLD_CONFIG.npc.position.z
    )
  )

  useEffect(() => {
    useCombatStore.getState().registerPlayerPositionRef(positionRef)
  }, [positionRef])

  useFrame((_state, delta) => {
    const flags = movementRef.current

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.crossVectors(forward.current, UP).normalize()

    input.current.set(0, 0, 0)
    if (flags.forward) input.current.add(forward.current)
    if (flags.backward) input.current.sub(forward.current)
    if (flags.left) input.current.sub(right.current)
    if (flags.right) input.current.add(right.current)

    const isMoving = input.current.lengthSq() > 0
    if (isMoving) {
      input.current.normalize()

      // Screen-relative flip: the sign of the movement direction's
      // component along the camera's CURRENT right vector — not raw
      // world-space x, which only matched "left/right on screen" while
      // the camera sat at its fixed default orientation. Now that the
      // camera free-orbits, world x can point anywhere relative to the
      // screen, so this must be re-derived from `right.current` every
      // frame. Checked on the normalized (unit-length) vector, before
      // it's scaled by speed*delta below — that scaled magnitude
      // (~0.02-0.08 at typical frame times) never cleared
      // FLIP_THRESHOLD, which silently made the flip nearly never fire.
      const rightComponent = input.current.dot(right.current)
      if (Math.abs(rightComponent) > FLIP_THRESHOLD) {
        const nextFlip = rightComponent < 0
        setFlipX((current) => (current === nextFlip ? current : nextFlip))
      }

      input.current.multiplyScalar(WORLD_CONFIG.movement.speed * delta)
      positionRef.current.add(input.current)
      positionRef.current.x = THREE.MathUtils.clamp(
        positionRef.current.x,
        -WORLD_CONFIG.bounds.halfWidth,
        WORLD_CONFIG.bounds.halfWidth
      )
      positionRef.current.z = THREE.MathUtils.clamp(
        positionRef.current.z,
        -WORLD_CONFIG.bounds.halfDepth,
        WORLD_CONFIG.bounds.halfDepth
      )
    }
    setMoving((current) => (current === isMoving ? current : isMoving))

    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current)
    }

    const isNear =
      positionRef.current.distanceTo(npcPosition.current) <=
      WORLD_CONFIG.npc.interactRadius
    if (isNear !== wasNearRef.current) {
      wasNearRef.current = isNear
      onNearNpcChange(isNear)
    }

    if (interactPressedRef.current) {
      interactPressedRef.current = false
      if (isNear) onInteract()
    }
  })

  const activeRow = moving ? PLAYER_SPRITE.rows.walk : PLAYER_SPRITE.rows.idle

  return (
    <group ref={groupRef}>
      <PixelSpriteBillboard
        sheet={PLAYER_SPRITE}
        row={activeRow.row}
        frameCount={activeRow.frameCount}
        fps={moving ? 6 : 2}
        flipX={flipX}
        scale={PLAYER_SCALE}
        position={[0, SPRITE_HEIGHT / 2, 0]}
      />
    </group>
  )
}
