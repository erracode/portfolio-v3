import { useEffect } from "react"
import { play } from "cuelume"

import { SECTIONS } from "@/data/sections"
import { useOpenWindowIds, useWindowsStore } from "@/lib/windows-store"

import { Toggle } from "@/components/ui/8bit/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/8bit/tooltip"
import { AchievementsModal } from "@/components/wow/achievements-modal"
import { CharacterSheetModal } from "@/components/wow/character-sheet-modal"
import { GuildSocialModal } from "@/components/wow/guild-social-modal"
import { QuestLogModal } from "@/components/wow/quest-log-modal"
import { TalentsModal } from "@/components/wow/talents-modal"

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
 * integration point for all five main windows (Character, Quest Log,
 * Talents, Achievements, Guild). Each icon and its hotkey (C/L/P/Y/J)
 * toggles the matching window in the shared windows store; several can be
 * open and dragged around at once, same as the rest of the site's windows.
 */
export function MicroBar() {
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

      <CharacterSheetModal
        key={openIds.includes("character") ? "open" : "closed"}
        isOpen={openIds.includes("character")}
        onClose={() => closeWindow("character")}
      />
      <QuestLogModal
        key={openIds.includes("quests") ? "open" : "closed"}
        isOpen={openIds.includes("quests")}
        onClose={() => closeWindow("quests")}
      />
      <TalentsModal
        key={openIds.includes("spellbook") ? "open" : "closed"}
        isOpen={openIds.includes("spellbook")}
        onClose={() => closeWindow("spellbook")}
      />
      <AchievementsModal
        key={openIds.includes("achievements") ? "open" : "closed"}
        isOpen={openIds.includes("achievements")}
        onClose={() => closeWindow("achievements")}
      />
      <GuildSocialModal
        key={openIds.includes("social") ? "open" : "closed"}
        isOpen={openIds.includes("social")}
        onClose={() => closeWindow("social")}
      />
    </>
  )
}
