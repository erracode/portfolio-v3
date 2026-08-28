import { useEffect } from "react"

import Dialogue from "@/components/ui/8bit/blocks/dialogue"
import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { sampleNpc } from "@/data/npc"
import { NPC_SPRITE } from "@/data/sprites"
import { useDialogueStore } from "@/lib/dialogue-store"

const DISPLAY_MS = 9000
/** Portrait footprint (px) — the sprite is scaled down to fit this. */
const AVATAR_SIZE = 64

/**
 * A short banner above the action bar, showing the character's own line
 * on quest turn-in (see `quest-store.ts`'s `turnInQuest`) — inspired by
 * portfolio-v2's `MessageDialog` queue, but auto-dismissing after a few
 * seconds instead of click-to-advance: this is a passive flavor moment,
 * not a conversation gate.
 */
export function QuestDialogueBanner() {
  const line = useDialogueStore((state) => state.queue[0])
  const dismissCurrent = useDialogueStore((state) => state.dismissCurrent)

  useEffect(() => {
    if (!line) return
    const timeout = window.setTimeout(dismissCurrent, DISPLAY_MS)
    return () => window.clearTimeout(timeout)
  }, [line, dismissCurrent])

  if (!line) return null

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-30 w-[min(28rem,calc(100svw-2rem))] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2">
      <Dialogue
        avatarNode={
          <SpriteAnimation
            src={NPC_SPRITE.src}
            frameWidth={NPC_SPRITE.frameWidth}
            frameHeight={NPC_SPRITE.frameHeight}
            frameCount={NPC_SPRITE.rows.idle.frameCount}
            sheetWidth={NPC_SPRITE.sheetWidth}
            sheetHeight={NPC_SPRITE.sheetHeight}
            fps={4}
            scale={AVATAR_SIZE / NPC_SPRITE.frameWidth}
            aria-label={sampleNpc.name}
          />
        }
        title={sampleNpc.name}
        description={line}
        font="normal"
        player
      />
    </div>
  )
}
