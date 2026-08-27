import { useRef } from "react"
import type { ComponentRef, RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

import { WORLD_CONFIG } from "@/lib/world-config"

interface WorldCameraRigProps {
  positionRef: RefObject<THREE.Vector3>
}

/**
 * WoW-style camera: left-click-drag orbits freely around the player (drei's
 * `OrbitControls`), while the camera's position translates by the player's
 * own per-frame movement delta each frame — preserving whatever orbit
 * angle/distance the user last chose as the player walks, instead of
 * resetting to a fixed offset every tick (the actual bug in the sibling
 * portfolio-v2 engine, where `OrbitControls` fought a rigid per-tick
 * override). Panning is disabled — WoW's camera never pans.
 *
 * The initial target below assumes the player always spawns at the world
 * origin (true today, matching `WorldScene`'s `positionRef` initial value)
 * rather than reading `positionRef.current` during render, which the
 * project's stricter ref-access lint rule disallows.
 */
export function WorldCameraRig({ positionRef }: WorldCameraRigProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const previousPosition = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    const current = positionRef.current
    const delta = current.clone().sub(previousPosition.current)

    if (delta.lengthSq() > 0) {
      controls.object.position.add(delta)
      controls.target.add(delta)
      previousPosition.current.copy(current)
    }

    controls.update()
  })

  const { lookAtHeight, dampingFactor, minDistance, maxDistance, minPolarAngle, maxPolarAngle } =
    WORLD_CONFIG.camera

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, lookAtHeight, 0]}
      enablePan={false}
      enableDamping
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
    />
  )
}
