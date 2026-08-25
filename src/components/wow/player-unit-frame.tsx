import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
// import { Badge } from "@/components/ui/8bit/badge"
import { Progress } from "@/components/ui/8bit/progress"

import {
  usePlayer,
  type ResourceStat,
  type ResourceType,
} from "@/lib/player-store"

const RESOURCE_BAR_BG: Record<ResourceType, string> = {
  energy: "bg-yellow-500",
  mana: "bg-blue-500",
}

const RESOURCE_LABEL: Record<ResourceType, string> = {
  energy: "Energía",
  mana: "Maná",
}

function formatStat({ current, max }: ResourceStat): string {
  return `${current.toLocaleString()} / ${max.toLocaleString()}`
}

function percentOf({ current, max }: ResourceStat): number {
  return max > 0 ? (current / max) * 100 : 0
}

interface StatBarProps {
  label: string
  stat: ResourceStat
  progressBg: string
}

function StatBar({ label, stat, progressBg }: StatBarProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <Progress
        variant="retro"
        value={percentOf(stat)}
        progressBg={progressBg}
        className="h-3"
        aria-label={label}
      />
      <span className="text-right text-[10px] leading-tight tabular-nums text-muted-foreground">
        {formatStat(stat)}
      </span>
    </div>
  )
}

/**
 * WoW-style player unit frame pinned to the top-left corner. Reads the
 * current player from the store; purely presentational HUD, no interactivity.
 */
export function PlayerUnitFrame() {
  const player = usePlayer()

  return (
    <section
      aria-label="Marco de unidad del jugador"
      className="fixed top-4 left-4 z-40 flex items-center gap-3 border-y-6 border-foreground bg-card p-3 shadow-lg dark:border-ring"
    >
      <div className="relative">
        <Avatar variant="default" className="size-14">
          <AvatarImage
            src={player.portrait}
            alt={`Retrato de ${player.name}`}
            className="[image-rendering:pixelated]"
          />
          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {/* <Badge
          variant="outline"
          className="absolute -bottom-1.5 -left-2 z-10 bg-card text-[9px] leading-none"
        >
          Lv. {player.level}
        </Badge> */}
      </div>

      <div className="flex min-w-[190px] flex-col gap-1.5">
        <h3 className="flex flex-wrap items-baseline gap-x-2 text-sm leading-snug">
          {player.name}
          <span className="font-sans text-[11px] font-normal tracking-normal text-muted-foreground">
            {player.title}
          </span>
        </h3>

        <StatBar label="Vida" stat={player.health} progressBg="bg-green-500" />
        <StatBar
          label={RESOURCE_LABEL[player.resource.type]}
          stat={player.resource}
          progressBg={RESOURCE_BAR_BG[player.resource.type]}
        />
      </div>

      {/* Pixel-frame recipe: side borders step outward past the top/bottom ones. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </section>
  )
}
