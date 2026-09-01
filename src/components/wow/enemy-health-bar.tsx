import { Html } from "@react-three/drei"

import { Progress } from "@/components/ui/8bit/progress"
import { useCombatStore } from "@/lib/combat-store"

interface EnemyHealthBarProps {
  enemyId: string
  yOffset: number
}

/** Billboarded DOM health-plate above a guard, in `PlayerUnitFrame`'s own
 * pixel-frame recipe (border-y + a `-mx`-offset border-x "corner step",
 * `bg-card`) scaled down for an in-world billboard — not bare floating
 * text. Needs its own `relative` so the corner-step border, which is
 * absolutely positioned, anchors to the plate instead of the `<Html>`
 * portal root. */
export function EnemyHealthBar({ enemyId, yOffset }: EnemyHealthBarProps) {
  const enemy = useCombatStore((state) => state.enemies[enemyId])

  if (!enemy || enemy.isDead) return null

  const percent = enemy.maxHealth > 0 ? (enemy.health / enemy.maxHealth) * 100 : 0

  return (
    // No `distanceFactor`: drei's `<Html>` anchors this element's screen
    // position via the camera's exact projection matrix every frame, always
    // correct at any distance — but `distanceFactor` re-scales the DOM
    // element's SIZE with a cheap `2*tan(fov/2)*euclideanDistance` estimate
    // that only matches the real perspective for an object dead-center on
    // the camera's optical axis. This orbit camera follows the player, not
    // each guard, so a guard sitting off-axis (like `guard-duke`, offset in
    // Z from the other two) gets a plate whose size diverges from that
    // approximation, reading as "detached" from its own anchor point. A
    // fixed screen-space size (WoW's actual nameplate behavior) removes the
    // divergence entirely.
    <Html position={[0, yOffset, 0]} center occlude={false}>
      <div className="pointer-events-none relative flex w-24 flex-col items-center gap-1 border-y-2 border-foreground bg-card px-2 py-1 dark:border-ring">
        <span className="retro text-[7px] leading-none">{enemy.name}</span>
        <Progress
          variant="retro"
          value={percent}
          progressBg="bg-red-500"
          className="h-1 w-full"
          aria-label={`Vida de ${enemy.name}`}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -mx-1 border-x-2 border-inherit"
        />
      </div>
    </Html>
  )
}
