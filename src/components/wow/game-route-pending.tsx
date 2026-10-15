import LoadingScreen from "@/components/ui/8bit/blocks/loading-screen"
import { GAME_LOADING_TIPS, GAME_LOADING_TITLE } from "@/data/game-loading"

/**
 * Pending fallback for the lazily loaded "/" route while the game chunk
 * (three.js, r3f, drei, gsap…) downloads. Deliberately free of any three/r3f
 * import so it ships in the entry chunk, and visually identical to
 * `InitialLoadingScreen` (same block, title and tips), which takes over at
 * 0% once the chunk has loaded — so there is no flash between the two.
 */
export function GameRoutePending() {
  return (
    <LoadingScreen
      variant="fullscreen"
      title={GAME_LOADING_TITLE}
      tips={GAME_LOADING_TIPS}
      progress={0}
    />
  )
}
