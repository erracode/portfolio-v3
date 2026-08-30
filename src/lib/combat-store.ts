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

/** A single floating "-N" combat-text event. Bounded lifetime by
 * construction, same philosophy as `AxeProjectile`: the component that
 * renders one schedules its own removal (`removePlayerDamageEvent` /
 * `removeEnemyDamageEvent`) after a fixed TTL, so nothing here can
 * accumulate indefinitely. */
export interface DamageEvent {
  id: number
  amount: number
  at: number
}

let nextDamageEventId = 1

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
  /** Timestamp of the player's last actual hit — DOM-side damage-feedback
   * components (`DamageVignette`) key off this to re-trigger their CSS
   * animation, same pattern `CooldownOverlay` already uses. */
  lastPlayerHitAt: number
  playerDamageEvents: DamageEvent[]
  enemyDamageEvents: Record<string, DamageEvent[]>
  /** True while the Game Over dialog is shown: movement is frozen in
   * `WorldPlayer` and `takePlayerDamage` is a no-op until
   * `resurrectPlayer` clears it. */
  playerDead: boolean
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
  /** Restores health, teleports to spawn, clears `playerDead`, and grants
   * post-respawn invulnerability. The only way out of Game Over. */
  resurrectPlayer: () => void
  removePlayerDamageEvent: (id: number) => void
  removeEnemyDamageEvent: (enemyId: string, id: number) => void
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
  lastPlayerHitAt: 0,
  playerDamageEvents: [],
  enemyDamageEvents: {},
  playerDead: false,

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
      // `WorldGuard` unmounts immediately on death (returns null), which
      // unmounts `EnemyDamageNumbers` before any still-pending `DamageNumber`
      // timeout can fire `onExpire` — clear this enemy's events here instead
      // so none are orphaned in the store for the rest of the session.
      enemyDamageEvents: isDead
        ? { ...state.enemyDamageEvents, [id]: [] }
        : {
            ...state.enemyDamageEvents,
            [id]: [
              ...(state.enemyDamageEvents[id] ?? []),
              { id: nextDamageEventId++, amount, at: Date.now() },
            ],
          },
    }))

    if (isDead) {
      const allDead = Object.values(get().enemies).every((e) => e.isDead)
      if (allDead) useQuestStore.getState().completeObjectiveIfAccepted("defeat-guards")
    }
  },

  requestAxeCast: () => set((state) => ({ castRequestToken: state.castRequestToken + 1 })),

  takePlayerDamage: (amount) => {
    if (get().playerDead) return
    if (Date.now() < get().playerInvulnerableUntil) return

    const { health } = usePlayerStore.getState().player
    const newHealth = health.current - amount
    usePlayerStore.getState().setHealth(newHealth)
    useLogStore.getState().addLog("system", `Recibiste ${amount} de daño de los guardias.`)

    set((state) => ({
      lastPlayerHitAt: Date.now(),
      playerDamageEvents: [
        ...state.playerDamageEvents,
        { id: nextDamageEventId++, amount, at: Date.now() },
      ],
    }))

    if (newHealth <= 0) {
      // Game Over: freeze (movement is gated in WorldPlayer) and show the
      // dialog. No auto-respawn — the player must resurrect explicitly.
      set({ playerDead: true })
    } else {
      set({ playerInvulnerableUntil: Date.now() + WORLD_CONFIG.combat.invulnerabilityMs })
    }
  },

  resurrectPlayer: () => {
    const maxHealth = usePlayerStore.getState().player.health.max
    usePlayerStore.getState().setHealth(maxHealth)

    const { playerPositionRef } = get()
    const { x, y, z } = WORLD_CONFIG.combat.playerSpawnPosition
    playerPositionRef?.current?.set(x, y, z)

    set({
      playerDead: false,
      playerInvulnerableUntil: Date.now() + WORLD_CONFIG.combat.respawnInvulnerabilityMs,
    })
    useLogStore.getState().addLog("system", "Reapareciste en el punto de origen.")
  },

  removePlayerDamageEvent: (id) =>
    set((state) => ({
      playerDamageEvents: state.playerDamageEvents.filter((event) => event.id !== id),
    })),

  removeEnemyDamageEvent: (enemyId, id) =>
    set((state) => ({
      enemyDamageEvents: {
        ...state.enemyDamageEvents,
        [enemyId]: (state.enemyDamageEvents[enemyId] ?? []).filter((event) => event.id !== id),
      },
    })),
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
