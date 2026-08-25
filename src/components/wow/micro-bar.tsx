import { useEffect } from "react"

import { SECTIONS } from "@/data/sections"
import { playClick } from "@/lib/sfx"
import { useOpenWindowIds, useWindowsStore } from "@/lib/windows-store"

import { Toggle } from "@/components/ui/8bit/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/8bit/tooltip"
import { WowWindow } from "@/components/wow/wow-window"

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
 * WoW-style micro menu fixed at the bottom-right corner. Each button toggles
 * an independent window in the shared store, so several sections can be open
 * at once. Open windows render inside a pointer-events-none overlay so the
 * page underneath stays interactive.
 */
export function MicroBar() {
  const openIds = useOpenWindowIds()
  const toggleWindow = useWindowsStore((state) => state.toggleWindow)
  const closeFocused = useWindowsStore((state) => state.closeFocused)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isEditableElement(event.target)) return

      const key = event.key.toLowerCase()
      if (key === "escape") {
        closeFocused()
        return
      }

      const section = SECTIONS.find((item) => item.hotkey === key)
      if (!section) return

      event.preventDefault()
      playClick()
      toggleWindow(section.id)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [closeFocused, toggleWindow])

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div
          role="group"
          aria-label="Menú principal"
          className="fixed right-4 bottom-4 z-40 flex gap-2"
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const hint = `${section.label} (${section.hotkey.toUpperCase()})`
            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <Toggle
                    variant="outline"
                    aria-label={hint}
                    pressed={openIds.includes(section.id)}
                    onPressedChange={() => {
                      playClick()
                      toggleWindow(section.id)
                    }}
                  >
                    <Icon aria-hidden="true" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent side="top">{hint}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>

      <div className="pointer-events-none fixed inset-0 z-50">
        {openIds.map((id) => (
          <WowWindow key={id} id={id} />
        ))}
      </div>
    </>
  )
}
