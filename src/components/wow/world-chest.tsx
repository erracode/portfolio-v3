import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { play } from "cuelume"
import * as THREE from "three"

import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useCombatStore } from "@/lib/combat-store"
import { useInventoryStore } from "@/lib/inventory-store"
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

// No lid-opening frame sheet exists (only 2 static frames), so the closed
// -> open texture swap is sold with a stylized scale "pop" + tint flash
// instead of a real flipbook — same "bounded lifetime, self-resetting"
// idiom as `hitFlash` in world-guard.tsx / the lerp in axe-projectile.tsx.
const CHEST_POP_DURATION_MS = 350
// Two motion beats: rising to the peak (opening flourish) and falling back
// to rest (settle bounce) — sin(t*PI) traces exactly that shape over t in
// [0, 1], peaking at +15% around the midpoint.
const CHEST_POP_MAGNITUDE = 0.15
const CHEST_POP_SETTLE_T = 0.5
const CHEST_TINT_FLASH_MS = 180
const CHEST_TINT = "#ffe066"

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

  const groupRef = useRef<THREE.Group>(null)
  const wasOpenRef = useRef(isOpen)
  const popStartedAtRef = useRef<number | null>(null)
  const settleBeatPlayedRef = useRef(false)
  const tintFlashTimeoutRef = useRef<number | null>(null)
  const [tintFlash, setTintFlash] = useState(false)

  useEffect(() => {
    return () => {
      if (tintFlashTimeoutRef.current !== null) window.clearTimeout(tintFlashTimeoutRef.current)
    }
  }, [])

  function attemptOpen() {
    // `isOpen` above is a stale render-closure snapshot — zustand's `set()`
    // notifies subscribers synchronously, but React only re-renders (and
    // thus rebinds this closure) on its own async schedule. Multiple
    // `attemptOpen()` calls landing within that window would otherwise all
    // see `isOpen = false` and re-run the grant logic, duplicating the
    // "[Loot]" log line. Reading the store directly bypasses that lag.
    if (useQuestStore.getState().objectives["open-chest"]) return
    if (!guardsCleared()) {
      play("error")
      useLogStore
        .getState()
        .addLog("system", "Los guardias custodian el cofre. Derrótalos primero.")
      return
    }

    useQuestStore.getState().completeObjectiveIfAccepted("open-chest")
    useInventoryStore.getState().addItem("relic", "Reliquia del Cofre")
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

    // Only consume the shared flag when actually near — `WorldPlayer` reads
    // the same ref for the NPC, and an unconditional reset here would
    // swallow a press meant for the NPC (or vice versa) depending on which
    // component's `useFrame` happens to run first that frame.
    if (interactPressedRef.current && isNear) {
      interactPressedRef.current = false
      attemptOpen()
    }

    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true
      popStartedAtRef.current = Date.now()
      settleBeatPlayedRef.current = false
      play("toggle")

      setTintFlash(true)
      if (tintFlashTimeoutRef.current !== null) window.clearTimeout(tintFlashTimeoutRef.current)
      tintFlashTimeoutRef.current = window.setTimeout(() => setTintFlash(false), CHEST_TINT_FLASH_MS)
    } else if (!isOpen) {
      wasOpenRef.current = false
    }

    if (popStartedAtRef.current !== null) {
      const t = THREE.MathUtils.clamp(
        (Date.now() - popStartedAtRef.current) / CHEST_POP_DURATION_MS,
        0,
        1
      )
      // Second beat: the bounce-back-down settle, marked with its own
      // "toggle" play the moment the pop crosses its peak.
      if (!settleBeatPlayedRef.current && t >= CHEST_POP_SETTLE_T) {
        settleBeatPlayedRef.current = true
        play("toggle")
      }

      const popScale = 1 + Math.sin(t * Math.PI) * CHEST_POP_MAGNITUDE
      groupRef.current?.scale.setScalar(popScale)
      if (t >= 1) popStartedAtRef.current = null
    }
  })

  const spriteHeight = CHEST_CLOSED_SHEET.frameHeight * CHEST_SCALE

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <PixelSpriteBillboard
        sheet={isOpen ? CHEST_OPEN_SHEET : CHEST_CLOSED_SHEET}
        row={0}
        frameCount={1}
        scale={CHEST_SCALE}
        position={[0, spriteHeight / 2, 0]}
        tint={tintFlash ? CHEST_TINT : "#ffffff"}
      />
    </group>
  )
}
