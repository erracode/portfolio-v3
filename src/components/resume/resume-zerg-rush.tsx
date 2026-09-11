import { useEffect, useRef, useState } from "react"
import { play } from "cuelume"

import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { DUKE_SPRITE, FERRIS_SPRITE, GOPHER_SPRITE } from "@/data/guard-sprites"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useResumeZergStore } from "@/lib/resume-zerg-store"

const SPRITES = [FERRIS_SPRITE, GOPHER_SPRITE, DUKE_SPRITE]
const WAVE_SIZE = 12
/** Trickle enemies in one at a time instead of dropping the whole wave on
 * the player at once. */
const SPAWN_INTERVAL_MS = 1000
const ENEMY_SPEED = 130 // px/second — slower than ResumeWalker's 220, so kiting is actually possible
const ENEMY_HP = 2
const SCALE = 0.4
const ARRIVE_EPSILON = 6

// Player's attack — a thrown axe. Manually triggered (Space) rather than
// auto-firing, so kiting is an actual input — move to reposition, press
// to throw when you're ready — not just standing there while it fires
// itself. Aimed at the cursor (desktop only — there's no pointer to aim
// with on touch), not auto-targeted: it can miss.
//
// No fixed max range — it flies straight until it exits the viewport,
// same as the wave itself having no timer: distance is now the cursor's
// job, not a constant. Travel time scales with distance at a constant
// speed instead of a fixed duration, so a short throw isn't crawling and
// a cross-screen one isn't teleporting.
//
// Multiple axes can be in flight at once — nothing here limits it to one;
// the only real gate is the cooldown below. Kept short (not the 3D
// game's 1500ms `WORLD_CONFIG.axe.cooldownMs`) so that's actually visible
// instead of every throw finishing its (now fast) flight before the next
// one is even allowed.
const AXE_SPEED = 1600 // px/second
const ATTACK_COOLDOWN_MS = 400
const HIT_RADIUS = 55 // how close the landing point needs to be to an enemy to connect
const CONTACT_RADIUS = 40
const PROJECTILE_SCALE = 0.15

// `ResumeWalker` anchors its sprite at the feet (translate(-50%, -100%) at
// playerPositionRef), not the center — its rendered height is
// PLAYER_SPRITE.frameHeight (250) * its own SCALE (0.2) = 50px, so the
// visual center sits 25px above that anchor. Throwing from the raw
// position would spawn the axe at ground level, not from the character.
const PLAYER_VISUAL_OFFSET_Y = -25

// Same sprite sheet as the 3D game's `AxeProjectile` — 8 square frames,
// single row.
const AXE_SHEET = {
  src: "/game/axe-sheet.png",
  frameWidth: 220,
  frameHeight: 220,
  sheetWidth: 220 * 8,
  sheetHeight: 220,
  frameCount: 8,
}

const WHOOSH_SOUNDS = ["/sounds/mWooshLarge1.ogg", "/sounds/mWooshLarge2.ogg", "/sounds/mWooshLarge3.ogg"]
const AXE_HIT_SOUNDS = [
  "/sounds/m1hAxeHitFlesh1a.ogg",
  "/sounds/m1hAxeHitFlesh1b.ogg",
  "/sounds/m1hAxeHitFlesh1c.ogg",
]
const PLAYER_HIT_SOUNDS = [
  "/sounds/1hDaggerHitFleshA.ogg",
  "/sounds/1hDaggerHitFleshB.ogg",
  "/sounds/1hDaggerHitFleshC.ogg",
]

function playRandom(files: readonly string[]) {
  const audio = new Audio(files[Math.floor(Math.random() * files.length)])
  audio.play().catch(() => {})
}

interface Enemy {
  id: number
  sprite: SpriteSheetConfig
  x: number
  y: number
  hp: number
}

interface Projectile {
  id: number
  x: number
  y: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  startedAt: number
  durationMs: number
}

let nextId = 1
let nextProjectileId = 1

