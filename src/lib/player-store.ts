import { create } from "zustand"

export type ResourceType = "mana" | "energy"

export interface ResourceStat {
  current: number
  max: number
}

export interface TypedResourceStat extends ResourceStat {
  type: ResourceType
}

export interface PlayerProfile {
  name: string
  title: string
  level: number
  portrait: string
  health: ResourceStat
  resource: TypedResourceStat
}

interface PlayerState {
  player: PlayerProfile
  setHealth: (current: number) => void
  setResource: (current: number) => void
  updatePlayer: (partial: Partial<PlayerProfile>) => void
}

const DEFAULT_PLAYER: PlayerProfile = {
  name: "Jesús Díaz",
  title: "Senior Full-Stack Engineer",
  level: 99,
  portrait: "/social/talk-icon.png",
  // Was 12500 — a flavor number picked before combat existed. Against a
  // guard's actual attackDamage (240-360/hit, see WORLD_CONFIG.guards),
  // that made the player nearly unkillable; 2000 keeps a handful of
  // unlucky hits genuinely dangerous while still surviving a real fight.
  health: { current: 2000, max: 2000 },
  resource: { current: 5000, max: 5000, type: "mana" },
}

/** Clamps a stat into [0, max]; also floors a non-positive max to zero. */
function clampStat<T extends ResourceStat>(stat: T): T {
  const max = Math.max(stat.max, 0)
  return {
    ...stat,
    max,
    current: Math.min(Math.max(stat.current, 0), max),
  }
}

/**
 * State for the CURRENT player. Future game systems call the setters;
 * the unit frame only reads.
 */
export const usePlayerStore = create<PlayerState>()((set) => ({
  player: DEFAULT_PLAYER,

  setHealth: (current) =>
    set((state) => ({
      player: {
        ...state.player,
        health: clampStat({ ...state.player.health, current }),
      },
    })),

  setResource: (current) =>
    set((state) => ({
      player: {
        ...state.player,
        resource: clampStat({ ...state.player.resource, current }),
      },
    })),

  updatePlayer: (partial) =>
    set((state) => ({
      player: {
        ...state.player,
        ...partial,
        ...(partial.health ? { health: clampStat(partial.health) } : {}),
        ...(partial.resource ? { resource: clampStat(partial.resource) } : {}),
      },
    })),
}))

/** Whole-profile selector: the unit frame is currently its only consumer. */
export function usePlayer(): PlayerProfile {
  return usePlayerStore((state) => state.player)
}
