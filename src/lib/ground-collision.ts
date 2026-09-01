import { GROUND_MAP } from "@/data/ground-map"
import { WORLD_CONFIG } from "@/lib/world-config"

export const GROUND_ROWS = GROUND_MAP.length
export const GROUND_COLS = GROUND_MAP[0]?.length ?? 0
export const GROUND_ORIGIN_X = -((GROUND_COLS - 1) * WORLD_CONFIG.ground.cellSize) / 2
export const GROUND_ORIGIN_Z = -((GROUND_ROWS - 1) * WORLD_CONFIG.ground.cellSize) / 2

/**
 * Inverse of `world-ground.tsx`'s tile-placement math: given a world
 * (x, z), finds the `GROUND_MAP` cell it falls in and reports whether that
 * cell is a rendered ("1") tile. `WORLD_CONFIG.bounds` is only a
 * rectangular clamp — a superset of `GROUND_MAP`'s silhouette — so
 * `WorldPlayer` uses this for precise per-axis collision against the
 * actual ground shape instead.
 */
export function isGroundPassable(x: number, z: number): boolean {
  const col = Math.round((x - GROUND_ORIGIN_X) / WORLD_CONFIG.ground.cellSize)
  const row = Math.round((z - GROUND_ORIGIN_Z) / WORLD_CONFIG.ground.cellSize)
  return GROUND_MAP[row]?.[col] === "1"
}