/** Distance from (x, y) along direction (dirX, dirY) until the ray exits
 * the viewport — the axe's actual max range, since it flies until it's
 * off camera rather than stopping at a fixed distance. */
function distanceToScreenEdge(x: number, y: number, dirX: number, dirY: number): number {
  const w = window.innerWidth
  const h = window.innerHeight
  let distance = Infinity
  if (dirX > 0) distance = Math.min(distance, (w - x) / dirX)
  else if (dirX < 0) distance = Math.min(distance, (0 - x) / dirX)
  if (dirY > 0) distance = Math.min(distance, (h - y) / dirY)
  else if (dirY < 0) distance = Math.min(distance, (0 - y) / dirY)
  return distance
}

function spawnEnemy(): Enemy {
  const spawn = spawnPoint()
  return {
    id: nextId++,
    sprite: SPRITES[Math.floor(Math.random() * SPRITES.length)],
    x: spawn.x,
    y: spawn.y,
    hp: ENEMY_HP,
  }
}

/** Enters from a random screen edge, same idea as Google's own "zerg
 * rush" easter egg — the invaders start off camera, not already
 * standing on the page. */
function spawnPoint() {
  const edge = Math.floor(Math.random() * 4)
  const w = window.innerWidth
  const h = window.innerHeight
  if (edge === 0) return { x: Math.random() * w, y: -40 }
  if (edge === 1) return { x: w + 40, y: Math.random() * h }
  if (edge === 2) return { x: Math.random() * w, y: h + 40 }
  return { x: -40, y: Math.random() * h }
}

/**
 * "Zerg rush" easter egg for `/resume` — triggered by the `zerg` command
 * in `ResumeCommandPalette`. Reuses the same three guard sprites
 * (Ferris/Gopher/Duke) from the game's `WorldGuard` enemies, rendered as
 * plain DOM `SpriteAnimation`s (no Three.js). They chase `ResumeWalker`'s
 * live position instead of wandering — combined with the player moving
 * faster than they do, that's what makes actual kiting possible: throw
 * the axe, reposition, throw again. No pathfinding — same "walks
 * straight toward the target" philosophy as `ResumeWalker`'s own
 * click-to-move.
 */
