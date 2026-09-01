import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"

const FLAG_SCALE = 0.033

/** Placeholder flag — swap `src` for the real Venezuela flag texture
 * later; the sheet layout (5-frame single-row wave cycle) can stay the
 * same as long as the replacement matches it. */
const FLAG_SPRITE: SpriteSheetConfig = {
  src: "/props/flag.png",
  frameWidth: 60,
  frameHeight: 60,
  sheetWidth: 300,
  sheetHeight: 60,
  rows: {
    idle: { row: 0, frameCount: 5 },
    walk: { row: 0, frameCount: 5 },
  },
}

interface WorldFlagProps {
  position: { x: number; y: number; z: number }
}

/** Decorative waving flag. One instance per entry in
 * `WORLD_CONFIG.flag.positions`, mounted by `world-scene.tsx`. */
export function WorldFlag({ position }: WorldFlagProps) {
  const { x, y, z } = position
  const spriteHeight = FLAG_SPRITE.frameHeight * FLAG_SCALE

  return (
    <PixelSpriteBillboard
      sheet={FLAG_SPRITE}
      row={FLAG_SPRITE.rows.idle.row}
      frameCount={FLAG_SPRITE.rows.idle.frameCount}
      fps={6}
      scale={FLAG_SCALE}
      position={[x, y + spriteHeight / 2, z]}
    />
  )
}
