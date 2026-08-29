import { play } from "cuelume"
import type { RefObject } from "react"
import { create } from "zustand"
import type * as THREE from "three"

import { useLogStore } from "@/lib/log-store"
import { usePlayerStore } from "@/lib/player-store"
import { useQuestStore } from "@/lib/quest-store"
import { WORLD_CONFIG } from "@/lib/world-config"

export interface EnemyCombatState {
  id: string
  name: string
  health: number
  maxHealth: number
  isDead: boolean
  positionRef: RefObject<THREE.Vector3>
}

interface CombatState {
  enemies: Record<string, EnemyCombatState>
  targetId: string | null
  axeCooldownEndsAt: number
  /** Bumped by `requestAxeCast` — the only way to carry a cast request
   * across the DOM/Canvas boundary (`ActionBar` lives outside `<Canvas>`).
   * `WorldCombatController` resolves the actual cast. */
  castRequestToken: number
  playerInvulnerableUntil: number
  playerPositionRef: RefObject<THREE.Vector3> | null
  registerEnemy: (
    id: string,
    name: string,
    maxHealth: number,
    positionRef: RefObject<THREE.Vector3>
  ) => void
  registerPlayerPositionRef: (ref: RefObject<THREE.Vector3>) => void
  setTarget: (id: string | null) => void
  damageEnemy: (id: string, amount: number) => void
  requestAxeCast: () => void
  takePlayerDamage: (amount: number) => void
}

/**
 * Session-only combat state (no persist, unlike `quest-store.ts` — a
 * reload should not remember mid-fight health). Enemies register
 * themselves on mount; damage/target/cast requests all flow through here
 * so DOM HUD pieces (`ActionBar`, `TargetFrame`) and Canvas entities
 * (`WorldGuard`, `WorldCombatController`) can share state without prop
 * drilling across the Canvas boundary.
 */
export const useCombatStore = create<CombatState>()((set, get) => ({
  enemies: {},
  targetId: null,
  axeCooldownEndsAt: 0,
  castRequestToken: 0,
  playerInvulnerableUntil: 0,
  playerPositionRef: null,

  registerEnemy: (id, name, maxHealth, positionRef) =>
    set((state) => ({
      enemies: {
        ...state.enemies,
        [id]: { id, name, health: maxHealth, maxHealth, isDead: false, positionRef },
      },
    })),

  registerPlayerPositionRef: (ref) => set({ playerPositionRef: ref }),

  setTarget: (id) => set({ targetId: id }),

  damageEnemy: (id, amount) => {
    const enemy = get().enemies[id]
    if (!enemy || enemy.isDead) return

    const health = Math.max(enemy.health - amount, 0)
    const isDead = health <= 0
    if (isDead) play("chime")

    set((state) => ({
      enemies: { ...state.enemies, [id]: { ...enemy, health, isDead } },
      targetId: isDead && state.targetId === id ? null : state.targetId,
    }))

    if (isDead) {
      const allDead = Object.values(get().enemies).every((e) => e.isDead)
      if (allDead) useQuestStore.getState().completeObjectiveIfAccepted("defeat-guards")
    }
  },

  requestAxeCast: () => set((state) => ({ castRequestToken: state.castRequestToken + 1 })),

  takePlayerDamage: (amount) => {
    if (Date.now() < get().playerInvulnerableUntil) return

    const { health } = usePlayerStore.getState().player
    const newHealth = health.current - amount
    usePlayerStore.getState().setHealth(newHealth)
    useLogStore.getState().addLog("system", `Recibiste ${amount} de daño de los guardias.`)

    if (newHealth <= 0) {
      // Invulnerable through the whole respawn wait, not just the normal
      // hit window — otherwise a guard's next attack can land mid-respawn
      // and schedule a second overlapping respawn timeout.
      set({ playerInvulnerableUntil: Date.now() + WORLD_CONFIG.combat.respawnDelayMs })
      setTimeout(() => {
        const maxHealth = usePlayerStore.getState().player.health.max
        usePlayerStore.getState().setHealth(maxHealth)

        const { playerPositionRef } = get()
        const { x, y, z } = WORLD_CONFIG.combat.playerSpawnPosition
        playerPositionRef?.current?.set(x, y, z)

        set({
          playerInvulnerableUntil: Date.now() + WORLD_CONFIG.combat.respawnInvulnerabilityMs,
        })
        useLogStore.getState().addLog("system", "Reapareciste en el punto de origen.")
      }, WORLD_CONFIG.combat.respawnDelayMs)
    } else {
      set({ playerInvulnerableUntil: Date.now() + WORLD_CONFIG.combat.invulnerabilityMs })
    }
  },
}))

// Guards can die before "recover-relic" is ever accepted (no respawn path
// exists once dead — see WorldGuard). Without this, "defeat-guards" would
// never get a second chance to fire and the quest could never reach
// "ready". Re-check the moment the quest is accepted, not just on damage.
useQuestStore.subscribe((state, prevState) => {
  const wasAccepted = prevState.quests["recover-relic"] === "accepted"
  const isAccepted = state.quests["recover-relic"] === "accepted"
  if (isAccepted && !wasAccepted) {
    const enemies = Object.values(useCombatStore.getState().enemies)
    if (enemies.length > 0 && enemies.every((enemy) => enemy.isDead)) {
      useQuestStore.getState().completeObjectiveIfAccepted("defeat-guards")
    }
  }
})
