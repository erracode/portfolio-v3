import { Html } from "@react-three/drei"

import { Progress } from "@/components/ui/8bit/progress"
import { useCombatStore } from "@/lib/combat-store"

interface EnemyHealthBarProps {
  enemyId: string
  yOffset: number
}

/** Billboarded DOM health bar above a guard, styled after
 * `PlayerUnitFrame`'s pixel-frame recipe (`Progress variant="retro"`). */
export function EnemyHealthBar({ enemyId, yOffset }: EnemyHealthBarProps) {
  const enemy = useCombatStore((state) => state.enemies[enemyId])

  if (!enemy || enemy.isDead) return null

  const percent = enemy.maxHealth > 0 ? (enemy.health / enemy.maxHealth) * 100 : 0

  return (
    <Html position={[0, yOffset, 0]} center distanceFactor={8} occlude={false}>
      <div className="pointer-events-none flex w-24 flex-col items-center gap-0.5">
        <span className="retro text-[7px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
          {enemy.name}
        </span>
        <Progress
          variant="retro"
          value={percent}
          progressBg="bg-red-500"
          className="h-2 w-full"
          aria-label={`Vida de ${enemy.name}`}
        />
      </div>
    </Html>
  )
}
