import { useEffect, useState } from "react"
import { play } from "cuelume"
import { Menu } from "lucide-react"

import { SECTIONS } from "@/data/sections"
import { useIsMobile } from "@/lib/use-is-mobile"
import { useOpenWindowIds, useWindowsStore } from "@/lib/windows-store"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu"
import { Toggle } from "@/components/ui/8bit/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/8bit/tooltip"
import { AchievementsModal } from "@/components/wow/achievements-modal"
import { CharacterSheetModal } from "@/components/wow/character-sheet-modal"
import { SocialModal } from "@/components/wow/social-modal"
import { TalentsModal } from "@/components/wow/talents-modal"
import { WorkLogModal } from "@/components/wow/work-log-modal"

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
 * WoW-style micro menu fixed at the bottom-right corner — the single
 * integration point for all five main windows (Character, Work Log,
 * Talents & Stack, Achievements, Social). Each icon and its hotkey
 * (C/L/P/Y/J) toggles the matching window in the shared windows store;
 * several can be open and dragged around at once, same as the rest of the
 * site's windows.
 */
export function MicroBar() {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)
  const openIds = useOpenWindowIds()
  const toggleWindow = useWindowsStore((state) => state.toggleWindow)
  const closeWindow = useWindowsStore((state) => state.closeWindow)
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
      // Keyboard shortcut bypasses the DOM click cuelume listens for.
      play("toggle")
      toggleWindow(section.id)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [closeFocused, toggleWindow])

  return (
    <>
      {isMobile ? (
        <div className="fixed right-3 bottom-3 z-40">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Toggle
                variant="outline"
                aria-label="Menú principal"
                pressed={openIds.length > 0 || menuOpen}
                className={`size-10 ${menuOpen ? "animate-in zoom-in-95" : ""}`}
                data-cuelume-toggle
              >
                <Menu aria-hidden="true" />
              </Toggle>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const hint = `${section.label} (${section.hotkey.toUpperCase()})`
                return (
                  <DropdownMenuItem
                    key={section.id}
                    aria-label={hint}
                    onSelect={() => toggleWindow(section.id)}
                    className="gap-2 text-[10px]"
                    data-cuelume-press
                    data-cuelume-release
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {section.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
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
                      onPressedChange={() => toggleWindow(section.id)}
                      data-cuelume-toggle
                    >
                      <Icon aria-hidden="true" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="top" font="normal" className="text-[10px]">
                    {hint}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>
      )}

      {/* No key here on purpose: each modal is a stable, always-mounted
          component instance (per its fixed JSX position in this fragment).
          `WowDraggableWindow` already unmounts/remounts its own visible
          content based on `isOpen` (from the windows store) — forcing an
          additional outer remount via a changing key duplicated that same
          teardown-and-rebuild on every single open, which is what made
          opening any window feel sluggish. */}
      <CharacterSheetModal
        isOpen={openIds.includes("character")}
        onClose={() => closeWindow("character")}
      />
      <WorkLogModal
        isOpen={openIds.includes("quests")}
        onClose={() => closeWindow("quests")}
      />
      <TalentsModal
        isOpen={openIds.includes("spellbook")}
        onClose={() => closeWindow("spellbook")}
      />
      <AchievementsModal
        isOpen={openIds.includes("achievements")}
        onClose={() => closeWindow("achievements")}
      />
      <SocialModal
        isOpen={openIds.includes("social")}
        onClose={() => closeWindow("social")}
      />
    </>
  )
}
