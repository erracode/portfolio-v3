import { useEffect, useMemo, useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"

import type { SpriteSheetConfig } from "@/data/sprites"

interface PixelSpriteBillboardProps {
  sheet: SpriteSheetConfig
  row: number
  frameCount: number
  /** Frames per second. Ignored while `playing` is false. */
  fps?: number
  /** false pins the sprite on frame 0 of `row` — used for static props. */
  playing?: boolean
  /** Mirrors the sprite horizontally (e.g. facing left vs. right). */
  flipX?: boolean
  /** World-units-per-sheet-pixel scale factor. */
  scale?: number
  position?: [number, number, number]
  onClick?: () => void
  /** Multiplies the sprite material's color — a no-op ("#ffffff", the
   * default) for every existing call site. Used for a guard's red
   * hit-flash without a second texture. */
  tint?: THREE.ColorRepresentation
}

/**
 * Billboarded pixel-art sprite for the 3D world — reproduces the UV-offset
 * flipbook technique from the sibling portfolio-v2 engine's `SpriteFlipbook`
 * class as a plain r3f component instead of an imperative class driven
 * from outside React. A `THREE.Sprite` is inherently camera-facing, which
 * is exactly the "2.5D billboard" requirement.
 */
export function PixelSpriteBillboard({
  sheet,
  row,
  frameCount,
  fps = 6,
  playing = true,
  flipX = false,
  scale = 1,
  position = [0, 0, 0],
  onClick,
  tint = "#ffffff",
}: PixelSpriteBillboardProps) {
  const texture = useLoader(THREE.TextureLoader, sheet.src)
  const elapsedRef = useRef(0)

  const frameU = useMemo(() => sheet.frameWidth / sheet.sheetWidth, [sheet])
  const frameV = useMemo(() => sheet.frameHeight / sheet.sheetHeight, [sheet])

  // three.js textures are mutable configuration objects by design — this is
  // the standard r3f pattern for setting up a texture after `useLoader`,
  // not an accidental state mutation. CSS `image-rendering: pixelated`
  // (used by the DOM sprite preview elsewhere) has zero effect on WebGL
  // texture sampling, so the filter must be set here on the object itself.
  useEffect(() => {
    /* eslint-disable react-hooks/immutability -- texture config objects are meant to be mutated after load; no ref-based escape hatch exists for non-ref hook results. */
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    // RepeatWrapping is required for offset/repeat atlasing (and the
    // negative-repeat flip trick below) to sample correctly — the default
    // ClampToEdgeWrapping only behaves for a single untiled [0,1] texture.
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    /* eslint-enable react-hooks/immutability */
    texture.repeat.set(flipX ? -frameU : frameU, frameV)
  }, [texture, frameU, frameV, flipX])

  useFrame((_state, delta) => {
    let frameIndex = 0

    if (playing && frameCount > 1) {
      elapsedRef.current += delta
      const frameDuration = 1 / fps
      frameIndex = Math.floor(elapsedRef.current / frameDuration) % frameCount
    }

    const offsetX = flipX ? (frameIndex + 1) * frameU : frameIndex * frameU
    const offsetY = 1 - (row + 1) * frameV
    texture.offset.set(offsetX, offsetY)
  })

  return (
    <sprite
      position={position}
      scale={[sheet.frameWidth * scale, sheet.frameHeight * scale, 1]}
      onClick={onClick}
      onPointerOver={onClick && (() => (document.body.style.cursor = "pointer"))}
      onPointerOut={onClick && (() => (document.body.style.cursor = "auto"))}
    >
      <spriteMaterial map={texture} color={tint} transparent alphaTest={0.5} />
    </sprite>
  )
}
