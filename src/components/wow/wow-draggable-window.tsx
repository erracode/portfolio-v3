import { useRef } from "react"
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react"
import { X } from "lucide-react"

import type { SectionId } from "@/data/sections"
import { cn } from "@/lib/utils"
import { useWindow, useWindowsStore, type WindowPosition } from "@/lib/windows-store"

const DRAG_MARGIN = 8

/** Grab offset plus window size captured when a drag starts. */
interface DragGrab {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

interface WowDraggableWindowProps {
  id: SectionId
  isOpen: boolean
  onClose: () => void
  /** Width/height sizing utilities — each of the five windows keeps its own
   * natural footprint (the compact guild list vs. the wide talent tree). */
  className?: string
  children: ReactNode
}

/**
 * Free-floating, draggable pixel-bordered window shell — shared by all five
 * micro-menu modals. Position/z-index live in the windows store so several
 * can be open and stacked at once, same as the original WowWindow; this
 * version just isn't locked to one fixed size, so each modal keeps its own
 * dialog-style layout (header, tab flaps, corner portrait) unchanged.
 * Dragging is scoped to whichever descendant carries
 * `data-window-drag-handle` (each modal's own <header>), so buttons, tabs,
 * and links inside the body stay clickable.
 */
export function WowDraggableWindow({
  id,
  isOpen,
  onClose,
  className,
  children,
}: WowDraggableWindowProps) {
  const win = useWindow(id)
  const bringToFront = useWindowsStore((state) => state.bringToFront)
  const updatePosition = useWindowsStore((state) => state.updatePosition)
  const grabRef = useRef<DragGrab | null>(null)

  if (!isOpen) return null

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const target = event.target as Element
    if (!target.closest("[data-window-drag-handle]")) return
    if (target.closest("button")) return

    const rect = event.currentTarget.getBoundingClientRect()
    event.preventDefault()
    grabRef.current = {
      offsetX: event.clientX - win.position.x,
      offsetY: event.clientY - win.position.y,
      width: rect.width,
      height: rect.height,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!grabRef.current) return
    grabRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleBringToFront = (event: ReactPointerEvent<HTMLElement>) => {
    // Closing a window shouldn't also focus/raise it first — skip the
    // z-index bump when the press lands on the close button.
    if ((event.target as Element).closest("button")) return
    bringToFront(id)
  }

  return (
    <section
      className="pointer-events-auto fixed z-40 animate-in zoom-in-95 fade-in"
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onPointerDownCapture={handleBringToFront}
    >
      <div
        className={cn(
          "relative flex flex-col border-y-6 border-foreground bg-card text-card-foreground shadow-xl dark:border-ring",
          className
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {children}

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-2 right-2 z-20 flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          data-cuelume-press
          data-cuelume-release
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
        />
      </div>
    </section>
  )
}
