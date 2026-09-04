import { Progress } from "@/components/ui/8bit/progress"

import type { ResourceStat } from "@/lib/player-store"
import { cn } from "@/lib/utils"

function formatStat({ current, max }: ResourceStat): string {
  return `${current.toLocaleString()} / ${max.toLocaleString()}`
}

function percentOf({ current, max }: ResourceStat): number {
  return max > 0 ? (current / max) * 100 : 0
}

export interface StatBarProps {
  label: string
  stat: ResourceStat
  progressBg: string
  /** Touch devices have no `:hover` — set true so the numeric value renders
   * unconditionally instead of relying on `group-hover`. Desktop leaves this
   * unset and keeps the existing hover-only reveal. */
  alwaysShowValue?: boolean
  /** Overrides the bar's height class (default `h-4`). The retro `Progress`
   * variant always renders a fixed 20 segments across the bar's width, so a
   * narrower bar at the default height reads as visibly "noisier" (each
   * segment is a tall thin sliver) than a wider one at the same height —
   * `MobileUnitFrames` passes a shorter bar to keep segment proportions
   * closer to `EnemyHealthBar`'s. */
  barClassName?: string
}

/** Shared health/resource bar recipe — a retro `Progress` with the exact
 * numeric value revealed on hover. Used by both the desktop unit frames
 * and the compact mobile ones. */
export function StatBar({ label, stat, progressBg, alwaysShowValue, barClassName }: StatBarProps) {
  return (
    <div className="group relative">
      <Progress
        variant="retro"
        value={percentOf(stat)}
        progressBg={progressBg}
        className={barClassName ?? "h-4"}
        aria-label={label}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center text-xs leading-none font-semibold tabular-nums text-white opacity-0 transition-opacity [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]",
          alwaysShowValue ? "opacity-100" : "group-hover:opacity-100"
        )}
      >
        {formatStat(stat)}
      </span>
    </div>
  )
}
