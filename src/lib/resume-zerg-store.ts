import { create } from "zustand"

interface ResumeZergState {
  /** Bumped on every start so `ResumeZergRush` can key its wave off it and
   * always spawn a fresh one, even while a previous wave is still running. */
  waveToken: number
  start: () => void
}

/** Not persisted — this is a one-shot easter egg, not a preference. */
export const useResumeZergStore = create<ResumeZergState>()((set) => ({
  waveToken: 0,
  start: () => set((state) => ({ waveToken: state.waveToken + 1 })),
}))
