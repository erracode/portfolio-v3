import { create } from "zustand"

interface DialogueState {
  /** Pending lines, oldest first. The tracker component shows queue[0]
   * and auto-dismisses it after a few seconds, revealing the next. */
  queue: string[]
  pushLine: (line: string) => void
  dismissCurrent: () => void
}

/**
 * A short queue of character one-liners — inspired by portfolio-v2's
 * `MessageDialog` queue (`GameApp.tsx`'s `dialogQueue`/`dialogIndex`), but
 * auto-dismissing instead of click-to-advance: this is a passive flavor
 * moment on quest turn-in, not a gated conversation step.
 */
export const useDialogueStore = create<DialogueState>()((set) => ({
  queue: [],

  pushLine: (line) => set((state) => ({ queue: [...state.queue, line] })),

  dismissCurrent: () => set((state) => ({ queue: state.queue.slice(1) })),
}))
