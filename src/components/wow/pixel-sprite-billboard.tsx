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
  // r3f's loader cache returns the SAME `THREE.Texture` instance for every
  // component loading this `src` — cloning gives each instance its own
  // offset/repeat state so multiple sprites sharing one sheet (e.g. the 5
  // world flags) don't fight over a single texture's `.offset` in
  // `useFrame`.
  const ownTexture = useMemo(() => texture.clone(), [texture])
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
    ownTexture.magFilter = THREE.NearestFilter
    ownTexture.minFilter = THREE.NearestFilter
    ownTexture.colorSpace = THREE.SRGBColorSpace
    // RepeatWrapping is required for offset/repeat atlasing (and the
    // negative-repeat flip trick below) to sample correctly — the default
    // ClampToEdgeWrapping only behaves for a single untiled [0,1] texture.
    ownTexture.wrapS = THREE.RepeatWrapping
    ownTexture.wrapT = THREE.RepeatWrapping
    ownTexture.repeat.set(flipX ? -frameU : frameU, frameV)
    // `.clone()` resets `version` to 0, and the renderer only uploads a
    // texture to the GPU when `version > 0` — without this, the cloned
    // texture would never actually render.
    ownTexture.needsUpdate = true
    /* eslint-enable react-hooks/immutability */
  }, [ownTexture, frameU, frameV, flipX])

  // Separate from the setup effect above on purpose: that effect's deps
  // (frameU/frameV/flipX) change independently of `ownTexture` identity, and
  // running dispose on every one of those re-runs would free a texture still
  // actively in use by this sprite. This effect only tears down on unmount
  // or when `ownTexture` itself is replaced by a new clone.
  useEffect(() => {
    return () => {
      ownTexture.dispose()
    }
  }, [ownTexture])

  useFrame((_state, delta) => {
    let frameIndex = 0

    if (playing && frameCount > 1) {
      elapsedRef.current += delta
      const frameDuration = 1 / fps
      frameIndex = Math.floor(elapsedRef.current / frameDuration) % frameCount
    }

    const offsetX = flipX ? (frameIndex + 1) * frameU : frameIndex * frameU
    const offsetY = 1 - (row + 1) * frameV
    ownTexture.offset.set(offsetX, offsetY)
  })

  return (
    <sprite
      position={position}
      scale={[sheet.frameWidth * scale, sheet.frameHeight * scale, 1]}
      onClick={onClick}
      onPointerOver={onClick && (() => (document.body.style.cursor = "pointer"))}
      onPointerOut={onClick && (() => (document.body.style.cursor = "auto"))}
    >
      <spriteMaterial map={ownTexture} color={tint} transparent alphaTest={0.5} />
    </sprite>
  )
}
