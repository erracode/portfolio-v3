import { useSettingsStore } from "@/lib/settings-store"

/** cuelume's fixed sound set has no combat-weapon SFX — this plays a real
 * asset directly instead, same as any one-off sound not covered by
 * cuelume's palette. Picks a random file each call so repeated hits/throws
 * don't sound identical back-to-back. Respects the same volume/mute
 * settings as cuelume's UI sounds, read directly off the store since this
 * is called from non-component code (combat store, R3F controllers). */
export function playRandomSound(files: readonly string[]) {
  const { muted, volume } = useSettingsStore.getState()
  if (muted) return

  const file = files[Math.floor(Math.random() * files.length)]
  const audio = new Audio(file)
  audio.volume = volume
  audio.play().catch(() => {})
}
