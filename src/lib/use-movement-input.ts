import { useEffect, useRef } from "react"
import type { RefObject } from "react"

import { WORLD_CONFIG } from "@/lib/world-config"

export interface MovementFlags {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

export interface MovementInput {
  movementRef: RefObject<MovementFlags>
  /** Edge-triggered: set to true for one frame after "E" is pressed. The
   * caller must consume it (reset to false) once handled. */
  interactPressedRef: RefObject<boolean>
}

const { forward, backward, left, right, interact } = WORLD_CONFIG.keyBindings
/** `event.buttons` bitmask for left(1) + right(2) held together — the WoW
 * convention for "walk forward in the direction the camera is facing"
 * instead of holding W. */
const BOTH_MOUSE_BUTTONS = 3

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.closest("input, textarea, select, [contenteditable='true']") !== null
}

/**
 * Ref-backed movement input, polled once per frame from inside a
 * `useFrame` loop instead of driving React state (state changing 60x/sec
 * would otherwise force re-renders). Combines three sources into the same
 * `movementRef`: WASD/arrow keys, an "E" interact edge, and the WoW
 * "hold both mouse buttons to walk forward" convention. Registers/cleans up
 * its listeners via `useEffect` — the sibling portfolio-v2 engine's raw
 * `document.addEventListener` calls in a class constructor never cleaned
 * up, which this fixes.
 */
export function useMovementInput(): MovementInput {
  const movementRef = useRef<MovementFlags>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })
  const interactPressedRef = useRef(false)
  // Keyboard and mouse can each independently ask to move forward — track
  // them separately so releasing one doesn't clobber the other.
  const keyForwardRef = useRef(false)
  const mouseForwardRef = useRef(false)

  useEffect(() => {
    const syncForward = () => {
      movementRef.current.forward = keyForwardRef.current || mouseForwardRef.current
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      if (forward.includes(event.code)) {
        keyForwardRef.current = true
        syncForward()
      } else if (backward.includes(event.code)) movementRef.current.backward = true
      else if (left.includes(event.code)) movementRef.current.left = true
      else if (right.includes(event.code)) movementRef.current.right = true
      else if (interact.includes(event.code) && !event.repeat) {
        interactPressedRef.current = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (forward.includes(event.code)) {
        keyForwardRef.current = false
        syncForward()
      } else if (backward.includes(event.code)) movementRef.current.backward = false
      else if (left.includes(event.code)) movementRef.current.left = false
      else if (right.includes(event.code)) movementRef.current.right = false
    }

    const handlePointerChange = (event: PointerEvent) => {
      mouseForwardRef.current = event.buttons === BOTH_MOUSE_BUTTONS
      syncForward()
    }

    // Right-click drives the WoW-style camera/walk controls, not a
    // browser context menu.
    const handleContextMenu = (event: MouseEvent) => event.preventDefault()

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("pointerdown", handlePointerChange)
    window.addEventListener("pointerup", handlePointerChange)
    window.addEventListener("contextmenu", handleContextMenu)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("pointerdown", handlePointerChange)
      window.removeEventListener("pointerup", handlePointerChange)
      window.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  return { movementRef, interactPressedRef }
}
