import { useEffect } from "react"
import { play } from "cuelume"

import { CONTACT_LINKS, type ContactLink } from "@/data/sections"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"

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
        <p className="truncate font-sans text-[10px] text-muted-foreground">
          {link.handle}
        </p>
      </div>

      <span className="shrink-0 font-sans text-[9px] text-muted-foreground">
        {link.description}
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </a>
  )
}

/**
 * Social & Contact — bound to the 'J' hotkey / micro-menu icon. Direct
 * links to GitHub, LinkedIn, and email.
 */
export function SocialModal({ isOpen, onClose }: SocialModalProps) {
  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="social"
      isOpen={isOpen}
      onClose={onClose}
      className="h-fit w-[min(480px,calc(100svw-2rem))] max-h-[85svh]"
    >
      <header
        data-window-drag-handle
        className="cursor-move touch-none border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">CONTACTO & REDES</h2>
        <p className="mt-0.5 font-sans text-[10px] text-muted-foreground">
          Canales de comunicación y presencia profesional
        </p>
      </header>

      <div className="flex flex-col gap-2 p-4">
        {CONTACT_LINKS.map((link) => (
          <ContactRow key={link.name} link={link} />
        ))}
      </div>
    </WowDraggableWindow>
  )
}
