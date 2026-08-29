import { useEffect, useState } from "react"

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handleChange = () => setMatches(mql.matches)
    handleChange()
    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

/** Drives layout choice (HUD variant, Drawer vs. draggable window) — 767px
 * matches Tailwind's `md` breakpoint. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)")
}

/** Gates whether the touch joystick mounts — independent of viewport size
 * so a touch-capable tablet at desktop width still gets it. */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)")
}
