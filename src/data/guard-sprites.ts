import type { SpriteSheetConfig } from "@/data/sprites"

function enemySheet(src: string): SpriteSheetConfig {
  return {
    src,
    frameWidth: 100,
    frameHeight: 100,
    sheetWidth: 200,
    sheetHeight: 100,
    rows: { idle: { row: 0, frameCount: 2 }, walk: { row: 0, frameCount: 2 } },
  }
}

/** 200x100, 2 horizontal frames of 100x100, single row — always playing,
 * there's no separate idle pose in the source art. Kept out of
 * `world-guard.tsx` itself so that component can stay a pure component
 * export (fast-refresh). */
export const FERRIS_SPRITE = enemySheet("/game/ferris-enemy.png")
export const GOPHER_SPRITE = enemySheet("/game/gopher-enemy.png")
