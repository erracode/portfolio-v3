import { useEffect, useRef, useState } from "react"
import { MessageSquare } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu"
import { Toggle } from "@/components/ui/8bit/toggle"
import { CHANNEL_COLOR, CHANNEL_LABEL, useLogs } from "@/lib/log-store"

/**
 * Mobile chat box: collapsed toggle above the joystick (bottom-3 left-3,
 * 104px tall — see `WORLD_CONFIG.mobile.joystick`) that opens the system
 * log as a DropdownMenu overlay — same behavior as the mobile micro bar
 * menu — so it renders ON TOP of the action bar instead of below/behind it.
 */
export function MobileChatBox() {
  const logs = useLogs()
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [isOpen, logs])

  return (
    <div className="fixed bottom-32 left-3 z-40">
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Toggle
            variant="outline"
            aria-label="Registro del sistema"
            pressed={isOpen}
            className="size-10"
            data-cuelume-toggle
          >
            <MessageSquare aria-hidden="true" />
          </Toggle>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          font="normal"
          className="w-[min(260px,calc(100svw-2rem))]"
        >
          <div ref={scrollRef} className="max-h-40 overflow-y-auto">
            {logs.map((entry) => (
              <p
                key={entry.id}
                className="px-2 py-0.5 text-[10px] leading-relaxed break-words"
              >
                <span className={`font-semibold ${CHANNEL_COLOR[entry.channel]}`}>
                  [{CHANNEL_LABEL[entry.channel]}]
                </span>{" "}
                {entry.message}
              </p>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}