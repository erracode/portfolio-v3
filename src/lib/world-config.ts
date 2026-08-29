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
    halfWidth: 13,
    halfDepth: 12,
  },
  /** The ground is tiled to match `GROUND_MAP`'s silhouette — one square
   * per dot in the reference pixel-art image, not a flat plane. Bounds
   * above are sized to roughly match this footprint (48 cols x 41 rows)
   * so the walkable area tracks the tile size, not a fixed leftover from
   * the old flat-plane ground. */
  ground: {
    cellSize: 0.6,
    tileHeight: 0.18,
    textureSrc: "/textures/ground-dirt-2.png",
    // Multiplied against the texture map — these used to be a saturated
    // green/dark-green pair meant for a flat-color material. Against an
    // actual texture, multiplying two dark colors together crushed the
    // tiles to near-black, so these are now a near-white pair: light mode
    // shows the texture at full brightness, dark mode only dims it
    // slightly. Day/night mood mostly comes from the light intensities
    // below instead.
    colorLight: "#ffffff",
    colorDark: "#c9c9c9",
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
    // Placed on Zulia — the isolated western lobe of `GROUND_MAP` (rows
    // 8-10, separated from the main landmass by a gap), converted from
    // grid cell (row 9, col 2) using the same cellSize/origin math as
    // `world-ground.tsx`.
    position: { x: -12.9, y: 0, z: -6.6 },
  },
  /** Decorative flag prop near spawn — placeholder art, swap to the real
   * Venezuela flag texture later (single-line change to `WorldFlag`'s
   * `FLAG_SPRITE.src`). Grid cell (row 20, col 26), just east of the
   * cell nearest the world origin (where the player spawns). */
  flag: {
    position: { x: 1.5, y: 0, z: 0 },
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
  /** Two stationary guards east of the flag/spawn, on `GROUND_MAP` row 15
   * (cols 38/44) — well clear of the NPC (row 9, west lobe), the flag
   * (row 20, col 26) and spawn (row 20, col 24), and inside `bounds`. */
  guards: {
    aggroRadius: 3.5,
    /** Measured from the guard's OWN spawn point, not from the player —
     * classic WoW leash: a guard chases as far as this from home, then
     * gives up and walks back regardless of where the player is. */
    leashRadius: 6,
    attackRange: 1.4,
    attackDamage: 300,
    attackCooldownMs: 1400,
    maxHealth: 1000,
    walkSpeed: 3,
    positions: {
      ferris: { x: 8.7, y: 0, z: -3 },
      gopher: { x: 12.3, y: 0, z: -3 },
    },
  },
  /** Sits between the two guards. */
  chest: {
    position: { x: 10.5, y: 0, z: -3 },
    interactRadius: 2,
  },
  axe: {
    damage: 400,
    cooldownMs: 2500,
    range: 4,
    projectileDurationMs: 350,
  },
  combat: {
    invulnerabilityMs: 800,
    respawnDelayMs: 2000,
    respawnInvulnerabilityMs: 2000,
    playerSpawnPosition: { x: 0, y: 0, z: 0 },
  },
}
