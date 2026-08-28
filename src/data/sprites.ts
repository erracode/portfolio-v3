export interface SpriteRow {
  row: number
  frameCount: number
}

export interface SpriteSheetConfig {
  src: string
  frameWidth: number
  frameHeight: number
  sheetWidth: number
  sheetHeight: number
  rows: {
    idle: SpriteRow
    walk: SpriteRow
  }
}

/** Player sprite sheet — shared by CharacterSheetModal's DOM-based idle
 * preview and the 3D world's WebGL billboard. Row 0 is idle (6 frames), row
 * 1 is the walk cycle (6 frames) — both already exist in the same sheet. */
export const PLAYER_SPRITE: SpriteSheetConfig = {
  src: "/game/player.png",
  frameWidth: 250,
  frameHeight: 250,
  sheetWidth: 1500,
  sheetHeight: 500,
  rows: {
    idle: { row: 0, frameCount: 6 },
    walk: { row: 1, frameCount: 6 },
  },
}

/** "Guardián del Portfolio" NPC sprite — shared by the 3D world's
 * billboard (`world-npc.tsx`), the NPC dialog's portrait, and the quest
 * dialogue banner's avatar. A 9-frame idle strip, single row. */
export const NPC_SPRITE: SpriteSheetConfig = {
  src: "/avatar/me.png",
  frameWidth: 250,
  frameHeight: 250,
  sheetWidth: 2250,
  sheetHeight: 250,
  rows: {
    idle: { row: 0, frameCount: 9 },
    walk: { row: 0, frameCount: 9 },
  },
}
