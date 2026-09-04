import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
import { StatBar } from "@/components/wow/stat-bar"

import { useCombatStore } from "@/lib/combat-store"
import { usePlayer } from "@/lib/player-store"
import { RESOURCE_BAR_BG } from "@/lib/resource-colors"

/** Stacked player + target frames for narrow viewports — same store reads
 * as `PlayerUnitFrame`/`TargetFrame`, compacted into a single fixed column
 * instead of two side-by-side panels. */
export function MobileUnitFrames() {
  const player = usePlayer()
  const target = useCombatStore((state) =>
    state.targetId ? (state.enemies[state.targetId] ?? null) : null
  )

  return (
    <div className="fixed top-3 left-3 z-40 flex w-40 flex-col gap-1.5">
      <section
        aria-label="Marco de unidad del jugador"
        className="flex items-center gap-2 border-y-4 border-foreground bg-card p-2 shadow-lg dark:border-ring"
      >
        <Avatar variant="default" className="size-10 shrink-0">
          <AvatarImage
            src={player.portrait}
            alt={`Retrato de ${player.name}`}
            className="[image-rendering:pixelated]"
          />
          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <StatBar
            label="Vida"
            stat={player.health}
            progressBg="bg-green-500"
            barClassName="h-2"
          />
          <StatBar
            label={player.resource.type === "mana" ? "Maná" : "Energía"}
            stat={player.resource}
            progressBg={RESOURCE_BAR_BG[player.resource.type]}
            barClassName="h-2"
          />
        </div>
      </section>

      {target && (
        <section
          aria-label="Marco de objetivo"
          className="flex flex-col gap-1 border-y-4 border-foreground bg-card p-2 shadow-lg dark:border-ring"
        >
          <h3 className="truncate text-xs leading-snug">{target.name}</h3>
          <StatBar
            label="Vida del objetivo"
            stat={{ current: target.health, max: target.maxHealth }}
            progressBg="bg-red-500"
            barClassName="h-2"
          />
        </section>
      )}
    </div>
  )
}
