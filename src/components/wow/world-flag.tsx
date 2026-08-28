import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { WORLD_CONFIG } from "@/lib/world-config"

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

/** Decorative waving flag near spawn. */
export function WorldFlag() {
  const { x, y, z } = WORLD_CONFIG.flag.position
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
