import { useEffect, useRef, useState } from "react"

import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { PLAYER_SPRITE } from "@/data/sprites"
import { useResumeZergStore } from "@/lib/resume-zerg-store"

const SCALE = 0.2
const SPEED = 220 // px/second
const ARRIVE_EPSILON = 4
const FLIP_THRESHOLD = 2
const VIGNETTE_MS = 450

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest("a, button, input, textarea, select, [role='button'], [role='dialog']") !== null
}

/**
 * Click-anywhere-to-walk companion for the resume page — a Warcraft
 * 3-style "right-click to move" (here just left-click, no unit selection
 * step) rendered as a plain DOM sprite, not a 3D scene: this page has no
 * Three.js and shouldn't need one just for a decorative walker. Reuses
 * `SpriteAnimation`'s pure-CSS frame-stepping and the same idle/walk
 * player sprite the game itself uses. Walks in a straight line over the
 * page content (no pathfinding/collision) — it's a companion, not a unit.
 *
 * Registers its own position ref into `resume-zerg-store` so a Zerg Rush
 * wave (see `ResumeZergRush`) knows where to chase and can land contact
 * damage — same "component owns the ref, store just points at it"
 * pattern `combat-store.ts` uses for the 3D game's player.
 */
export function ResumeWalker() {
  const [position, setPosition] = useState(() => ({
    x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
    y: typeof window === "undefined" ? 0 : window.innerHeight - 96,
  }))
  const [moving, setMoving] = useState(false)
  const [flipX, setFlipX] = useState(false)
  const positionRef = useRef(position)
  const targetRef = useRef(position)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const lastPlayerHitAt = useResumeZergStore((state) => state.lastPlayerHitAt)
  const registerPlayerPositionRef = useResumeZergStore((state) => state.registerPlayerPositionRef)

  useEffect(() => {
    registerPlayerPositionRef(positionRef)
  }, [registerPlayerPositionRef])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (isInteractiveTarget(event.target)) return
      targetRef.current = { x: event.clientX, y: event.clientY }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => window.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  // Throwing (Space, see `ResumeZergRush`) plants the character in place —
  // it cancels whatever walk order is in progress instead of letting you
  // freely move and attack at the same time. That's what actually makes
  // kiting a skill: you have to choose the moment to stop and swing, not
  // just hold a move order and spam the axe for free.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return
      targetRef.current = positionRef.current
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const step = (time: number) => {
      const last = lastTimeRef.current ?? time
      const delta = Math.min((time - last) / 1000, 0.1)
      lastTimeRef.current = time

      const current = positionRef.current
      const target = targetRef.current
      const dx = target.x - current.x
      const dy = target.y - current.y
      const distance = Math.hypot(dx, dy)

      if (distance > ARRIVE_EPSILON) {
        const travel = Math.min(distance, SPEED * delta)
        const next = {
          x: current.x + (dx / distance) * travel,
          y: current.y + (dy / distance) * travel,
        }
        positionRef.current = next
        setPosition(next)
        setMoving(true)
        if (Math.abs(dx) > FLIP_THRESHOLD) setFlipX(dx < 0)
      } else {
        setMoving(false)
      }

      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const activeRow = moving ? PLAYER_SPRITE.rows.walk : PLAYER_SPRITE.rows.idle

  return (
    <>
      {lastPlayerHitAt > 0 && (
        <div
          key={lastPlayerHitAt}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 print:hidden"
          style={{
            animation: `damage-vignette ${VIGNETTE_MS}ms ease-out forwards`,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.35) 100%)",
          }}
        />
      )}

      <div
        className="pointer-events-none fixed z-20 print:hidden"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -100%) scaleX(${flipX ? -1 : 1})`,
        }}
      >
        <SpriteAnimation
          src={PLAYER_SPRITE.src}
          frameWidth={PLAYER_SPRITE.frameWidth}
          frameHeight={PLAYER_SPRITE.frameHeight}
          frameCount={activeRow.frameCount}
          sheetWidth={PLAYER_SPRITE.sheetWidth}
          sheetHeight={PLAYER_SPRITE.sheetHeight}
          row={activeRow.row}
          fps={moving ? 6 : 2}
          scale={SCALE}
          aria-label="Personaje del portfolio — hacé click en cualquier parte para que camine hasta ahí"
        />
      </div>
    </>
  )
}
