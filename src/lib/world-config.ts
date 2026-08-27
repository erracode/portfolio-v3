/**
 * Centralized, typed config for the 3D world — every tunable movement/
 * camera/world number lives here instead of scattered as magic numbers
 * across components (the #1 rough edge in the sibling portfolio-v2 engine
 * this was ported from).
 */
export const WORLD_CONFIG = {
  movement: {
    /** World units per second. */
    speed: 4.5,
  },
  /** Rectangular sandbox bounds around the origin — a simple clamp, no
   * collision geometry. Keeps the "very limited sandbox" scope from the
   * plan without needing a physics/collision library. */
  bounds: {
    halfWidth: 9,
    halfDepth: 9,
  },
  ground: {
    size: 20,
    colorLight: "#6b8f5a",
    colorDark: "#2e3d28",
  },
  fog: {
    colorLight: "#dfe7d8",
    colorDark: "#0c0f0a",
    near: 12,
    far: 30,
  },
  camera: {
    /** Initial camera position (world space) before the user orbits it. */
    offset: { x: 0, y: 6, z: 9 },
    lookAtHeight: 1.2,
    dampingFactor: 0.1,
    minDistance: 5,
    maxDistance: 15,
    minPolarAngle: Math.PI / 6,
    maxPolarAngle: Math.PI / 2.1,
  },
  npc: {
    interactRadius: 2.5,
    position: { x: 3, y: 0, z: -2 },
  },
  /** Ambient background decoration — ported from the sibling portfolio-v2
   * engine's `ZeppelinEntity`: a slow, autonomous float within a bounded
   * area of the sky, periodically changing direction. Clicking it opens
   * the Social & Contact window (same purpose the `contact-sprite.png`
   * asset and v2's own click handler already implied). */
  zeppelin: {
    startPosition: { x: 0, y: 7, z: -8 },
    speed: 0.2,
    turnInterval: 5,
    boundarySize: 10,
    scale: 1 / 60,
  },
  keyBindings: {
    forward: ["KeyW", "ArrowUp"] as string[],
    backward: ["KeyS", "ArrowDown"] as string[],
    left: ["KeyA", "ArrowLeft"] as string[],
    right: ["KeyD", "ArrowRight"] as string[],
    interact: ["KeyE"] as string[],
  },
}
