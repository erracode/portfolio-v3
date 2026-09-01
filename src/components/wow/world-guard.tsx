import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useShallow } from "zustand/react/shallow"

import { EnemyDamageNumbers } from "@/components/wow/enemy-damage-numbers"
import { EnemyHealthBar } from "@/components/wow/enemy-health-bar"
import { HitEffect } from "@/components/wow/hit-effect"
import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { rollAttack, selectHitEvents, useCombatStore } from "@/lib/combat-store"
import { WORLD_CONFIG } from "@/lib/world-config"

const GUARD_SCALE = 0.015
const HIT_FLASH_MS = 150
const ARRIVAL_EPSILON = 0.05
const HIT_TINT = "#ff3b3b"
// Comfortably covers `EnemyDamageNumbers`' 900ms TTL and `HitEffect`'s
// 600ms burst duration, so the killing blow's number/particles finish
// playing before the guard's rendered output actually disappears.
const DEATH_GRACE_MS = 1000

type GuardFsm = "idle" | "aggro" | "leash"

interface WorldGuardProps {
  id: string
  name: string
  skin: SpriteSheetConfig
  spawnPosition: { x: number; y: number; z: number }
}

/**
 * Stationary guard with classic-WoW aggro/leash AI: idle at `spawnPosition`
 * until the player enters `aggroRadius`, then chases; if it strays past
 * `leashRadius` from its OWN spawn (not from the player), it gives up and
 * walks home, healing to full on arrival. Health/death live in
 * `combat-store` — this component only drives position and reacts to it.
 */
