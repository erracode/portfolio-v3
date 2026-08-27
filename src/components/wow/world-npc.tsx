import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import type { SpriteSheetConfig } from "@/data/sprites"
import { WORLD_CONFIG } from "@/lib/world-config"

const NPC_SCALE = 0.006

/** "Guardián del Portfolio" NPC sprite — a 9-frame idle strip. */
const NPC_SPRITE: SpriteSheetConfig = {
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

/** Static, interactable NPC — approach it and press "E" (wired in
 * `world-scene.tsx`) to open `NpcQuestDialog`. */
export function WorldNpc() {
  const { x, y, z } = WORLD_CONFIG.npc.position
  const spriteHeight = NPC_SPRITE.frameHeight * NPC_SCALE

  return (
    <PixelSpriteBillboard
      sheet={NPC_SPRITE}
      row={NPC_SPRITE.rows.idle.row}
      frameCount={NPC_SPRITE.rows.idle.frameCount}
      fps={4}
      scale={NPC_SCALE}
      position={[x, y + spriteHeight / 2, z]}
    />
  )
}
