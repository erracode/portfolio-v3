import { setEnabled, setVolume } from "cuelume"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsState {
  /** 0-1, matches cuelume's `setVolume` range — also applied to the raw
   * combat `<audio>` elements in `sfx.ts` so both sound paths stay in sync. */
  volume: number
  muted: boolean
  setVolume: (value: number) => void
  setMuted: (value: boolean) => void
}

/**
 * Persistent audio preferences (volume + mute). Survives reloads via
 * localStorage (zustand persist), same convention as `quest-store.ts` /
 * `inventory-store.ts`. Drives both cuelume's UI sounds (`setVolume`/
 * `setEnabled`, called immediately on every change) and the raw combat SFX
 * in `sfx.ts` (read via `useSettingsStore.getState()`).
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      volume: 1,
      muted: false,

      setVolume: (value) => {
        setVolume(value)
        set({ volume: value })
      },

      setMuted: (value) => {
        setEnabled(!value)
        set({ muted: value })
      },
    }),
    { name: "portfolio-settings-v1" }
  )
)

// Apply the persisted preference to cuelume once on module load — otherwise
// a returning visitor's saved volume/mute only takes effect after they
// first touch the new Settings UI.
const initial = useSettingsStore.getState()
setVolume(initial.volume)
setEnabled(!initial.muted)

export function useSettings(): SettingsState {
  return useSettingsStore()
}
