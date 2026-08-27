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
