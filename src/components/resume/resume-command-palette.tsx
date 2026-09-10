import { useEffect, useState } from "react"
import { Printer, Gamepad2 } from "lucide-react"

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

/** Cmd/Ctrl+K command palette — same idea as the reference site's
 * `KeyboardManager`, rebuilt on the project's own `@8bitcn/command`
 * component instead of the `hotkeypad` package, so it matches every other
 * dialog on the site instead of adding a one-off dependency. */
export function ResumeCommandPalette() {
  const [open, setOpen] = useState(false)

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
      <p className="fixed bottom-4 left-1/2 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
        Press <CommandShortcut className="mx-1">Ctrl/Cmd + K</CommandShortcut> for commands
      </p>

      <CommandDialog open={open} onOpenChange={setOpen} title="Commands" description="Print, go back, or reach out">
        <CommandInput placeholder="Search a command..." />
        <CommandList>
          <CommandEmpty>No matching command.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run(() => window.print())}>
              <Printer />
              Print / Save as PDF
            </CommandItem>
            <CommandItem onSelect={() => run(() => { window.location.href = "/" })}>
              <Gamepad2 />
              Back to portfolio
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Contact">
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
