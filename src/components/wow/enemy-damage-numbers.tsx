import { useEffect } from "react"
import { Html } from "@react-three/drei"
import { useShallow } from "zustand/react/shallow"

import { type DamageEvent, useCombatStore } from "@/lib/combat-store"

const DAMAGE_TEXT_MS = 900

function DamageNumber({
  event,
  enemyId,
  onExpire,
}: {
  event: DamageEvent
  enemyId: string
  onExpire: (enemyId: string, id: number) => void
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => onExpire(enemyId, event.id), DAMAGE_TEXT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [enemyId, event.id, onExpire])

  return (
    <span
      className="retro absolute text-[9px] text-yellow-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
      style={{ animation: `float-damage ${DAMAGE_TEXT_MS}ms ease-out forwards` }}
    >
      -{event.amount}
    </span>
  )
}

interface EnemyDamageNumbersProps {
  enemyId: string
  yOffset: number
}

/** Floating "-N" combat text above a guard on axe hit — classic WoW
 * damage-number convention. Billboarded like `EnemyHealthBar`. Each event
 * schedules its own removal (bounded lifetime by construction, same
 * philosophy as `AxeProjectile`). */
export function EnemyDamageNumbers({ enemyId, yOffset }: EnemyDamageNumbersProps) {
  // `?? []` composes a new array reference every call when this enemy has no
  // pending events (its default state) — without useShallow, React's
  // useSyncExternalStore never sees a stable snapshot and loops forever.
  const events = useCombatStore(
    useShallow((state) => state.enemyDamageEvents[enemyId] ?? [])
  )
  const removeEvent = useCombatStore((state) => state.removeEnemyDamageEvent)

  if (events.length === 0) return null

  return (
    <Html position={[0, yOffset, 0]} center distanceFactor={8} occlude={false}>
      <div className="pointer-events-none relative flex items-center justify-center">
        {events.map((event) => (
          <DamageNumber key={event.id} event={event} enemyId={enemyId} onExpire={removeEvent} />
        ))}
      </div>
    </Html>
  )
}
