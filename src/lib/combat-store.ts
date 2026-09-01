import { play } from "cuelume"
import type { RefObject } from "react"
import { create } from "zustand"
import type * as THREE from "three"

import { useLogStore } from "@/lib/log-store"
import { usePlayerStore } from "@/lib/player-store"
import { useQuestStore } from "@/lib/quest-store"
import { playRandomSound } from "@/lib/sfx"
import { WORLD_CONFIG } from "@/lib/world-config"

const PLAYER_HIT_SOUNDS = [
  "/sounds/1hDaggerHitFleshA.ogg",
  "/sounds/1hDaggerHitFleshB.ogg",
  "/sounds/1hDaggerHitFleshC.ogg",
]
const PLAYER_DEATH_SOUNDS = ["/sounds/OrcMaleDeath.ogg"]

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
  /** True for a missed attack — rendered as "Miss" text instead of a
   * numeric amount; `amount` is unused (0) in this case. */
  isMiss?: boolean
}

let nextDamageEventId = 1

interface RollAttackArgs {
  min: number
  max: number
  hitChance: number
}

/** Shared hit-chance + damage-roll formula for any melee/ranged attack
 * (axe cast, guard melee) — centralized so the roll math isn't duplicated
 * at each call site. */
export function rollAttack({ min, max, hitChance }: RollAttackArgs): {
  hit: boolean
  amount: number
} {
  const hit = Math.random() < hitChance
  const amount = hit ? Math.floor(min + Math.random() * (max - min + 1)) : 0
  return { hit, amount }
}

/** Which damage events should trigger a `HitEffect` particle burst — real
 * hits only, never a miss. Shared by the player's and each enemy's
 * `useShallow` selector so the filter logic lives in one place. */
export function selectHitEvents(events: DamageEvent[]): DamageEvent[] {
  return events.filter((event) => !event.isMiss)
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
  /** Records a missed axe cast against an enemy — the hit-chance roll
   * happens at the call site (`WorldCombatController`); this only logs the
   * miss event, it never touches health. */
  missEnemy: (id: string) => void
  requestAxeCast: () => void
  takePlayerDamage: (amount: number) => void
  /** Records a guard's missed melee attack — the hit-chance roll happens at
   * the call site (`WorldGuard`); this only logs the miss event, it never
   * touches health or invulnerability. */
  missPlayer: () => void
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
    set((state) => {
      // A `WorldGuard` remount (e.g. React StrictMode's dev double-invoke,
      // or a Suspense boundary re-suspending on a texture that only loads
      // lazily well after initial mount — `AxeProjectile`'s axe-sheet.png,
      // first requested on the player's first actual cast) re-runs this
      // mount effect on an enemy that's already being tracked. Keeping the
      // unconditional fresh-state overwrite here would silently wipe any
      // damage already dealt (and even revive an already-dead enemy) —
      // exactly the mechanism that made guards feel unkillable and the
      // chest never open. Only `positionRef` needs to follow the new
      // component instance; health/isDead must survive re-registration.
      const existing = state.enemies[id]
      return {
        enemies: {
          ...state.enemies,
          [id]: existing
            ? { ...existing, positionRef }
            : { id, name, health: maxHealth, maxHealth, isDead: false, positionRef },
        },
      }
    }),

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
      // Always append, killing hit included — this event drives THIS hit's
      // damage number / HitEffect burst. `WorldGuard` now stays mounted
      // through a grace period after death so the killing blow's event has
      // time to render before its own TTL removes it.
      enemyDamageEvents: {
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

  missEnemy: (id) => {
    const enemy = get().enemies[id]
    if (!enemy || enemy.isDead) return

    play("whisper")
    useLogStore.getState().addLog("system", "¡Fallaste el golpe!")

    set((state) => ({
      enemyDamageEvents: {
        ...state.enemyDamageEvents,
        [id]: [
          ...(state.enemyDamageEvents[id] ?? []),
          { id: nextDamageEventId++, amount: 0, at: Date.now(), isMiss: true },
        ],
      },
    }))
  },

  requestAxeCast: () => set((state) => ({ castRequestToken: state.castRequestToken + 1 })),

  takePlayerDamage: (amount) => {
    if (get().playerDead) return
    if (Date.now() < get().playerInvulnerableUntil) return

    const { health } = usePlayerStore.getState().player
    const newHealth = health.current - amount
    usePlayerStore.getState().setHealth(newHealth)
    playRandomSound(PLAYER_HIT_SOUNDS)
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
      playRandomSound(PLAYER_DEATH_SOUNDS)
      set({ playerDead: true })
    } else {
      set({ playerInvulnerableUntil: Date.now() + WORLD_CONFIG.combat.invulnerabilityMs })
    }
  },

  missPlayer: () => {
    if (get().playerDead) return

    play("whisper")
    useLogStore.getState().addLog("system", "El guardia falló su ataque.")

    set((state) => ({
      playerDamageEvents: [
        ...state.playerDamageEvents,
        { id: nextDamageEventId++, amount: 0, at: Date.now(), isMiss: true },
      ],
    }))
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