export function WorldGuard({ id, name, skin, spawnPosition }: WorldGuardProps) {
  const {
    aggroRadius,
    leashRadius,
    attackRange,
    attackDamageMin,
    attackDamageMax,
    hitChance,
    attackCooldownMs,
    maxHealth,
    walkSpeed,
  } = WORLD_CONFIG.guards

  // A ref, not `useState` — `fsm` only ever drives this component's own
  // `useFrame` branching (never the render output below), and `useState`'s
  // async-batched updates left a real stale-closure bug: hitting a guard
  // that was already fleeing (leash) queued the aggro transition for NEXT
  // frame, so THIS frame's branch still saw the old "leash" value and ran
  // the walk-home step anyway — a one-frame flicker toward the player
  // before reverting. A ref is always current within the same frame.
  const fsmRef = useRef<GuardFsm>("idle")
  const [hitFlash, setHitFlash] = useState(false)
  const [trulyGone, setTrulyGone] = useState(false)
  const deathTimeoutRef = useRef<number | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  const positionRef = useRef(
    new THREE.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z)
  )
  const spawnRef = useRef(
    new THREE.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z)
  )
  const attackTimerRef = useRef(0)
  const hitFlashTimeoutRef = useRef<number | null>(null)
  const previousHealthRef = useRef(maxHealth)
  const aggroHealthRef = useRef(maxHealth)
  const scratchStepRef = useRef(new THREE.Vector3())
  const scratchToSpawnRef = useRef(new THREE.Vector3())

  const enemy = useCombatStore((state) => state.enemies[id])
  const registerEnemy = useCombatStore((state) => state.registerEnemy)
  const hitEvents = useCombatStore(
    useShallow((state) => selectHitEvents(state.enemyDamageEvents[id] ?? []))
  )

  useEffect(() => {
    registerEnemy(id, name, maxHealth, positionRef)
  }, [id, name, maxHealth, registerEnemy])

  // Mirrors `hitFlash`'s timeout idiom below: on death, delay the actual
  // unmount so the killing blow's `EnemyDamageNumbers`/`HitEffect` (which
  // must stay mounted to render) get their grace period. No reset branch is
  // needed — a dead guard's `useFrame` always early-returns (see below), so
  // `isDead` never flips back to false and `trulyGone` never needs to.
  useEffect(() => {
    if (!enemy?.isDead) return
    deathTimeoutRef.current = window.setTimeout(() => setTrulyGone(true), DEATH_GRACE_MS)
    return () => {
      if (deathTimeoutRef.current !== null) window.clearTimeout(deathTimeoutRef.current)
    }
  }, [enemy?.isDead])

  useEffect(() => {
    if (!enemy) return
    if (enemy.health < previousHealthRef.current) {
      setHitFlash(true)
      if (hitFlashTimeoutRef.current !== null) window.clearTimeout(hitFlashTimeoutRef.current)
      hitFlashTimeoutRef.current = window.setTimeout(() => setHitFlash(false), HIT_FLASH_MS)
    }
    previousHealthRef.current = enemy.health

    return () => {
      if (hitFlashTimeoutRef.current !== null) window.clearTimeout(hitFlashTimeoutRef.current)
    }
  }, [enemy])

  useFrame((_state, delta) => {
    if (!enemy || enemy.isDead) return

    // Taking damage aggros immediately, regardless of distance — real WoW
    // mobs retaliate against whoever hit them even from outside their aggro
    // radius. Without this, the axe's range (7) comfortably out-ranging
    // `aggroRadius` (3.5) let a player poke a guard forever from safety
    // since proximity was the only aggro trigger. Detected here (not in the
    // hit-flash effect above) so this runs in `useFrame`, not a React
    // effect body.
    if (enemy.health < aggroHealthRef.current) fsmRef.current = "aggro"
    aggroHealthRef.current = enemy.health

    const playerPosition = useCombatStore.getState().playerPositionRef?.current
    if (playerPosition) {
      const distanceToPlayer = positionRef.current.distanceTo(playerPosition)
      const distanceToSpawn = positionRef.current.distanceTo(spawnRef.current)

      if (fsmRef.current === "idle" && distanceToPlayer <= aggroRadius) fsmRef.current = "aggro"
      else if (fsmRef.current === "aggro" && distanceToSpawn > leashRadius) fsmRef.current = "leash"

      if (fsmRef.current === "aggro") {
        if (distanceToPlayer > attackRange) {
          const step = scratchStepRef.current.subVectors(playerPosition, positionRef.current)
          step.y = 0
          const stepLength = Math.min(walkSpeed * delta, step.length())
          step.normalize().multiplyScalar(stepLength)
          positionRef.current.add(step)
          attackTimerRef.current = 0
        } else {
          attackTimerRef.current += delta
          if (attackTimerRef.current >= attackCooldownMs / 1000) {
            attackTimerRef.current = 0
            const roll = rollAttack({ min: attackDamageMin, max: attackDamageMax, hitChance })
            if (roll.hit) {
              useCombatStore.getState().takePlayerDamage(roll.amount)
            } else {
              useCombatStore.getState().missPlayer()
            }
          }
        }
      }
    }

    if (fsmRef.current === "leash") {
      const toSpawn = scratchToSpawnRef.current.subVectors(spawnRef.current, positionRef.current)
      const remaining = toSpawn.length()
      if (remaining <= ARRIVAL_EPSILON) {
        positionRef.current.copy(spawnRef.current)
        attackTimerRef.current = 0
        fsmRef.current = "idle"
        useCombatStore.setState((state) => {
          const current = state.enemies[id]
          if (!current) return state
          return {
            enemies: {
              ...state.enemies,
              [id]: { ...current, health: current.maxHealth, isDead: false },
            },
          }
        })
      } else {
        toSpawn.normalize().multiplyScalar(Math.min(walkSpeed * delta, remaining))
        positionRef.current.add(toSpawn)
      }
    }

    if (groupRef.current) groupRef.current.position.copy(positionRef.current)
  })

  if (trulyGone) return null

  const spriteHeight = skin.frameHeight * GUARD_SCALE
  const isDead = enemy?.isDead ?? false

  return (
    <group ref={groupRef} position={[spawnPosition.x, spawnPosition.y, spawnPosition.z]}>
      {!isDead && (
        <PixelSpriteBillboard
          sheet={skin}
          row={skin.rows.idle.row}
          frameCount={skin.rows.idle.frameCount}
          fps={4}
          scale={GUARD_SCALE}
          position={[0, spriteHeight / 2, 0]}
          tint={hitFlash ? HIT_TINT : "#ffffff"}
          onClick={() => useCombatStore.getState().setTarget(id)}
        />
      )}
      {!isDead && <EnemyHealthBar enemyId={id} yOffset={spriteHeight + 0.15} />}
      <EnemyDamageNumbers enemyId={id} yOffset={spriteHeight + 0.55} />
      <HitEffect events={hitEvents} position={[0, spriteHeight / 2, 0]} />
    </group>
  )
}
