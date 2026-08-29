import { useCallback, useEffect, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

import type { MovementFlags } from "@/lib/use-movement-input"
import { useIsTouchDevice } from "@/lib/use-is-mobile"
import { WORLD_CONFIG } from "@/lib/world-config"

interface TouchJoystickProps {
  setExternalFlags: (flags: MovementFlags) => void
}

interface JoystickCenter {
  x: number
  y: number
}

const { baseDiameter, thumbDiameter, deadZone } = WORLD_CONFIG.mobile.joystick
const BASE_RADIUS = baseDiameter / 2
const THUMB_RADIUS = thumbDiameter / 2
const MAX_THUMB_TRAVEL = BASE_RADIUS - THUMB_RADIUS

/** 8 discrete direction buckets, indexed by `Math.round(angleDeg / 45) % 8`
 * with 0deg = screen-right and angle increasing counter-clockwise (i.e.
 * "up" on screen = forward = 90deg). */
const SECTOR_FLAGS: MovementFlags[] = [
  { forward: false, backward: false, left: false, right: true },
  { forward: true, backward: false, left: false, right: true },
  { forward: true, backward: false, left: false, right: false },
  { forward: true, backward: false, left: true, right: false },
  { forward: false, backward: false, left: true, right: false },
  { forward: false, backward: true, left: true, right: false },
  { forward: false, backward: true, left: false, right: false },
  { forward: false, backward: true, left: false, right: true },
]
const ZERO_FLAGS: MovementFlags = {
  forward: false,
  backward: false,
  left: false,
  right: false,
}

function thumbTransform(x: number, y: number): string {
  return `translate(-50%, -50%) translate(${x}px, ${y}px)`
}

/**
 * Circular virtual joystick — discrete 8-direction sectors merged into the
 * shared movement state via `setExternalFlags` (see `useMovementInput`), so
 * a still-held keyboard key never gets clobbered by a joystick release.
 * Mounts only on coarse-pointer (touch) devices.
 */
export function TouchJoystick({ setExternalFlags }: TouchJoystickProps) {
  const isTouchDevice = useIsTouchDevice()
  const thumbRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef<JoystickCenter | null>(null)
  const activePointerRef = useRef<number | null>(null)

  const moveThumb = useCallback((x: number, y: number) => {
    const el = thumbRef.current
    if (el) el.style.transform = thumbTransform(x, y)
  }, [])

  const reset = useCallback(() => {
    centerRef.current = null
    activePointerRef.current = null
    moveThumb(0, 0)
    setExternalFlags(ZERO_FLAGS)
  }, [moveThumb, setExternalFlags])

  // `isTouchDevice` flipping false mid-drag makes this component render
  // `null` without ever firing `pointerup`/`pointercancel` (and true
  // unmount, e.g. `WorldScene` going away, skips them too) — depending on
  // `isTouchDevice` here means React runs this cleanup on that transition
  // as well as on real unmount, so this source's contribution is always
  // cleared no matter how the joystick goes away.
  useEffect(() => {
    return () => setExternalFlags(ZERO_FLAGS)
  }, [isTouchDevice, setExternalFlags])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== null) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    activePointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const center = centerRef.current
    if (!center || activePointerRef.current !== event.pointerId) return
    event.preventDefault()

    const dx = event.clientX - center.x
    const dy = event.clientY - center.y
    const distance = Math.hypot(dx, dy)

    if (distance < deadZone * BASE_RADIUS) {
      moveThumb(0, 0)
      setExternalFlags(ZERO_FLAGS)
      return
    }

    const travel = Math.min(distance, MAX_THUMB_TRAVEL)
    moveThumb((dx / distance) * travel, (dy / distance) * travel)

    // Screen y grows downward — flip it so "up" maps to a positive angle
    // (forward), matching the sector table's counter-clockwise-from-right layout.
    const angleDeg = (Math.atan2(-dy, dx) * 180) / Math.PI
    const sectorIndex = (Math.round(angleDeg / 45) + 8) % 8
    setExternalFlags(SECTOR_FLAGS[sectorIndex])
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    reset()
  }

  if (!isTouchDevice) return null

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed bottom-3 left-3 z-40 touch-none rounded-full border-6 border-foreground bg-card/70 shadow-lg select-none dark:border-ring"
      style={{ width: baseDiameter, height: baseDiameter }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        ref={thumbRef}
        className="pointer-events-none absolute top-1/2 left-1/2 rounded-full border-4 border-foreground bg-primary/80 transition-transform duration-75 ease-out dark:border-ring"
        style={{
          width: thumbDiameter,
          height: thumbDiameter,
          transform: thumbTransform(0, 0),
        }}
      />
    </div>
  )
}
