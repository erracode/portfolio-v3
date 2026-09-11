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

  /** `ResumeWalker` registers its own live position ref here (same
   * "component owns the ref, store just holds a pointer to it" pattern as
   * `combat-store.ts`'s `playerPositionRef`) so `ResumeZergRush` can read
   * where the player is each frame without either component re-rendering
   * on every pixel of movement. */
  playerPositionRef: RefObject<ResumePoint> | null
  registerPlayerPositionRef: (ref: RefObject<ResumePoint>) => void

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

  playerPositionRef: null,
  registerPlayerPositionRef: (ref) => set({ playerPositionRef: ref }),

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
