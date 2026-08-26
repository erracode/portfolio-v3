import { useCallback, useEffect, useRef, useState } from "react"
import { play } from "cuelume"

import { Toggle } from "@/components/ui/8bit/toggle"
import { useLogStore } from "@/lib/log-store"

const SLOT_COUNT = 9

function isEditableElement(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false
  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  )
}

/**
 * WoW-style action bar centered at the bottom. Nine empty square slots with
 * the 8bit pixel border, each bound to a number key (1-9). Slots start empty;
 * the Grimoire/Spellbook will assign actions to them later.
 */
export function ActionBar() {
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const activate = useCallback((index: number) => {
    setActiveSlot(index)
    useLogStore.getState().addLog("system", `Ranura de acción ${index} activada`)
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setActiveSlot(null), 150)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isEditableElement(event.target)) return

      const index = Number(event.key)
      if (index >= 1 && index <= SLOT_COUNT) {
        event.preventDefault()
        // Keyboard shortcut bypasses the DOM click cuelume listens for.
        play("toggle")
        activate(index)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activate])

  return (
    <nav
      aria-label="Barra de acciones"
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2"
    >
      {Array.from({ length: SLOT_COUNT }, (_, i) => i + 1).map((index) => (
        <div key={index} className="relative">
          <Toggle
            variant="outline"
            aria-label={`Ranura de acción ${index}`}
            pressed={activeSlot === index}
            onPressedChange={() => activate(index)}
            className="size-10"
            data-cuelume-toggle
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1 right-1 z-10 text-[8px] leading-none text-muted-foreground"
          >
            {index}
          </span>
        </div>
      ))}
    </nav>
  )
}
