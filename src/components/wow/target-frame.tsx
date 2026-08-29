import { Progress } from "@/components/ui/8bit/progress"
import { useCombatStore } from "@/lib/combat-store"

/**
 * Minimal WoW-style target frame — mirrors `PlayerUnitFrame`'s pixel-frame
 * recipe, positioned clear of it. Renders nothing while no guard is
 * targeted.
 */
export function TargetFrame() {
  const target = useCombatStore((state) =>
    state.targetId ? (state.enemies[state.targetId] ?? null) : null
  )

  if (!target) return null

  const percent = target.maxHealth > 0 ? (target.health / target.maxHealth) * 100 : 0

  return (
    <section
      aria-label="Marco de objetivo"
      className="fixed top-4 left-72 z-40 flex min-w-[190px] flex-col gap-1.5 border-y-6 border-foreground bg-card p-3 shadow-lg dark:border-ring"
    >
      <h3 className="text-sm leading-snug">{target.name}</h3>
      <Progress
        variant="retro"
        value={percent}
        progressBg="bg-red-500"
        className="h-4"
        aria-label="Vida del objetivo"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </section>
  )
}