export function ResumeZergRush() {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [kills, setKills] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const enemiesRef = useRef<Enemy[]>([])
  const projectilesRef = useRef<Projectile[]>([])
  const killsRef = useRef(0)
  const spawnedCountRef = useRef(0)
  const spawnTimerRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const attackTimerRef = useRef(0)
  /** Edge-triggered by the Space keydown handler below, consumed once per
   * press in the step loop — same pattern as the game's own
   * `interactPressedRef`. */
  const attackRequestedRef = useRef(false)
  const cursorRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const messageTimeoutRef = useRef<number | null>(null)
  const playerHp = useResumeZergStore((state) => state.playerHp)
  const maxPlayerHp = useResumeZergStore((state) => state.maxPlayerHp)

  const addKill = () => {
    killsRef.current += 1
    setKills(killsRef.current)
  }

  // No timeout branch anymore — a wave only ends by being cleared or by
  // the player going down, so survivors are always 0 by the time this runs.
  const endWave = (reason: "cleared" | "defeated") => {
    enemiesRef.current = []
    projectilesRef.current = []
    setEnemies([])
    setProjectiles([])
    setRunning(false)
    setMessage(
      reason === "defeated"
        ? `Te alcanzaron los invasores — ${killsRef.current}/${WAVE_SIZE} derrotados antes de caer.`
        : `¡Portafolio defendido! ${WAVE_SIZE}/${WAVE_SIZE} derrotados.`
    )
  }

  // Subscribed rather than selected + keyed off in a dependency array: both
  // "a new wave started" and "the player just died" are external events,
  // not render-derived state, so the side effects belong in subscription
  // callbacks, not synchronously in an effect body reacting to a selector.
  useEffect(() => {
    const unsubWave = useResumeZergStore.subscribe((state, prevState) => {
      if (state.waveToken === prevState.waveToken) return

      // First one shows up immediately — the rest trickle in via the step
      // loop's spawn timer, not all 24 dropped on the player at once.
      const first = spawnEnemy()
      enemiesRef.current = [first]
      projectilesRef.current = []
      attackTimerRef.current = 0
      spawnedCountRef.current = 1
      spawnTimerRef.current = 0
      killsRef.current = 0
      setEnemies([first])
      setProjectiles([])
      setKills(0)
      setMessage(null)
      setRunning(true)
    })

    const unsubHp = useResumeZergStore.subscribe((state, prevState) => {
      if (state.playerHp > 0 || prevState.playerHp <= 0) return
      endWave("defeated")
    })

    return () => {
      unsubWave()
      unsubHp()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return
      if (!running) return
      // Space scrolls the page by default — this is the one key this
      // page repurposes while a wave is active.
      event.preventDefault()
      attackRequestedRef.current = true
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [running])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY }
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  useEffect(() => {
    if (!running) return

    const step = (time: number) => {
      const last = lastTimeRef.current ?? time
      const delta = Math.min((time - last) / 1000, 0.1)
      lastTimeRef.current = time

      if (spawnedCountRef.current < WAVE_SIZE) {
        spawnTimerRef.current += delta
        if (spawnTimerRef.current >= SPAWN_INTERVAL_MS / 1000) {
          spawnTimerRef.current = 0
          spawnedCountRef.current += 1
          enemiesRef.current = [...enemiesRef.current, spawnEnemy()]
        }
      }

      const player = useResumeZergStore.getState().playerPositionRef?.current

      if (player) {
        let hitPlayer = false
        enemiesRef.current = enemiesRef.current.map((enemy) => {
          const dx = player.x - enemy.x
          const dy = player.y - enemy.y
          const distance = Math.hypot(dx, dy)

          if (distance <= CONTACT_RADIUS) hitPlayer = true
          if (distance <= ARRIVE_EPSILON) return enemy

          const travel = Math.min(distance, ENEMY_SPEED * delta)
          return { ...enemy, x: enemy.x + (dx / distance) * travel, y: enemy.y + (dy / distance) * travel }
        })
        if (hitPlayer) {
          const before = useResumeZergStore.getState().playerHp
          useResumeZergStore.getState().takePlayerDamage()
          if (useResumeZergStore.getState().playerHp < before) playRandom(PLAYER_HIT_SOUNDS)
        }

        // Advance every in-flight axe and hit-test it against live enemy
        // positions on every frame — not just once when it reaches its
        // final resting point. With no fixed range, the axe can travel
        // the length of the screen, so a hit has to be resolved wherever
        // it actually crosses an enemy along the way, not only at the
        // endpoint (which is usually empty air past the screen edge).
        if (projectilesRef.current.length > 0) {
          let killedThisFrame = false
          const survivingProjectiles: Projectile[] = []

          for (const projectile of projectilesRef.current) {
            if (time - projectile.startedAt >= projectile.durationMs) continue

            const t = (time - projectile.startedAt) / projectile.durationMs
            const x = projectile.fromX + (projectile.toX - projectile.fromX) * t
            const y = projectile.fromY + (projectile.toY - projectile.fromY) * t

            let targetId: number | null = null
            let hitDistance = HIT_RADIUS
            for (const enemy of enemiesRef.current) {
              const d = Math.hypot(x - enemy.x, y - enemy.y)
              if (d <= hitDistance) {
                targetId = enemy.id
                hitDistance = d
              }
            }

            if (targetId === null) {
              survivingProjectiles.push({ ...projectile, x, y })
              continue
            }

            // Consumed on impact — it doesn't keep flying through the target.
            playRandom(AXE_HIT_SOUNDS)
            const target = enemiesRef.current.find((enemy) => enemy.id === targetId)
            if (target && target.hp <= 1) {
              enemiesRef.current = enemiesRef.current.filter((enemy) => enemy.id !== targetId)
              addKill()
              killedThisFrame = true
              play("chime")
            } else {
              enemiesRef.current = enemiesRef.current.map((enemy) =>
                enemy.id === targetId ? { ...enemy, hp: enemy.hp - 1 } : enemy
              )
            }
          }

          projectilesRef.current = survivingProjectiles
          if (killedThisFrame && enemiesRef.current.length === 0 && spawnedCountRef.current >= WAVE_SIZE) {
            endWave("cleared")
          }
        }

        attackTimerRef.current += delta
        if (attackRequestedRef.current) {
          attackRequestedRef.current = false
          if (attackTimerRef.current >= ATTACK_COOLDOWN_MS / 1000) {
            attackTimerRef.current = 0
            playRandom(WHOOSH_SOUNDS)

            // Aimed at the cursor, flying until it exits the screen — not
            // "nearest enemy": this can miss if you aim badly. Thrown from
            // the character's visual center, not the feet-anchored
            // position ref, so it actually looks like it comes from the
            // player instead of the ground beneath them.
            const originX = player.x
            const originY = player.y + PLAYER_VISUAL_OFFSET_Y
            const cursor = cursorRef.current
            const dx = cursor.x - originX
            const dy = cursor.y - originY
            const cursorDistance = Math.hypot(dx, dy)
            const [dirX, dirY] = cursorDistance > 0 ? [dx / cursorDistance, dy / cursorDistance] : [0, -1]
            const travel = distanceToScreenEdge(originX, originY, dirX, dirY)
            const landX = originX + dirX * travel
            const landY = originY + dirY * travel
            const durationMs = (travel / AXE_SPEED) * 1000

            projectilesRef.current = [
              ...projectilesRef.current,
              {
                id: nextProjectileId++,
                x: originX,
                y: originY,
                fromX: originX,
                fromY: originY,
                toX: landX,
                toY: landY,
                startedAt: time,
                durationMs,
              },
            ]
          }
        }
      }

      setEnemies(enemiesRef.current)
      setProjectiles(projectilesRef.current)
      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      lastTimeRef.current = null
    }
  }, [running])

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current !== null) window.clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!message) return
    if (messageTimeoutRef.current !== null) window.clearTimeout(messageTimeoutRef.current)
    messageTimeoutRef.current = window.setTimeout(() => setMessage(null), 4000)
  }, [message])

  if (enemies.length === 0 && !message) return null

  return (
    <>
      {enemies.length > 0 && (
        <p className="fixed top-16 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
          Vida: {playerHp}/{maxPlayerHp} · Invasores derrotados: {kills}/{WAVE_SIZE} · Apuntá con el mouse, ESPACIO para lanzar
        </p>
      )}

      {message && (
        <p className="fixed top-16 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
          {message}
        </p>
      )}

      {enemies.map((enemy) => (
        <div
          key={enemy.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-20 print:hidden"
          style={{ left: enemy.x, top: enemy.y, transform: "translate(-50%, -50%)" }}
        >
          <SpriteAnimation
            src={enemy.sprite.src}
            frameWidth={enemy.sprite.frameWidth}
            frameHeight={enemy.sprite.frameHeight}
            frameCount={enemy.sprite.rows.walk.frameCount}
            sheetWidth={enemy.sprite.sheetWidth}
            sheetHeight={enemy.sprite.sheetHeight}
            row={enemy.sprite.rows.walk.row}
            fps={6}
            scale={SCALE}
          />
        </div>
      ))}

      {projectiles.map((projectile) => (
        <div
          key={projectile.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-20 print:hidden"
          style={{ left: projectile.x, top: projectile.y, transform: "translate(-50%, -50%)" }}
        >
          <SpriteAnimation
            src={AXE_SHEET.src}
            frameWidth={AXE_SHEET.frameWidth}
            frameHeight={AXE_SHEET.frameHeight}
            frameCount={AXE_SHEET.frameCount}
            sheetWidth={AXE_SHEET.sheetWidth}
            sheetHeight={AXE_SHEET.sheetHeight}
            fps={24}
            scale={PROJECTILE_SCALE}
          />
        </div>
      ))}
    </>
  )
}
