import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { EnemyHealthBar } from "@/components/wow/enemy-health-bar"
import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useCombatStore } from "@/lib/combat-store"
import { WORLD_CONFIG } from "@/lib/world-config"

const GUARD_SCALE = 0.015
const HIT_FLASH_MS = 150
const ARRIVAL_EPSILON = 0.05
const HIT_TINT = "#ff3b3b"

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
  const { aggroRadius, leashRadius, attackRange, attackDamage, attackCooldownMs, maxHealth, walkSpeed } =
    WORLD_CONFIG.guards

  const [fsm, setFsm] = useState<GuardFsm>("idle")
  const [hitFlash, setHitFlash] = useState(false)
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
  const scratchStepRef = useRef(new THREE.Vector3())
  const scratchToSpawnRef = useRef(new THREE.Vector3())

  const enemy = useCombatStore((state) => state.enemies[id])
  const registerEnemy = useCombatStore((state) => state.registerEnemy)

  useEffect(() => {
    registerEnemy(id, name, maxHealth, positionRef)
  }, [id, name, maxHealth, registerEnemy])

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

    const playerPosition = useCombatStore.getState().playerPositionRef?.current
    if (playerPosition) {
      const distanceToPlayer = positionRef.current.distanceTo(playerPosition)
      const distanceToSpawn = positionRef.current.distanceTo(spawnRef.current)

      if (fsm === "idle" && distanceToPlayer <= aggroRadius) setFsm("aggro")
      else if (fsm === "aggro" && distanceToSpawn > leashRadius) setFsm("leash")

      if (fsm === "aggro") {
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
            useCombatStore.getState().takePlayerDamage(attackDamage)
          }
        }
      }
    }

    if (fsm === "leash") {
      const toSpawn = scratchToSpawnRef.current.subVectors(spawnRef.current, positionRef.current)
      const remaining = toSpawn.length()
      if (remaining <= ARRIVAL_EPSILON) {
        positionRef.current.copy(spawnRef.current)
        attackTimerRef.current = 0
        setFsm("idle")
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

  if (enemy?.isDead) return null

  const spriteHeight = skin.frameHeight * GUARD_SCALE

  return (
    <group ref={groupRef} position={[spawnPosition.x, spawnPosition.y, spawnPosition.z]}>
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
      <EnemyHealthBar enemyId={id} yOffset={spriteHeight + 0.3} />
    </group>
  )
}
