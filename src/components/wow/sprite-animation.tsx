import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

interface SpriteAnimationProps {
  /** Public path to the sprite sheet image. */
  src: string
  /** Pixel size of a single frame, at the sheet's native resolution. */
  frameWidth: number
  frameHeight: number
  /** How many frames to step through, left to right, starting at (0, 0). */
  frameCount: number
  /** Full sheet size — needed even when only the top row is animated, so
   * the background lines up instead of being scaled to the frame box. */
  sheetWidth: number
  sheetHeight: number
  fps?: number
  /** Uniform display scale, e.g. 0.25 to shrink a 250px frame into a 56px
   * avatar. The animation math stays in native pixels either way — this
   * only scales the rendered box via CSS transform. Default 1. */
  scale?: number
  className?: string
  "aria-label"?: string
}

/**
 * Frame-steps a horizontal strip of a sprite sheet via the `sprite-step`
 * CSS keyframe (see index.css) — pure CSS, no timers, no dependency.
 * Only walks the sheet's top row (background-position-y stays 0), so a
 * multi-row sheet needs its loopable animation to be the first row.
 */
export function SpriteAnimation({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  sheetWidth,
  sheetHeight,
  fps = 6,
  scale = 1,
  className,
  "aria-label": ariaLabel,
}: SpriteAnimationProps) {
  const duration = frameCount / fps

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("shrink-0 overflow-hidden", className)}
      style={{ width: frameWidth * scale, height: frameHeight * scale }}
    >
      <div
        className="[image-rendering:pixelated]"
        style={
          {
            width: frameWidth,
            height: frameHeight,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
            animation: `sprite-step ${duration}s steps(${frameCount}) infinite`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            "--sprite-end": `-${frameWidth * frameCount}px`,
          } as CSSProperties
        }
      />
    </div>
  )
}
