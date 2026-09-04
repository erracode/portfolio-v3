import XpBar from "@/components/ui/8bit/xp-bar"
import { useQuestStore, XP_PER_LEVEL } from "@/lib/quest-store"
import { useIsMobile } from "@/lib/use-is-mobile"
import { WORLD_CONFIG } from "@/lib/world-config"

/** Same width as `ActionBar` (9 size-10 slots + gap-2 between them =
 * 424px), centered the same way, sitting just below it. Mobile mirrors
 * `ActionBar`'s own mobile slot math via `WORLD_CONFIG.mobile.actionBarWidth`. */
const ACTION_BAR_WIDTH = "424px"

/** Thin bar pinned to the bottom of the screen, matching the action
 * bar's width instead of spanning edge-to-edge, with a fixed 12px gap below
 * `ActionBar` (bottom-1 + this bar's own pb-1/h-2 vs `ActionBar`'s bottom-7
 * desktop; bottom-44 vs bottom-[200px] mobile) so the two read as visibly
 * separate instead of touching. Fed by `quest-store.ts`'s `totalXp`,
 * awarded on quest turn-in. */
export function XpBarHud() {
  const isMobile = useIsMobile()
  const totalXp = useQuestStore((state) => state.totalXp)
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const progress = ((totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  return (
    <div
      className={`pointer-events-none fixed left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 pb-1 ${
        isMobile ? "bottom-44" : "bottom-1"
      }`}
      style={{ width: isMobile ? WORLD_CONFIG.mobile.actionBarWidth : ACTION_BAR_WIDTH }}
    >
      <span className="font-sans text-[11px] font-bold text-muted-foreground">
        Nv. {level}
      </span>
      <XpBar value={progress} className="h-2 flex-1" />
    </div>
  )
}
