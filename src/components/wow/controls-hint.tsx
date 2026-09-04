import { useEffect, useState } from "react"

import { useIsTouchDevice } from "@/lib/use-is-mobile"

const DISMISSED_STORAGE_KEY = "wow-controls-hint-dismissed"
const AUTO_DISMISS_MS = 8000

/**
 * One-time "how do I move" banner for first-time visitors. Dismisses itself
 * on the first keypress/tap anywhere (i.e. the moment someone actually tries
 * to move), on explicit tap, or after a timeout — and never shows again on
 * this browser once dismissed (localStorage), same persistence pattern as
 * the rest of the HUD's per-visitor state.
 */
export function ControlsHint() {
  const isTouchDevice = useIsTouchDevice()
  const [isVisible, setIsVisible] = useState(
    () => window.localStorage.getItem(DISMISSED_STORAGE_KEY) !== "true"
  )

  const dismiss = () => {
    setIsVisible(false)
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, "true")
  }

  useEffect(() => {
    if (!isVisible) return

    window.addEventListener("keydown", dismiss)
    window.addEventListener("pointerdown", dismiss)
    const timeout = window.setTimeout(dismiss, AUTO_DISMISS_MS)

    return () => {
      window.removeEventListener("keydown", dismiss)
      window.removeEventListener("pointerdown", dismiss)
      window.clearTimeout(timeout)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-4 py-2 text-center dark:border-ring">
      <p className="retro text-xs">
        {isTouchDevice
          ? "Desliza el joystick para moverte"
          : "Usa WASD o las flechas para moverte"}
      </p>
    </div>
  )
}
