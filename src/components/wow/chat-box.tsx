import { useEffect, useRef } from "react"

import { useLogs, type LogChannel } from "@/lib/log-store"

const CHANNEL_LABEL: Record<LogChannel, string> = {
  system: "System",
  quest: "Quest",
  loot: "Loot",
}

const CHANNEL_COLOR: Record<LogChannel, string> = {
  system: "text-[#ffd100]",
  quest: "text-[#c79c6e]",
  loot: "text-[#1eff00]",
}

/**
 * WoW-style chat box / system log pinned to the bottom-left corner. Reads the
 * global log store; auto-scrolls to the newest entry on every change.
 */
export function ChatBox() {
  const logs = useLogs()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [logs])

  return (
    <section
      aria-label="Registro del sistema"
      className="fixed bottom-4 left-4 z-40 w-[min(320px,calc(100svw-2rem))] border-y-6 border-foreground bg-background/80 backdrop-blur-sm shadow-lg dark:border-ring"
    >
      <header className="flex items-center gap-2 border-b-4 border-border px-3 py-1.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 bg-destructive" />
          <span className="size-2.5 bg-yellow-500" />
          <span className="size-2.5 bg-green-500" />
        </div>
        <h2 className="text-xs font-bold tracking-widest uppercase">Registro</h2>
      </header>

      <div ref={scrollRef} className="max-h-32 overflow-y-auto p-2">
        {logs.map((entry) => (
          <p key={entry.id} className="text-[10px] leading-relaxed break-words">
            <span className={`font-semibold ${CHANNEL_COLOR[entry.channel]}`}>
              [{CHANNEL_LABEL[entry.channel]}]
            </span>{" "}
            {entry.message}
          </p>
        ))}
        <p className="animate-pulse text-[10px] text-foreground">{">"} _</p>
      </div>

      {/* Pixel-frame recipe: side borders step outward past the top/bottom ones. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </section>
  )
}
