import { useCallback, useEffect, useRef, useState } from "react"
import { play } from "cuelume"

import { Toggle } from "@/components/ui/8bit/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/8bit/tooltip"
import { useCombatStore } from "@/lib/combat-store"
import { useLogStore } from "@/lib/log-store"
import { useIsMobile } from "@/lib/use-is-mobile"
import { WORLD_CONFIG } from "@/lib/world-config"

const SLOT_COUNT = 9
const AXE_SLOT_INDEX = 1
/** axe-sheet.png is 8 square frames (1760/220) in a single row. Sizing the
 * background as a percentage of the icon's OWN box keeps frame 0 exactly
 * filling that box — but the box itself must be pinned to an EXPLICIT
 * pixel size (matching the slot's `size-8`/`size-10` class) rather than
 * `inset-0` of the implicitly-sized wrapper: `inset-0` ties the icon to
 * whatever the wrapper resolves to, and the 8bit `Toggle`'s own
 * pixel-frame border recipe (`border-x/y-6 -mx/my-1.5`, drawn via
 * absolutely-positioned pseudo-elements straddling the Toggle's edges)
 * visually overshoots that box by a few px — a much bigger fraction of a
 * 32px mobile slot than a 40px desktop one, which is what made the icon
 * read as overflowing again on mobile. Pinning width/height directly
 * removes that coupling regardless of slot size. */
const AXE_FRAME_COUNT = 8

const AXE_ICON_SIZE = { mobile: 32, desktop: 40 } as const

function AxeIcon({ size }: { size: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 overflow-hidden [image-rendering:pixelated]"
      style={{
        width: size,
        height: size,
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
function CooldownOverlay({ cooldownEndsAt, size }: { cooldownEndsAt: number; size: number }) {
  if (cooldownEndsAt <= 0) return null

  return (
    <div
      key={cooldownEndsAt}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 z-10 bg-black/60"
      style={{
        width: size,
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
  const isMobile = useIsMobile()
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
    <TooltipProvider delayDuration={200}>
      <nav
        aria-label="Barra de acciones"
        className={`fixed left-1/2 z-40 flex -translate-x-1/2 ${
          // Mobile: pushed well above the joystick/chat-toggle column
          // (bottom-3 + 104px + 12px gap + 40px + 12px gap = 192px, see
          // `WORLD_CONFIG.mobile.joystick`) with a 12px gap above `XpBarHud`
          // so the two never overlap and stay visibly separated.
          isMobile ? "bottom-[200px] gap-1" : "bottom-7 gap-2"
        }`}
      >
        {Array.from({ length: SLOT_COUNT }, (_, i) => i + 1).map((index) => {
          const slot = index === AXE_SLOT_INDEX
          const tooltipContent = slot
            ? {
                title: "Lanzar Hacha",
                description: `Lanza tu hacha contra el objetivo. Recarga: ${WORLD_CONFIG.axe.cooldownMs / 1000}s.`,
              }
            : {
                title: `Ranura ${index}`,
                description: "Ranura vacía — se asignará desde el Grimorio.",
              }

          const toggle = (
            <Toggle
              variant="outline"
              aria-label={`Ranura de acción ${index}`}
              pressed={activeSlot === index}
              onPressedChange={() => activate(index)}
              className={isMobile ? "size-8" : "size-10"}
              data-cuelume-toggle
            />
          )

          return (
            <div key={index} className="relative">
              {isMobile ? (
                toggle
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>{toggle}</TooltipTrigger>
                  <TooltipContent side="top" font="normal" className="max-w-44">
                    <p className="text-xs font-bold">{tooltipContent.title}</p>
                    <p className="mt-0.5 font-sans text-xs leading-snug text-muted-foreground">
                      {tooltipContent.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              {slot && (
                <>
                  <AxeIcon size={isMobile ? AXE_ICON_SIZE.mobile : AXE_ICON_SIZE.desktop} />
                  <CooldownOverlay
                    cooldownEndsAt={axeCooldownEndsAt}
                    size={isMobile ? AXE_ICON_SIZE.mobile : AXE_ICON_SIZE.desktop}
                  />
                </>
              )}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1 right-1 z-10 text-[10px] leading-none text-muted-foreground"
              >
                {index}
              </span>
            </div>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
