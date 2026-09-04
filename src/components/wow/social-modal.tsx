import { useEffect } from "react"
import { play } from "cuelume"
import { X } from "lucide-react"

import { CONTACT_LINKS, type ContactLink } from "@/data/sections"
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/8bit/drawer"
import { ScrollArea } from "@/components/ui/8bit/scroll-area"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { useIsMobile } from "@/lib/use-is-mobile"

interface SocialModalProps {
  isOpen: boolean
  onClose: () => void
}

function ContactRow({ link }: { link: ContactLink }) {
  const external = link.href.startsWith("https:")

  return (
    <a
      href={link.href}
      {...(external && { target: "_blank", rel: "noreferrer" })}
      className="relative flex items-center gap-3 border-y-6 border-foreground bg-card px-3 py-2.5 transition-colors hover:bg-accent dark:border-ring"
      data-cuelume-press
      data-cuelume-release
    >
      <img
        src={link.icon}
        alt=""
        loading="lazy"
        className="size-9 shrink-0 object-contain"
      />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">{link.name}</p>
        <p className="truncate font-sans text-xs text-muted-foreground">
          {link.handle}
        </p>
      </div>

      <span className="shrink-0 font-sans text-[11px] text-muted-foreground">
        {link.description}
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </a>
  )
}

const SOCIAL_TITLE = "CONTACTO & REDES"

/** Title bar — stays pinned above the scrollable body in both shells. */
function SocialHeader() {
  return (
    <header
      data-window-drag-handle
      className="cursor-move touch-none border-b-4 border-border px-4 py-3 pr-12 select-none"
    >
      <h2 className="retro text-xs leading-snug">{SOCIAL_TITLE}</h2>
      <p className="mt-0.5 font-sans text-xs text-muted-foreground">
        Canales de comunicación y presencia profesional
      </p>
    </header>
  )
}

/** The actual scrollable body — each shell wraps this in its own scrolling
 * container (desktop renders it directly, `ScrollArea` in the mobile
 * Drawer). */
function SocialBody() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {CONTACT_LINKS.map((link) => (
        <ContactRow key={link.name} link={link} />
      ))}
    </div>
  )
}

/** Everything the desktop window shell wraps — unchanged layout, just
 * composed from the header/body pieces above so the mobile Drawer branch
 * can recompose them around its own scrolling boundary. */
function SocialContent() {
  return (
    <>
      <SocialHeader />
      <SocialBody />
    </>
  )
}

/**
 * Social & Contact — bound to the 'J' hotkey / micro-menu icon. Direct
 * links to GitHub, LinkedIn, and email. Desktop keeps the draggable window;
 * mobile swaps in a bottom-sheet Drawer.
 */
export function SocialModal({ isOpen, onClose }: SocialModalProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">{SOCIAL_TITLE}</DrawerTitle>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Cerrar ventana"
                className="absolute top-2 right-2 z-20 flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                data-cuelume-press
                data-cuelume-release
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </DrawerClose>

            <SocialHeader />

            <ScrollArea className="min-h-0 flex-1">
              <SocialBody />
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <WowDraggableWindow
      id="social"
      isOpen={isOpen}
      onClose={onClose}
      className="h-fit w-[min(480px,calc(100svw-2rem))] max-h-[85svh]"
    >
      <SocialContent />
    </WowDraggableWindow>
  )
}
