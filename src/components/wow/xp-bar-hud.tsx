import XpBar from "@/components/ui/8bit/xp-bar"
import { useQuestStore, XP_PER_LEVEL } from "@/lib/quest-store"

/** Same width as `ActionBar` (9 size-10 slots + gap-2 between them =
 * 424px), centered the same way, sitting just below it. */
const ACTION_BAR_WIDTH = "424px"

/** Thin bar pinned to the bottom of the screen, matching the action
 * bar's width instead of spanning edge-to-edge. Fed by `quest-store.ts`'s
 * `totalXp`, awarded on quest turn-in. */
export function XpBarHud() {
  const totalXp = useQuestStore((state) => state.totalXp)
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const progress = ((totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 pb-1"
      style={{ width: ACTION_BAR_WIDTH }}
    >
      <span className="font-sans text-[9px] font-bold text-muted-foreground">
        Nv. {level}
      </span>
      <XpBar value={progress} className="h-2 flex-1" />
    </div>
  )
}
