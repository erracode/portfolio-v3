import { useEffect, useRef, useState } from "react"
import { MessageSquare } from "lucide-react"

import { Toggle } from "@/components/ui/8bit/toggle"
import { CHANNEL_COLOR, CHANNEL_LABEL, useLogs } from "@/lib/log-store"

/** Collapsed-by-default toggle sitting directly above the joystick's hit
 * area (bottom-3 left-3, 104px tall — see `WORLD_CONFIG.mobile.joystick`)
 * with a 12px gap, so the two never overlap. */
export function MobileChatBox() {
  const logs = useLogs()
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs, isOpen])

  return (
    <div className="fixed bottom-32 left-3 z-40 flex flex-col-reverse items-start gap-2">
      <Toggle
        variant="outline"
        aria-label="Registro del sistema"
        pressed={isOpen}
        onPressedChange={setIsOpen}
        className="size-10"
      >
        <MessageSquare aria-hidden="true" />
      </Toggle>

      {isOpen && (
        <section
          aria-label="Registro del sistema"
          className="relative w-[min(260px,calc(100svw-2rem))] border-y-6 border-foreground bg-background/90 shadow-lg backdrop-blur-sm dark:border-ring"
        >
          <div ref={scrollRef} className="max-h-40 overflow-y-auto p-2">
            {logs.map((entry) => (
              <p key={entry.id} className="text-[10px] leading-relaxed break-words">
                <span className={`font-semibold ${CHANNEL_COLOR[entry.channel]}`}>
                  [{CHANNEL_LABEL[entry.channel]}]
                </span>{" "}
                {entry.message}
              </p>
            ))}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
          />
        </section>
      )}
    </div>
  )
}
