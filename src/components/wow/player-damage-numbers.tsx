import { useEffect } from "react"

import { type DamageEvent, useCombatStore } from "@/lib/combat-store"
import { useIsMobile } from "@/lib/use-is-mobile"

const DAMAGE_TEXT_MS = 900

function DamageNumber({
  event,
  onExpire,
}: {
  event: DamageEvent
  onExpire: (id: number) => void
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => onExpire(event.id), DAMAGE_TEXT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [event.id, onExpire])

  return (
    <span
      aria-hidden="true"
      className={`retro absolute text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] ${
        event.isMiss ? "text-gray-300" : "text-red-500"
      }`}
      style={{ animation: `float-damage ${DAMAGE_TEXT_MS}ms ease-out forwards` }}
    >
      {event.isMiss ? "¡Falló!" : `-${event.amount}`}
    </span>
  )
}

/** Floating "-N" combat text near the player's unit frame — the DOM
 * counterpart to `EnemyDamageNumbers`' in-Canvas version, since the
 * player's own HUD frame lives outside the `<Canvas>` boundary. Each
 * event schedules its own removal (bounded lifetime by construction, same
 * philosophy as `AxeProjectile`). */
export function PlayerDamageNumbers() {
  const isMobile = useIsMobile()
  const events = useCombatStore((state) => state.playerDamageEvents)
  const removeEvent = useCombatStore((state) => state.removePlayerDamageEvent)

  if (events.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed z-40 ${isMobile ? "top-20 left-8" : "top-24 left-10"}`}
    >
      {events.map((event) => (
        <DamageNumber key={event.id} event={event} onExpire={removeEvent} />
      ))}
    </div>
  )
}
