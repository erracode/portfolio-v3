import { useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { X } from "lucide-react"

import type { SectionId } from "@/data/sections"
import {
  useWindow,
  useWindowsStore,
  type WindowPosition,
} from "@/lib/windows-store"

import { SectionContent } from "@/components/wow/window-content"

const DRAG_MARGIN = 8

/** Grab offset plus window size captured when a drag starts. */
interface DragGrab {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

/**
 * WoW-style draggable, focusable panel. Position/z-index live in the windows
 * store so multiple instances can coexist; the title bar is the drag handle.
 * Uses the site pixel-frame recipe: border-y on the element plus a border-x
 * overlay pulled wider (-mx-1.5). The frame container must NOT clip overflow,
 * so internal scrolling lives on the body element.
 */
export function WowWindow({ id }: { id: SectionId }) {
  const win = useWindow(id)
  const bringToFront = useWindowsStore((state) => state.bringToFront)
  const closeWindow = useWindowsStore((state) => state.closeWindow)
  const updatePosition = useWindowsStore((state) => state.updatePosition)

  const rootRef = useRef<HTMLElement | null>(null)
  const grabRef = useRef<DragGrab | null>(null)

  if (!win.isOpen) return null

  // Pointer capture routes every subsequent move/up event to the header even
  // outside the viewport, so no document-level listeners are needed.
  const handleHeaderPointerDown = (
    event: ReactPointerEvent<HTMLElement>
  ): void => {
    if (event.button !== 0) return
    // The close button must not start a drag.
    if ((event.target as Element).closest("button")) return
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return

    event.preventDefault()
    grabRef.current = {
      offsetX: event.clientX - win.position.x,
      offsetY: event.clientY - win.position.y,
      width: rect.width,
      height: rect.height,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleHeaderPointerMove = (
    event: ReactPointerEvent<HTMLElement>
  ): void => {
    const grab = grabRef.current
    if (!grab) return

    const maxX = Math.max(DRAG_MARGIN, window.innerWidth - grab.width)
    const maxY = Math.max(DRAG_MARGIN, window.innerHeight - grab.height)
    const next: WindowPosition = {
      x: Math.min(Math.max(event.clientX - grab.offsetX, DRAG_MARGIN), maxX),
      y: Math.min(Math.max(event.clientY - grab.offsetY, DRAG_MARGIN), maxY),
    }
    updatePosition(id, next)
  }

  const endDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!grabRef.current) return
    grabRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section
      ref={rootRef}
      role="dialog"
      aria-label={win.title}
      className="pointer-events-auto fixed w-[min(360px,calc(100svw-2rem))] animate-in zoom-in-95 fade-in"
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onPointerDown={() => bringToFront(id)}
    >
      <div className="relative border-y-6 border-foreground bg-card text-card-foreground shadow-xl dark:border-ring">
        <header
          onPointerDown={handleHeaderPointerDown}
          onPointerMove={handleHeaderPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex cursor-move touch-none items-center justify-between gap-2 border-b-4 border-border py-1 pr-1 pl-3 select-none"
        >
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#ffd100" }}
          >
            {win.title}
          </h2>
          <button
            type="button"
            onClick={() => closeWindow(id)}
            aria-label="Cerrar ventana"
            className="-mr-1 flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
            data-cuelume-press
            data-cuelume-release
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="max-h-[min(50svh,calc(100svh-9rem))] overflow-y-auto p-3">
          <SectionContent id={id} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
        />
      </div>
    </section>
  )
}
