import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { play } from "cuelume"

import { AxeProjectile } from "@/components/wow/axe-projectile"
import { rollAttack, useCombatStore } from "@/lib/combat-store"
import { useLogStore } from "@/lib/log-store"
import { playRandomSound } from "@/lib/sfx"
import { WORLD_CONFIG } from "@/lib/world-config"

interface ActiveProjectile {
  id: number
  from: [number, number, number]
  to: [number, number, number]
  startedAt: number
}

let nextProjectileId = 1

const WHOOSH_SOUNDS = [
  "/sounds/mWooshLarge1.ogg",
  "/sounds/mWooshLarge2.ogg",
  "/sounds/mWooshLarge3.ogg",
]

/**
 * Mounted once inside `<Canvas>`. `ActionBar` lives outside the Canvas, so
 * it can only hand a cast REQUEST across that boundary via
 * `combatStore.castRequestToken` — this resolves it: target/range/cooldown
 * checks, damage, cooldown start, and the axe projectile all happen here.
 */
export function WorldCombatController() {
  const lastHandledTokenRef = useRef(0)
  const [projectiles, setProjectiles] = useState<ActiveProjectile[]>([])

  useFrame(() => {
    const combat = useCombatStore.getState()
    if (combat.castRequestToken === lastHandledTokenRef.current) return
    lastHandledTokenRef.current = combat.castRequestToken

    const targetId = combat.targetId
    const target = targetId ? combat.enemies[targetId] : undefined
    const playerPosition = combat.playerPositionRef?.current

    if (!targetId || !target || target.isDead || !playerPosition) {
      play("error")
      useLogStore.getState().addLog("system", "No hay un objetivo válido.")
      return
    }

    if (Date.now() < combat.axeCooldownEndsAt) return

    const targetPosition = target.positionRef.current
    if (playerPosition.distanceTo(targetPosition) > WORLD_CONFIG.axe.range) {
      play("error")
      useLogStore.getState().addLog("system", "El objetivo está fuera de rango.")
      return
    }

    const { damageMin, damageMax, hitChance } = WORLD_CONFIG.axe
    const roll = rollAttack({ min: damageMin, max: damageMax, hitChance })
    if (roll.hit) {
      useCombatStore.getState().damageEnemy(targetId, roll.amount)
    } else {
      useCombatStore.getState().missEnemy(targetId)
    }
    useCombatStore.setState({ axeCooldownEndsAt: Date.now() + WORLD_CONFIG.axe.cooldownMs })
    playRandomSound(WHOOSH_SOUNDS)

    const from: [number, number, number] = [
      playerPosition.x,
      playerPosition.y + 1,
      playerPosition.z,
    ]
    const to: [number, number, number] = [
      targetPosition.x,
      targetPosition.y + 1,
      targetPosition.z,
    ]
    setProjectiles((current) => [
      ...current,
      { id: nextProjectileId++, from, to, startedAt: Date.now() },
    ])
  })

  return (
    <>
      {projectiles.map((projectile) => (
        <AxeProjectile
          key={projectile.id}
          from={projectile.from}
          to={projectile.to}
          startedAt={projectile.startedAt}
          durationMs={WORLD_CONFIG.axe.projectileDurationMs}
          onDone={() =>
            setProjectiles((current) => current.filter((p) => p.id !== projectile.id))
          }
        />
      ))}
    </>
  )
}
