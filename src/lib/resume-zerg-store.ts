import type { RefObject } from "react"
import { create } from "zustand"

export interface ResumePoint {
  x: number
  y: number
}

const MAX_PLAYER_HP = 3
/** Matches `WORLD_CONFIG.combat.invulnerabilityMs` in the main game — same
 * "can't be chain-hit every frame while enemies overlap you" grace window. */
const INVULNERABILITY_MS = 800

interface ResumeZergState {
  /** Bumped on every start so `ResumeZergRush` can key its wave off it and
   * always spawn a fresh one, even while a previous wave is still running. */
  waveToken: number
  start: () => void

  /** True while a wave is running. `ResumePage` reads it to make the resume
   * content inert, so a click/tap meant as "walk here" or "throw at this
   * invader" can't follow a link or press a button underneath. */
  waveActive: boolean
  setWaveActive: (active: boolean) => void

  /** `ResumeWalker` registers its own live position ref here (same
   * "component owns the ref, store just holds a pointer to it" pattern as
   * `combat-store.ts`'s `playerPositionRef`) so `ResumeZergRush` can read
   * where the player is each frame without either component re-rendering
   * on every pixel of movement. */
  playerPositionRef: RefObject<ResumePoint> | null
  registerPlayerPositionRef: (ref: RefObject<ResumePoint>) => void

  /** Touch has no hover cursor to aim with and no Space key, so on touch a
   * tap has to mean either "throw at this" or "walk here". `ResumeZergRush`
   * (which owns the enemy list and hit radius) registers the decision while
   * a wave runs; `ResumeWalker` calls `requestTouchAttack` from its own
   * pointerdown handler before setting a walk target — one listener, one
   * synchronous answer, no ordering games between two window listeners.
   * Returns true when the tap was consumed as an attack. */
  touchAttackHandler: ((point: ResumePoint) => boolean) | null
  registerTouchAttackHandler: (handler: ((point: ResumePoint) => boolean) | null) => void
  requestTouchAttack: (point: ResumePoint) => boolean

  playerHp: number
  maxPlayerHp: number
  playerInvulnerableUntil: number
  lastPlayerHitAt: number
  takePlayerDamage: () => void
}

/** Not persisted — this is a one-shot easter egg, not a preference. */
export const useResumeZergStore = create<ResumeZergState>()((set, get) => ({
  waveToken: 0,
  start: () => set((state) => ({ waveToken: state.waveToken + 1, playerHp: state.maxPlayerHp })),

  waveActive: false,
  setWaveActive: (active) => set({ waveActive: active }),

  playerPositionRef: null,
  registerPlayerPositionRef: (ref) => set({ playerPositionRef: ref }),

  touchAttackHandler: null,
  registerTouchAttackHandler: (handler) => set({ touchAttackHandler: handler }),
  requestTouchAttack: (point) => get().touchAttackHandler?.(point) ?? false,

  playerHp: MAX_PLAYER_HP,
  maxPlayerHp: MAX_PLAYER_HP,
  playerInvulnerableUntil: 0,
  lastPlayerHitAt: 0,

  takePlayerDamage: () => {
    if (Date.now() < get().playerInvulnerableUntil) return
    const nextHp = Math.max(get().playerHp - 1, 0)
    set({
      playerHp: nextHp,
      lastPlayerHitAt: Date.now(),
      playerInvulnerableUntil: Date.now() + INVULNERABILITY_MS,
    })
  },
}))
