import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import type { DamageEvent } from "@/lib/combat-store"

const PARTICLE_COUNT = 8
const BURST_DURATION_MS = 600
const PARTICLE_SIZE = 0.06
const PARTICLE_COLOR = "#ff3b3b"
const GRAVITY = 2.2

function randomDirections(): THREE.Vector3[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = 0.4 + Math.random() * 0.5
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      0.4 + Math.random() * 0.5,
      Math.sin(angle) * radius
    )
  })
}

/**
 * One self-contained impact burst — bounded lifetime by construction, same
 * philosophy as `AxeProjectile`: driven entirely off elapsed time inside
 * `useFrame`, mirroring its position-lerp idiom. `Date.now()`/
 * `Math.random()` are impure, so both are deferred to the first `useFrame`
 * tick (never called during render) and kept in refs that are only ever
 * read inside `useFrame`, never during render. Fades to invisible by
 * `BURST_DURATION_MS`, then sits inert until the parent unmounts it once
 * the owning `DamageEvent` itself expires.
 */
function HitBurst({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const startedAtRef = useRef<number | null>(null)
  const directionsRef = useRef<THREE.Vector3[] | null>(null)

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now()
      directionsRef.current = randomDirections()
    }

    const directions = directionsRef.current
    if (!directions) return

    const elapsed = Date.now() - startedAtRef.current
    if (elapsed >= BURST_DURATION_MS) return // fully faded — stop writing transforms every frame until the parent unmounts this burst

    const t = elapsed / BURST_DURATION_MS

    group.children.forEach((child, index) => {
      const direction = directions[index]
      child.position.set(
        direction.x * t,
        direction.y * t - GRAVITY * t * t,
        direction.z * t
      )
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      material.opacity = 1 - t
    })
  })

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
        <mesh key={index}>
          <boxGeometry args={[PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE]} />
          <meshBasicMaterial color={PARTICLE_COLOR} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  )
}

interface HitEffectProps {
  events: DamageEvent[]
  position: [number, number, number]
}

/**
 * Small red particle-burst "impact" layered on top of the existing tint
 * flash (`hitFlash` in `world-guard.tsx`) — one burst per hit, driven by
 * the same per-event arrays (`enemyDamageEvents`/`playerDamageEvents`)
 * already firing `EnemyDamageNumbers`/`PlayerDamageNumbers`, so a burst
 * always tracks a real hit and nothing else.
 */
export function HitEffect({ events, position }: HitEffectProps) {
  if (events.length === 0) return null

  return (
    <>
      {events.map((event) => (
        <HitBurst key={event.id} position={position} />
      ))}
    </>
  )
}
