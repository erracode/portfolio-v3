import { useCallback, useEffect, useRef, useState } from "react"
import { play } from "cuelume"

import { Toggle } from "@/components/ui/8bit/toggle"
import { useCombatStore } from "@/lib/combat-store"
import { useLogStore } from "@/lib/log-store"
import { WORLD_CONFIG } from "@/lib/world-config"

const SLOT_COUNT = 9
const AXE_SLOT_INDEX = 1
/** axe-sheet.png is 8 square frames (1760/220) in a single row. Sizing the
 * background as a percentage of the icon's OWN box — instead of assuming
 * the slot renders at an exact pixel size — keeps frame 0 exactly filling
 * the slot regardless of the 8bit `Toggle`'s actual rendered box (which
 * runs a few px taller than its `size-10` class due to its own pixel-frame
 * border recipe). */
const AXE_FRAME_COUNT = 8

function AxeIcon() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [image-rendering:pixelated]"
      style={{
        backgroundImage: "url(/game/axe-sheet.png)",
        backgroundPosition: "0 0",
        backgroundSize: `${AXE_FRAME_COUNT * 100}% 100%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  )
}

/** Bottom-up wipe re-triggered by remounting the element keyed on
 * `axeCooldownEndsAt` — pure CSS, no JS timer, same philosophy as
 * `sprite-step` in index.css. */
function CooldownOverlay({ cooldownEndsAt }: { cooldownEndsAt: number }) {
  if (cooldownEndsAt <= 0) return null

  return (
    <div
      key={cooldownEndsAt}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/60"
      style={{
        animation: `cooldown-wipe ${WORLD_CONFIG.axe.cooldownMs}ms linear forwards`,
      }}
    />
  )
}

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
  const axeCooldownEndsAt = useCombatStore((state) => state.axeCooldownEndsAt)

  const activate = useCallback((index: number) => {
    setActiveSlot(index)
    useLogStore.getState().addLog("system", `Ranura de acción ${index} activada`)
    if (index === AXE_SLOT_INDEX) useCombatStore.getState().requestAxeCast()
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
          {index === AXE_SLOT_INDEX && (
            <>
              <AxeIcon />
              <CooldownOverlay cooldownEndsAt={axeCooldownEndsAt} />
            </>
          )}
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
