import { useEffect, useRef, useState } from "react"
import { useProgress } from "@react-three/drei"

import LoadingScreen from "@/components/ui/8bit/blocks/loading-screen"

const LOADING_TIPS = [
  "Cargando el mundo...",
  "Consejo: presiona E para interactuar con NPCs y objetos.",
  "Derrota a los guardias para poder abrir el cofre.",
]

const FADE_OUT_MS = 400
const LOADING_FALLBACK_MS = 7000

/**
 * Shown once, on first visit, while the permanent 3D world's textures load.
 * Every `useLoader(THREE.TextureLoader, ...)` call across `world-scene.tsx`
 * feeds the same global `THREE.DefaultLoadingManager` that drei's
 * `useProgress` observes, so this needs no wiring into any of those
 * components. `active` can flip back to `true` later — e.g. `WorldChest`
 * loading its "open" texture on interact — so `everLoadedRef` latches once
 * the initial start-to-finish transition is observed, and the overlay never
 * returns after that.
 */
export function InitialLoadingScreen() {
  const { active, progress } = useProgress()
  const hasStartedRef = useRef(false)
  const everLoadedRef = useRef(false)
  const [isDone, setIsDone] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const fallbackTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (active) hasStartedRef.current = true
    // Either a real start-to-finish transition was observed, or everything
    // was already cached/had nothing to load and `useProgress` reports 100%
    // inactive on the very first tick — both are legitimate "done" states,
    // not states to wait through.
    const isFinished = !active && (hasStartedRef.current || progress >= 100)
    if (isFinished && !everLoadedRef.current) {
      everLoadedRef.current = true
      setIsDone(true)
      if (fallbackTimeoutRef.current !== null) {
        window.clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }
  }, [active, progress])

  // Hard backstop: no matter what useProgress/THREE.DefaultLoadingManager
  // reports (or fails to report), this fullscreen overlay must never be
  // able to block the entire site forever.
  useEffect(() => {
    fallbackTimeoutRef.current = window.setTimeout(() => {
      everLoadedRef.current = true
      setIsDone(true)
    }, LOADING_FALLBACK_MS)
    return () => {
      if (fallbackTimeoutRef.current !== null) window.clearTimeout(fallbackTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isDone) return
    const timeout = window.setTimeout(() => setIsVisible(false), FADE_OUT_MS)
    return () => window.clearTimeout(timeout)
  }, [isDone])

  if (!isVisible) return null

  return (
    <LoadingScreen
      variant="fullscreen"
      title="CARGANDO"
      tips={LOADING_TIPS}
      progress={progress}
      className={isDone ? "pointer-events-none" : undefined}
      style={
        isDone
          ? { animation: `loading-screen-fade-out ${FADE_OUT_MS}ms ease-out forwards` }
          : undefined
      }
      aria-hidden={isDone}
    />
  )
}
