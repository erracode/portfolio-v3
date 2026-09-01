import { useEffect, useMemo, useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"

const AXE_FRAME_COUNT = 8
const AXE_SHEET_SRC = "/game/axe-sheet.png"
const FRAME_U = 1 / AXE_FRAME_COUNT // 220x220 square frames, single row
const SPIN_FPS = 24
// World-unit footprint — sized against the player/guards' own ~1.5-unit
// sprite height (a thrown axe should read as roughly half a character's
// height, not bigger than one, which `PixelSpriteBillboard`'s default
// scale convention produced here).
const AXE_SIZE = 0.6

interface AxeProjectileProps {
  from: [number, number, number]
  to: [number, number, number]
  startedAt: number
  durationMs: number
  onDone: () => void
}

/**
 * Lerps a spinning axe from `from` to `to` over `durationMs`, then calls
 * `onDone` so the parent removes it — a bounded lifetime by construction,
 * fixing v2's axe projectile that never despawned.
 *
 * Unlike every other in-world sprite (player/NPC/guards/chest), this is a
 * flat `PlaneGeometry` tilted `rotation.x = -Math.PI/2` to lie flat and
 * face up, matching v2's `AxeAnimation`'s own orientation — NOT a
 * `PixelSpriteBillboard` (`THREE.Sprite`), which is always camera-facing.
 * A thrown weapon reads as tumbling through 3D space; a billboard would
 * always present the same big flat square straight at the camera instead.
 */
export function AxeProjectile({ from, to, startedAt, durationMs, onDone }: AxeProjectileProps) {
  const groupRef = useRef<THREE.Group>(null)
  const fromVec = useMemo(() => new THREE.Vector3(...from), [from])
  const toVec = useMemo(() => new THREE.Vector3(...to), [to])
  const doneRef = useRef(false)
  const elapsedRef = useRef(0)

  const texture = useLoader(THREE.TextureLoader, AXE_SHEET_SRC)

  useEffect(() => {
    /* eslint-disable react-hooks/immutability -- texture config objects are meant to be mutated after load; no ref-based escape hatch exists for non-ref hook results. */
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    /* eslint-enable react-hooks/immutability */
    texture.repeat.set(FRAME_U, 1)
  }, [texture])

  useFrame((_state, delta) => {
    if (doneRef.current) return

    const t = THREE.MathUtils.clamp((Date.now() - startedAt) / durationMs, 0, 1)
    if (groupRef.current) groupRef.current.position.lerpVectors(fromVec, toVec, t)

    elapsedRef.current += delta
    const frameIndex = Math.floor(elapsedRef.current * SPIN_FPS) % AXE_FRAME_COUNT
    texture.offset.set(frameIndex * FRAME_U, 0)

    if (t >= 1) {
      doneRef.current = true
      onDone()
    }
  })

  return (
    <group ref={groupRef} position={from}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[AXE_SIZE, AXE_SIZE]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
