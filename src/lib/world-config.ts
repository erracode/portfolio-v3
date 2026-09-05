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
    // Was PI/2.1 (~85.7deg from vertical, i.e. almost eye-level with the
    // target). At that angle + minDistance the camera sits barely above
    // the finite ground mesh and can end up staring past its edge into
    // the fog-colored void, reading as "the terrain disappeared". PI/2.4
    // (~75deg) keeps a real downward tilt at all times so the ground
    // plane stays in frame.
    maxPolarAngle: Math.PI / 2.4,
    /** Safety floor for the camera's world-space Y in `WorldCameraRig` —
     * a backstop in case a touch drag/pinch gesture ever pushes the rig's
     * position below the ground plane (y=0) despite the polar-angle clamp
     * above. */
    minWorldY: 1,
  },
  npc: {
    interactRadius: 2.5,
    // Placed on Zulia — the isolated western lobe of `GROUND_MAP` (rows
    // 8-10, separated from the main landmass by a gap), converted from
    // grid cell (row 9, col 2) using the same cellSize/origin math as
    // `world-ground.tsx`.
    position: { x: -12.9, y: 0, z: -6.6 },
  },
  /** Decorative flag props scattered across the walkable map — placeholder
   * art, swap to the real Venezuela flag texture later (single-line change
   * to `WorldFlag`'s `FLAG_SPRITE.src`). Each position is converted from a
   * `GROUND_MAP` grid cell via the same `x = -14.1 + col*cellSize`,
   * `z = -12 + row*cellSize` math `world-ground.tsx` uses to place tiles
   * (origin derived from the map's 48x41 footprint), picked on confirmed
   * '1' cells clear of the NPC (row 9, col 3), the other guard/chest
   * cluster (rows 8/15, cols 39-45), and the original flag/spawn (row 20,
   * cols 24-27). The zeppelin roams at y=7 well above these, so no
   * ground-level overlap to worry about there. */
  flag: {
    positions: [
      { x: 1.5, y: 0, z: 0 }, // row 20, col 26 — original, near spawn
      { x: -5.7, y: 0, z: -8.4 }, // row 6, col 14 — north field
      { x: -8.7, y: 0, z: -4.2 }, // row 13, col 9 — west of the NPC
      { x: 0.3, y: 0, z: 5.4 }, // row 29, col 24 — south of spawn
      { x: 3.3, y: 0, z: 8.4 }, // row 34, col 29 — far south
    ],
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
    /** Feature flag: when true, a guard that has already aggroed (started
     * fighting the player) NEVER transitions to "leash" — it keeps chasing
     * and attacking even past `leashRadius` until either it or the player
     * dies. Set to false to restore the classic walk-home-and-heal behavior. */
    noLeash: true,
    attackRange: 1.4,
    // Was 240-360 (avg 300) at a 1400ms cooldown. Fixing the aggro-on-hit
    // gap (guards used to only aggro on proximity, so a ranged axe poke from
    // outside `aggroRadius` was free damage) already restores real
    // retaliation risk on its own — a solo guard fight now lands roughly
    // one third of the player's 2000 HP in damage before it dies to 3 axe
    // hits. This bump (avg 330, cooldown 1200ms) is a modest ~10-15% push on
    // top of that, not a from-scratch rebalance — `maxHealth` is left alone
    // since the aggro fix already did most of the work and inflating it
    // further would mostly stall the fight rather than add real risk.
    attackDamageMin: 270,
    attackDamageMax: 390,
    /** WoW-ish base miss rate — slightly worse than the player's `axe.hitChance`
     * so the player keeps a small edge in a straight trade. */
    hitChance: 0.85,
    attackCooldownMs: 1200,
    maxHealth: 1000,
    walkSpeed: 3,
    positions: {
      ferris: { x: 8.7, y: 0, z: -3 },
      gopher: { x: 12.3, y: 0, z: -3 },
      // Ferris/Gopher flank the chest east-west on the same row (15).
      // Duke guards from the north (row 8) instead — the far side of the
      // chest from the other two, so the encounter reads as guarded from
      // multiple sides rather than a third guard stacked on the same line.
      duke: { x: 10.5, y: 0, z: -7 },
    },
  },
  /** Sits between the two guards. */
  chest: {
    position: { x: 10.5, y: 0, z: -3 },
    interactRadius: 2,
  },
  axe: {
    // 320-480 → 240-360 (avg 400 → 300): the cooldown dropped to 1500ms, so
    // per-hit damage came down to keep DPS from spiking ~67%. Net effect is
    // same-ish total damage but with faster, lighter hits — and a guard
    // (1000 HP) now takes ~4 hits instead of ~3.
    damageMin: 240,
    damageMax: 360,
    /** Base miss rate — a reasonable WoW-ish 90% hit chance, not punishing. */
    hitChance: 0.9,
    // 2500 → 1500: faster reload per user request. The cooldown-wipe
    // animation in ActionBar reads this same constant, so it stays in sync.
    cooldownMs: 1500,
    // Out-ranges a guard's own aggro trigger distance (3.5) comfortably
    // without being absurd relative to leashRadius (6).
    range: 7,
    projectileDurationMs: 350,
  },
  combat: {
    invulnerabilityMs: 800,
    respawnDelayMs: 2000,
    respawnInvulnerabilityMs: 2000,
    playerSpawnPosition: { x: 0, y: 0, z: 0 },
  },
  /** Mobile HUD tunables — the desktop HUD has no equivalents since it's
   * all fixed-pixel sizing baked into each component's className. */
  mobile: {
    joystick: {
      baseDiameter: 104,
      thumbDiameter: 46,
      /** Pointer travel below this fraction of the base radius reports no
       * direction — avoids jittering between sectors near dead center. */
      deadZone: 0.2,
    },
    /** 9 size-8 slots + gap-1 between them = 9*32 + 8*4 = 320px — matches
     * `ActionBar`'s mobile branch, mirrored here so `XpBarHud` can match it. */
    actionBarWidth: "320px",
  },
}
