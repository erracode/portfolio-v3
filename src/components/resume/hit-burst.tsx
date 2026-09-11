import { useState } from "react"
import type { CSSProperties } from "react"

const PARTICLE_COUNT = 8
const BURST_DURATION_MS = 600
const PARTICLE_COLOR = "#ff3b3b"
const PARTICLE_SIZE = 5 // px
const MIN_RADIUS = 18
const MAX_RADIUS = 42

interface Particle {
  dx: number
  dy: number
}

function randomParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS)
    return {
      dx: Math.cos(angle) * radius,
      // Biased downward (CSS y grows down) — echoes the 3D burst's gravity
      // arc without needing a multi-keyframe parabola.
      dy: Math.sin(angle) * radius * 0.6 + radius * 0.5,
    }
  })
}

interface HitBurstProps {
  x: number
  y: number
}

/**
 * Plain-DOM/CSS equivalent of the 3D game's `HitEffect` particle burst
 * (`hit-effect.tsx`'s `useFrame`-driven Three.js group) — same particle
 * count, duration, and color, animated via the `hit-burst` keyframe
 * (index.css) instead of a per-frame Three.js loop, since the resume page
 * deliberately has no react-three-fiber canvas. Bounded lifetime by
 * construction: the parent unmounts it after `BURST_DURATION_MS`, same
 * "remount-keyed, animation-driven, no cleanup timer" idiom as
 * `damage-vignette`.
 */
export function HitBurst({ x, y }: HitBurstProps) {
  const [particles] = useState(randomParticles)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed z-20 print:hidden" style={{ left: x, top: y }}>
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-xs"
          style={
            {
              width: PARTICLE_SIZE,
              height: PARTICLE_SIZE,
              backgroundColor: PARTICLE_COLOR,
              "--hit-burst-dx": `${particle.dx}px`,
              "--hit-burst-dy": `${particle.dy}px`,
              animation: `hit-burst ${BURST_DURATION_MS}ms ease-out forwards`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export { BURST_DURATION_MS as HIT_BURST_DURATION_MS }
