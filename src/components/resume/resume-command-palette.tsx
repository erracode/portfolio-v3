import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Bug, Command, Languages, Printer, Gamepad2 } from "lucide-react"

import { Button } from "@/components/ui/8bit/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandShortcut,
} from "@/components/ui/8bit/command"
import { CONTACT_LINKS } from "@/data/sections"
import { useResumeContent } from "@/lib/use-resume-content"
import { useResumeZergStore } from "@/lib/resume-zerg-store"

/** Cmd/Ctrl+K command palette — same idea as the reference site's
 * `KeyboardManager`, rebuilt on the project's own `@8bitcn/command`
 * component instead of the `hotkeypad` package, so it matches every other
 * dialog on the site instead of adding a one-off dependency. */
export function ResumeCommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { toggleLocale, labels } = useResumeContent()
  const startZergRush = useResumeZergStore((state) => state.start)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <>
      {/* Replaces the old always-visible "Back to portfolio" / "Print" row
          — both actions (plus contact links) live in the palette below;
          this is just a discoverable trigger for anyone without a
          keyboard, same role as the reference site's mobile floating
          button. */}
      <div className="fixed top-4 right-4 z-30 flex gap-2 print:hidden">
        <Button variant="outline" size="icon" onClick={toggleLocale} title={labels.language}>
          <Languages />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setOpen(true)} title={labels.openCommands}>
          <Command />
        </Button>
      </div>

      <p className="fixed bottom-4 left-1/2 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
        <CommandShortcut className="mx-1">Ctrl/Cmd + K</CommandShortcut> {labels.pressForCommands}
      </p>

      <CommandDialog open={open} onOpenChange={setOpen} title={labels.openCommands} description={labels.searchCommand}>
        <CommandInput placeholder={labels.searchCommand} />
        <CommandList>
          <CommandEmpty>{labels.noMatch}</CommandEmpty>
          <CommandGroup heading={labels.actions}>
            <CommandItem onSelect={() => run(() => window.print())}>
              <Printer />
              {labels.print}
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate({ to: "/" }))}>
              <Gamepad2 />
              {labels.backToPortfolio}
            </CommandItem>
            <CommandItem onSelect={() => run(toggleLocale)}>
              <Languages />
              {labels.language}
            </CommandItem>
            <CommandItem value="zerg rush" onSelect={() => run(startZergRush)}>
              <Bug />
              Zerg Rush
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading={labels.contact}>
            {CONTACT_LINKS.map((link) => {
              // GitHub's mark is solid black-on-transparent — it needs a
              // white backing or it vanishes in dark mode, unlike
              // LinkedIn's self-contained badge or Email's white-stroke
              // icon (already designed for a dark surface).
              const icon = <img src={link.icon} alt="" className="size-3.5 object-contain" />

              return (
                <CommandItem key={link.name} onSelect={() => run(() => window.open(link.href, "_blank"))}>
                  {link.name === "GitHub" ? (
                    <span className="flex size-4 items-center justify-center rounded-xs bg-white">{icon}</span>
                  ) : (
                    icon
                  )}
                  {link.name}
                  <CommandShortcut>{link.handle}</CommandShortcut>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
