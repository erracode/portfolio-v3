import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { SECTION_IDS, SECTIONS, type SectionId } from "@/data/sections"

import { useLogStore } from "@/lib/log-store"
import { useQuestStore } from "@/lib/quest-store"

/** Sections whose first-open-of-the-session also completes a matching
 * quest objective (if that objective's quest is currently accepted) —
 * see `src/data/npc.ts`. */
const WINDOW_OBJECTIVE_IDS: Partial<Record<SectionId, string>> = {
  character: "open-character",
  quests: "open-quests",
  spellbook: "open-talents",
  achievements: "open-achievements",
  social: "open-social",
}

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
const CASCADE_STEP = 24
const MIN_POSITION = 8

/** Approximate rendered footprint per window — used only to center the
 * *default* open position and clamp dragging roughly on-screen before/
 * without a live measurement. Matches each modal's own width/height
 * classes; update here if a modal's sizing changes. */
const WINDOW_SIZE: Record<SectionId, { width: number; height: number }> = {
  character: { width: 672, height: 420 },
  quests: { width: 672, height: 560 },
  spellbook: { width: 1024, height: 680 },
  achievements: { width: 672, height: 560 },
  social: { width: 448, height: 280 },
  settings: { width: 400, height: 220 },
}

// Monotonic counter so every window gets a unique cascade slot on first open.
let cascadeIndex = 0

function defaultPosition(id: SectionId): WindowPosition {
  const { width, height } = WINDOW_SIZE[id]
  const baseX = Math.max(MIN_POSITION, (window.innerWidth - width) / 2)
  const baseY = Math.max(MIN_POSITION, (window.innerHeight - height) / 2)
  const x = Math.max(MIN_POSITION, baseX - cascadeIndex * CASCADE_STEP)
  const y = Math.max(MIN_POSITION, baseY - cascadeIndex * CASCADE_STEP)
  cascadeIndex += 1
  return { x, y }
}

function clampPosition(id: SectionId, position: WindowPosition): WindowPosition {
  const { width, height } = WINDOW_SIZE[id]
  const maxX = Math.max(MIN_POSITION, window.innerWidth - width)
  const maxY = Math.max(MIN_POSITION, window.innerHeight - height)
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

  openWindow: (id) => {
    const current = get().windows[id]
    const wasOpen = current.isOpen

    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: true,
          zIndex: state.nextZIndex,
          // First open gets a cascading default position; reopen keeps the last one.
          position: state.windows[id].isOpen
            ? state.windows[id].position
            : defaultPosition(id),
        },
      },
      focusedId: id,
      nextZIndex: state.nextZIndex + 1,
    }))

    if (!wasOpen) {
      useLogStore.getState().addLog("system", `Opened window: ${current.title}`)

      const objectiveId = WINDOW_OBJECTIVE_IDS[id]
      if (objectiveId) useQuestStore.getState().completeObjectiveIfAccepted(objectiveId)
    }
  },

  closeWindow: (id) => {
    const current = get().windows[id]
    if (!current.isOpen) return

    set((state) => {
      const remaining = Object.values(state.windows).filter(
        (win) => win.isOpen && win.id !== id
      )
      const topRemaining = remaining.reduce<WindowInstance | null>(
        (top, win) => (!top || win.zIndex > top.zIndex ? win : top),
        null
      )

      return {
        windows: { ...state.windows, [id]: { ...state.windows[id], isOpen: false } },
        focusedId:
          state.focusedId === id ? (topRemaining?.id ?? null) : state.focusedId,
      }
    })

    useLogStore.getState().addLog("system", `Closed window: ${current.title}`)
  },

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
        [id]: { ...state.windows[id], position: clampPosition(id, position) },
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
