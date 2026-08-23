import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { SECTION_IDS, SECTIONS, type SectionId } from "@/data/sections"

export interface WindowPosition {
  x: number
  y: number
}

export interface WindowInstance {
  id: SectionId
  title: string
  isOpen: boolean
  position: WindowPosition
  zIndex: number
}

interface WindowsState {
  windows: Record<SectionId, WindowInstance>
  focusedId: SectionId | null
  nextZIndex: number
  openWindow: (id: SectionId) => void
  closeWindow: (id: SectionId) => void
  toggleWindow: (id: SectionId) => void
  bringToFront: (id: SectionId) => void
  updatePosition: (id: SectionId, position: WindowPosition) => void
  closeFocused: () => void
}

const BASE_Z_INDEX = 100
/** Window width plus its right margin, used for viewport clamping. */
const WINDOW_WIDTH = 360
const CASCADE_STEP = 24
const MIN_POSITION = 8

// Monotonic counter so every window gets a unique cascade slot on first open.
let cascadeIndex = 0

function defaultPosition(): WindowPosition {
  const x = Math.max(
    MIN_POSITION,
    window.innerWidth - WINDOW_WIDTH - 16 - cascadeIndex * CASCADE_STEP
  )
  const y = Math.max(
    MIN_POSITION,
    window.innerHeight - 160 - cascadeIndex * CASCADE_STEP
  )
  cascadeIndex += 1
  return { x, y }
}

function clampPosition(position: WindowPosition): WindowPosition {
  const maxX = Math.max(MIN_POSITION, window.innerWidth - WINDOW_WIDTH)
  const maxY = Math.max(MIN_POSITION, window.innerHeight - 160)
  return {
    x: Math.min(Math.max(position.x, MIN_POSITION), maxX),
    y: Math.min(Math.max(position.y, MIN_POSITION), maxY),
  }
}

function createInitialWindows(): Record<SectionId, WindowInstance> {
  return Object.fromEntries(
    SECTIONS.map((section) => [
      section.id,
      {
        id: section.id,
        title: section.label,
        isOpen: false,
        position: { x: 0, y: 0 },
        zIndex: 0,
      } satisfies WindowInstance,
    ])
  ) as Record<SectionId, WindowInstance>
}

export const useWindowsStore = create<WindowsState>()((set, get) => ({
  windows: createInitialWindows(),
  focusedId: null,
  nextZIndex: BASE_Z_INDEX,

  openWindow: (id) =>
    set((state) => {
      const current = state.windows[id]
      const zIndex = state.nextZIndex
      // First open gets a cascading default position; reopen keeps the last one.
      const position = current.isOpen ? current.position : defaultPosition()
      return {
        windows: {
          ...state.windows,
          [id]: { ...current, isOpen: true, zIndex, position },
        },
        focusedId: id,
        nextZIndex: zIndex + 1,
      }
    }),

  closeWindow: (id) =>
    set((state) => {
      const current = state.windows[id]
      if (!current.isOpen) return state

      const remaining = Object.values(state.windows).filter(
        (win) => win.isOpen && win.id !== id
      )
      const topRemaining = remaining.reduce<WindowInstance | null>(
        (top, win) => (!top || win.zIndex > top.zIndex ? win : top),
        null
      )

      return {
        windows: { ...state.windows, [id]: { ...current, isOpen: false } },
        focusedId:
          state.focusedId === id ? (topRemaining?.id ?? null) : state.focusedId,
      }
    }),

  toggleWindow: (id) => {
    if (get().windows[id].isOpen) get().closeWindow(id)
    else get().openWindow(id)
  },

  bringToFront: (id) =>
    set((state) => {
      const target = state.windows[id]
      if (!target.isOpen) return state

      const topZIndex = Object.values(state.windows)
        .filter((win) => win.isOpen)
        .reduce((max, win) => Math.max(max, win.zIndex), 0)
      // Already stacked on top of every other open window: nothing to do.
      if (target.zIndex === topZIndex) return state

      return {
        windows: {
          ...state.windows,
          [id]: { ...target, zIndex: state.nextZIndex },
        },
        focusedId: id,
        nextZIndex: state.nextZIndex + 1,
      }
    }),

  updatePosition: (id, position) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], position: clampPosition(position) },
      },
    })),

  closeFocused: () => {
    const { focusedId } = get()
    if (focusedId !== null) get().closeWindow(focusedId)
  },
}))

/**
 * Subscribes to a single window instance so dragging one window does not
 * re-render the others.
 */
export function useWindow(id: SectionId): WindowInstance {
  return useWindowsStore((state) => state.windows[id])
}

/** Shallow-compares the derived open-id list to avoid re-renders on drag writes. */
export function useOpenWindowIds(): SectionId[] {
  return useWindowsStore(
    useShallow((state) => SECTION_IDS.filter((id) => state.windows[id].isOpen))
  )
}
