import { create } from "zustand"

/** Set once the visitor picks a path in `WelcomeModal` (either one). */
export const WELCOME_SEEN_STORAGE_KEY = "portfolio-welcome-seen"
/** Set once the Help window has auto-opened (or been dismissed) on a first
 * visit — kept at its original value so returning visitors aren't re-shown it. */
export const HELP_SEEN_STORAGE_KEY = "wow-help-seen"

/**
 * localStorage can throw (Safari private mode, blocked site data, sandboxed
 * iframes). A first-visit flag is a nicety, so a failure just means "not
 * seen yet" — the visitor gets the onboarding again instead of a crash.
 */
export function hasSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "true"
  } catch {
    return false
  }
}

export function markSeen(key: string): void {
  try {
    window.localStorage.setItem(key, "true")
  } catch {
    // Storage unavailable: nothing to persist, the flag just won't stick.
  }
}

interface OnboardingState {
  /** True once `InitialLoadingScreen` has fully faded out — the welcome
   * dialog waits for it so it never renders underneath the loader. */
  worldReady: boolean
  setWorldReady: (ready: boolean) => void
  /** True while `WelcomeModal` is on screen. `WorldScene` switches the R3F
   * loop to `frameloop="demand"` meanwhile: the dimmed world behind the
   * dialog doesn't need 60 fps, and nothing can move while it's open. */
  welcomeOpen: boolean
  setWelcomeOpen: (open: boolean) => void
}

/**
 * Not persisted on purpose: the loading screen remounts (and shows again)
 * whenever the game route mounts, so readiness is per mount, not per visitor.
 */
export const useOnboardingStore = create<OnboardingState>()((set) => ({
  worldReady: false,
  setWorldReady: (ready) => set({ worldReady: ready }),
  welcomeOpen: false,
  setWelcomeOpen: (open) => set({ welcomeOpen: open }),
}))
