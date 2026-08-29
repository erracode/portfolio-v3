import type { ResourceType } from "@/lib/player-store"

/** Shared between `PlayerUnitFrame` and `MobileUnitFrames` — split out of
 * `stat-bar.tsx` so that file only exports the `StatBar` component
 * (react-refresh/only-export-components). */
export const RESOURCE_BAR_BG: Record<ResourceType, string> = {
  energy: "bg-yellow-500",
  mana: "bg-blue-500",
}
