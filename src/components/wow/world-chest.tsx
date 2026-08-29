import { useRef } from "react"
import type { RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { play } from "cuelume"
import * as THREE from "three"

import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useCombatStore } from "@/lib/combat-store"
import { useLogStore } from "@/lib/log-store"
import { useObjectiveDone, useQuestStore } from "@/lib/quest-store"
import { WORLD_CONFIG } from "@/lib/world-config"

function chestSheet(src: string): SpriteSheetConfig {
  return {
    src,
    frameWidth: 254,
    frameHeight: 254,
    sheetWidth: 254,
    sheetHeight: 254,
    rows: { idle: { row: 0, frameCount: 1 }, walk: { row: 0, frameCount: 1 } },
  }
}

const CHEST_CLOSED_SHEET = chestSheet("/game/chest-closed.png")
const CHEST_OPEN_SHEET = chestSheet("/game/chest-open.png")
// Matches PLAYER_SCALE/NPC_SCALE's frameHeight*scale=1.5 convention (both
// sprites are 250px tall) so the chest reads at the same in-world scale as
// everything standing next to it, instead of the previous 0.012 which — at
// this sheet's 254px frame — rendered roughly 2x a guard's height.
const CHEST_SCALE = 0.006

interface WorldChestProps {
  interactPressedRef: RefObject<boolean>
  onNearChange: (isNear: boolean) => void
}

function guardsCleared(): boolean {
  const enemies = Object.values(useCombatStore.getState().enemies)
  return enemies.length > 0 && enemies.every((enemy) => enemy.isDead)
}

/**
 * Proximity + "E" interaction. Receives `interactPressedRef` as a prop from
 * `world-scene.tsx` — the same single `useMovementInput()` instance shared
 * with `WorldPlayer` — so both the keyboard "E" key and the mobile touch
 * "Interactuar" button reach the chest, not just the NPC.
 */
export function WorldChest({ interactPressedRef, onNearChange }: WorldChestProps) {
  const wasNearRef = useRef(false)
  const isOpen = useObjectiveDone("open-chest")

  const { x, y, z } = WORLD_CONFIG.chest.position
  const chestPosition = useRef(new THREE.Vector3(x, y, z))

  function attemptOpen() {
    if (isOpen) return
    if (!guardsCleared()) {
      play("error")
      useLogStore
        .getState()
        .addLog("system", "Los guardias custodian el cofre. Derrótalos primero.")
      return
    }

    useQuestStore.getState().completeObjectiveIfAccepted("open-chest")
    play("sparkle")
    useLogStore.getState().addLog("loot", "Obtuviste: Reliquia del Cofre")
  }

  useFrame(() => {
    const playerPosition = useCombatStore.getState().playerPositionRef?.current
    if (!playerPosition) return

    const isNear =
      playerPosition.distanceTo(chestPosition.current) <= WORLD_CONFIG.chest.interactRadius
    if (isNear !== wasNearRef.current) {
      wasNearRef.current = isNear
      onNearChange(isNear)
    }

    if (interactPressedRef.current) {
      interactPressedRef.current = false
      if (isNear) attemptOpen()
    }
  })

  const spriteHeight = CHEST_CLOSED_SHEET.frameHeight * CHEST_SCALE

  return (
    <PixelSpriteBillboard
      sheet={isOpen ? CHEST_OPEN_SHEET : CHEST_CLOSED_SHEET}
      row={0}
      frameCount={1}
      scale={CHEST_SCALE}
      position={[x, y + spriteHeight / 2, z]}
    />
  )
}
