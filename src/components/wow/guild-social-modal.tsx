import { useEffect } from "react"
import { play } from "cuelume"

import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { SOCIAL_LINKS, type SocialLink } from "@/data/sections"

interface GuildSocialModalProps {
  isOpen: boolean
  onClose: () => void
}

/** Flavor "rank" text per link — cosmetic only, no claims about the person. */
const MEMBER_FLAVOR: Record<string, string> = {
  GitHub: "Explorador de Código",
  LinkedIn: "Enviado de la Alianza",
  Email: "Mensajero Real",
}

function MemberRow({ link }: { link: SocialLink }) {
  const external = link.href.startsWith("https:")

  return (
    <a
      href={link.href}
      {...(external && { target: "_blank", rel: "noreferrer" })}
      className="relative flex items-center gap-3 border-y-6 border-foreground bg-card px-3 py-2.5 transition-colors hover:bg-accent dark:border-ring"
      data-cuelume-press
      data-cuelume-release
    >
      <div className="relative shrink-0">
        <img
          src={link.icon}
          alt=""
          loading="lazy"
          className="size-9 object-contain"
        />
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">{link.name}</p>
        <p className="font-sans text-[10px] text-muted-foreground">
          {MEMBER_FLAVOR[link.name] ?? "Miembro"}
        </p>
      </div>

      <span className="shrink-0 text-[9px] font-bold text-emerald-500 uppercase">
        En línea
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </a>
  )
}

/**
 * WoW-style Guild roster — bound to the 'J' hotkey / Hermandad micro-menu
 * icon. Reuses the same SOCIAL_LINKS data as the rest of the site (GitHub,
 * LinkedIn, Email), styled as guild members rather than a plain link list.
 */
export function GuildSocialModal({ isOpen, onClose }: GuildSocialModalProps) {
  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="social"
      isOpen={isOpen}
      onClose={onClose}
      className="h-fit w-[min(448px,calc(100svw-2rem))] max-h-[85svh]"
    >
      <header
        data-window-drag-handle
        className="cursor-move touch-none border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">Hermandad</h2>
        <p
          className="mt-0.5 text-[10px] leading-snug"
          style={{ color: "#ffd100" }}
        >
          &lt;Developer Forge&gt;
        </p>
      </header>

      <div className="flex flex-col gap-2 p-4">
        {SOCIAL_LINKS.map((link) => (
          <MemberRow key={link.name} link={link} />
        ))}
      </div>
    </WowDraggableWindow>
  )
}
