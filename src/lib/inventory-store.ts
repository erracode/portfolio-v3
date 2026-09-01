import { play } from "cuelume"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useLogStore } from "@/lib/log-store"

export interface InventoryItem {
  id: string
  name: string
  obtainedAt: number
}

interface InventoryState {
  /** Item id -> item. A missing id means "not obtained". */
  items: Record<string, InventoryItem>
  /**
   * Idempotent by `id` — a no-op (no duplicate log/sound) if the item is
   * already present. This is the store-level layer of protection against
   * the same "multiple calls before a React re-render" race `world-chest.tsx`
   * guards against with its own synchronous store check; both layers stay
   * in place rather than relying on either alone.
   */
  addItem: (id: string, name: string) => void
}

/**
 * Persistent mini-db of obtained items. Survives reloads via localStorage
 * (zustand persist), same convention as `quest-store.ts`. No inventory UI
 * yet — this is the source-of-truth store a future window can read.
 */
export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: {},

      addItem: (id, name) => {
        if (get().items[id]) return

        set((state) => ({
          items: { ...state.items, [id]: { id, name, obtainedAt: Date.now() } },
        }))

        play("sparkle")
        useLogStore.getState().addLog("loot", `Obtuviste: ${name}`)
      },
    }),
    { name: "portfolio-inventory-v1" }
  )
)

export function useInventory(): Record<string, InventoryItem> {
  return useInventoryStore((state) => state.items)
}

export function useHasItem(id: string): boolean {
  return useInventoryStore((state) => Boolean(state.items[id]))
}
