import { PixelSpriteBillboard } from "@/components/wow/pixel-sprite-billboard"
import { sampleNpc } from "@/data/npc"
import { NPC_SPRITE, type SpriteSheetConfig } from "@/data/sprites"
import { useQuestStore } from "@/lib/quest-store"
import { WORLD_CONFIG } from "@/lib/world-config"

const NPC_SCALE = 0.006
const MARKER_SCALE = 0.01

/** Static single-frame icons — each wrapped as a 1-frame "sheet" so
 * `PixelSpriteBillboard` can render it without any animation. */
const MARKER_SPRITES: Record<"ready" | "available" | "notReady", SpriteSheetConfig> = {
  ready: {
    src: "/quest-markers/quest-ready.png",
    frameWidth: 32,
    frameHeight: 32,
    sheetWidth: 32,
    sheetHeight: 32,
    rows: { idle: { row: 0, frameCount: 1 }, walk: { row: 0, frameCount: 1 } },
  },
  available: {
    src: "/quest-markers/quest-available.png",
    frameWidth: 32,
    frameHeight: 34,
    sheetWidth: 32,
    sheetHeight: 34,
    rows: { idle: { row: 0, frameCount: 1 }, walk: { row: 0, frameCount: 1 } },
  },
  notReady: {
    src: "/quest-markers/quest-not-ready.png",
    frameWidth: 32,
    frameHeight: 32,
    sheetWidth: 32,
    sheetHeight: 32,
    rows: { idle: { row: 0, frameCount: 1 }, walk: { row: 0, frameCount: 1 } },
  },
}

/** Aggregate marker across every quest the NPC offers — ready-to-turn-in
 * beats available, which beats merely-in-progress, matching the priority
 * WoW itself uses for the icon floating over an NPC's head. */
function useNpcMarker(): keyof typeof MARKER_SPRITES | null {
  const questStatuses = useQuestStore((state) => state.quests)
  const statuses = sampleNpc.quests.map((quest) => questStatuses[quest.id] ?? "available")

  if (statuses.includes("ready")) return "ready"
  if (statuses.includes("available")) return "available"
  if (statuses.includes("accepted")) return "notReady"
  return null
}

/** Static, interactable NPC — approach it and press "E" (wired in
 * `world-scene.tsx`) to open `NpcQuestDialog`. A quest marker floats
 * above its head reflecting the aggregate state of every quest it offers. */
export function WorldNpc() {
  const { x, y, z } = WORLD_CONFIG.npc.position
  const spriteHeight = NPC_SPRITE.frameHeight * NPC_SCALE
  const marker = useNpcMarker()
  const markerSheet = marker ? MARKER_SPRITES[marker] : null

  return (
    <>
      <PixelSpriteBillboard
        sheet={NPC_SPRITE}
        row={NPC_SPRITE.rows.idle.row}
        frameCount={NPC_SPRITE.rows.idle.frameCount}
        fps={4}
        scale={NPC_SCALE}
        position={[x, y + spriteHeight / 2, z]}
      />
      {markerSheet && (
        <PixelSpriteBillboard
          sheet={markerSheet}
          row={0}
          frameCount={1}
          scale={MARKER_SCALE}
          position={[x, y + spriteHeight + (markerSheet.frameHeight * MARKER_SCALE) / 2 + 0.15, z]}
        />
      )}
    </>
  )
}
