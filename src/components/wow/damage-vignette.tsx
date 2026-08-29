import { useCombatStore } from "@/lib/combat-store"

const VIGNETTE_MS = 450

/** Full-screen red flash re-triggered by remounting the element keyed on
 * `lastPlayerHitAt` — pure CSS, no JS timer, same approach as
 * `CooldownOverlay` in `action-bar.tsx`. Reads clearly even when the
 * player isn't looking at the health bar. */
export function DamageVignette() {
  const lastPlayerHitAt = useCombatStore((state) => state.lastPlayerHitAt)

  if (lastPlayerHitAt <= 0) return null

  return (
    <div
      key={lastPlayerHitAt}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        animation: `damage-vignette ${VIGNETTE_MS}ms ease-out forwards`,
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.35) 100%)",
      }}
    />
  )
}
