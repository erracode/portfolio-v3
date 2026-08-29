import { useCallback, useEffect, useRef } from "react"
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
  /** Merges an external source's (e.g. the touch joystick) flags into
   * `movementRef` via the same OR-based pattern keyboard/mouse already use
   * for `forward` below — so releasing one source never clobbers another
   * still-held source. Pass all-false flags to clear this source's
   * contribution. */
  setExternalFlags: (flags: MovementFlags) => void
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
  // Keyboard, mouse, and an external source (the touch joystick) can each
  // independently ask to move — track them separately so releasing one
  // never clobbers another still-held source.
  const keyForwardRef = useRef(false)
  const keyBackwardRef = useRef(false)
  const keyLeftRef = useRef(false)
  const keyRightRef = useRef(false)
  const mouseForwardRef = useRef(false)
  const externalFlagsRef = useRef<MovementFlags>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  const sync = useCallback(() => {
    movementRef.current.forward =
      keyForwardRef.current || mouseForwardRef.current || externalFlagsRef.current.forward
    movementRef.current.backward = keyBackwardRef.current || externalFlagsRef.current.backward
    movementRef.current.left = keyLeftRef.current || externalFlagsRef.current.left
    movementRef.current.right = keyRightRef.current || externalFlagsRef.current.right
  }, [])

  const setExternalFlags = useCallback(
    (flags: MovementFlags) => {
      externalFlagsRef.current = flags
      sync()
    },
    [sync]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      if (forward.includes(event.code)) keyForwardRef.current = true
      else if (backward.includes(event.code)) keyBackwardRef.current = true
      else if (left.includes(event.code)) keyLeftRef.current = true
      else if (right.includes(event.code)) keyRightRef.current = true
      else if (interact.includes(event.code) && !event.repeat) {
        interactPressedRef.current = true
        return
      } else return

      sync()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (forward.includes(event.code)) keyForwardRef.current = false
      else if (backward.includes(event.code)) keyBackwardRef.current = false
      else if (left.includes(event.code)) keyLeftRef.current = false
      else if (right.includes(event.code)) keyRightRef.current = false
      else return

      sync()
    }

    const handlePointerChange = (event: PointerEvent) => {
      mouseForwardRef.current = event.buttons === BOTH_MOUSE_BUTTONS
      sync()
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
  }, [sync])

  return { movementRef, interactPressedRef, setExternalFlags }
}
