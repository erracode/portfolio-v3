import { useEffect, useRef, useState } from "react"
import { play } from "cuelume"

import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { DUKE_SPRITE, FERRIS_SPRITE, GOPHER_SPRITE } from "@/data/guard-sprites"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useResumeZergStore } from "@/lib/resume-zerg-store"

const SPRITES = [FERRIS_SPRITE, GOPHER_SPRITE, DUKE_SPRITE]
const WAVE_SIZE = 24
const ENEMY_SPEED = 130 // px/second — slower than ResumeWalker's 220, so kiting is actually possible
const ENEMY_HP = 2
const SCALE = 0.4
const RUSH_DURATION_MS = 25000
const ARRIVE_EPSILON = 6

// Player's auto-attack — a thrown axe, same idea (and cooldown) as the
// game's own axe ability (`WORLD_CONFIG.axe.cooldownMs`).
const ATTACK_RANGE = 180
const ATTACK_COOLDOWN_MS = 1500
const CONTACT_RADIUS = 40

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

let nextId = 1

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
  const [kills, setKills] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const enemiesRef = useRef<Enemy[]>([])
  const killsRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const attackTimerRef = useRef(0)
  const endTimeoutRef = useRef<number | null>(null)
  const messageTimeoutRef = useRef<number | null>(null)
  const playerHp = useResumeZergStore((state) => state.playerHp)
  const maxPlayerHp = useResumeZergStore((state) => state.maxPlayerHp)

  const addKill = () => {
    killsRef.current += 1
    setKills(killsRef.current)
  }

  const endWave = (reason: "cleared" | "timeout" | "defeated") => {
    if (endTimeoutRef.current !== null) window.clearTimeout(endTimeoutRef.current)
    const survivors = enemiesRef.current.length
    enemiesRef.current = []
    setEnemies([])
    setRunning(false)
    setMessage(
      reason === "defeated"
        ? `Te alcanzaron los invasores — ${killsRef.current}/${WAVE_SIZE} derrotados antes de caer.`
        : survivors === 0
          ? `¡Portafolio defendido! ${WAVE_SIZE}/${WAVE_SIZE} derrotados.`
          : `Se retiraron los invasores — ${WAVE_SIZE - survivors}/${WAVE_SIZE} derrotados.`
    )
  }

  // Subscribed rather than selected + keyed off in a dependency array: both
  // "a new wave started" and "the player just died" are external events,
  // not render-derived state, so the side effects belong in subscription
  // callbacks, not synchronously in an effect body reacting to a selector.
  useEffect(() => {
    const unsubWave = useResumeZergStore.subscribe((state, prevState) => {
      if (state.waveToken === prevState.waveToken) return

      const wave = Array.from({ length: WAVE_SIZE }, () => {
        const spawn = spawnPoint()
        return {
          id: nextId++,
          sprite: SPRITES[Math.floor(Math.random() * SPRITES.length)],
          x: spawn.x,
          y: spawn.y,
          hp: ENEMY_HP,
        }
      })
      enemiesRef.current = wave
      attackTimerRef.current = 0
      killsRef.current = 0
      setEnemies(wave)
      setKills(0)
      setMessage(null)
      setRunning(true)

      if (endTimeoutRef.current !== null) window.clearTimeout(endTimeoutRef.current)
      endTimeoutRef.current = window.setTimeout(() => endWave("timeout"), RUSH_DURATION_MS)
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
    return () => {
      if (endTimeoutRef.current !== null) window.clearTimeout(endTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!running) return

    const step = (time: number) => {
      const last = lastTimeRef.current ?? time
      const delta = Math.min((time - last) / 1000, 0.1)
      lastTimeRef.current = time

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

        attackTimerRef.current += delta
        if (attackTimerRef.current >= ATTACK_COOLDOWN_MS / 1000) {
          let nearest: Enemy | null = null
          let nearestDistance = ATTACK_RANGE
          for (const enemy of enemiesRef.current) {
            const d = Math.hypot(player.x - enemy.x, player.y - enemy.y)
            if (d <= nearestDistance) {
              nearest = enemy
              nearestDistance = d
            }
          }
          if (nearest) {
            attackTimerRef.current = 0
            playRandom(WHOOSH_SOUNDS)
            const targetId = nearest.id
            window.setTimeout(() => {
              const stillThere = enemiesRef.current.find((enemy) => enemy.id === targetId)
              if (!stillThere) return
              playRandom(AXE_HIT_SOUNDS)
              if (stillThere.hp <= 1) {
                enemiesRef.current = enemiesRef.current.filter((enemy) => enemy.id !== targetId)
                addKill()
                play("chime")
              } else {
                enemiesRef.current = enemiesRef.current.map((enemy) =>
                  enemy.id === targetId ? { ...enemy, hp: enemy.hp - 1 } : enemy
                )
              }
              setEnemies(enemiesRef.current)
              if (enemiesRef.current.length === 0) endWave("cleared")
            }, 200)
          }
        }
      }

      setEnemies(enemiesRef.current)
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

  const squish = (id: number) => {
    enemiesRef.current = enemiesRef.current.filter((enemy) => enemy.id !== id)
    setEnemies(enemiesRef.current)
    addKill()
    play("chime")
    if (enemiesRef.current.length === 0 && running) endWave("cleared")
  }

  if (enemies.length === 0 && !message) return null

  return (
    <>
      {enemies.length > 0 && (
        <p className="fixed top-16 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
          Vida: {playerHp}/{maxPlayerHp} · Invasores derrotados: {kills}/{WAVE_SIZE}
        </p>
      )}

      {message && (
        <p className="fixed top-16 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
          {message}
        </p>
      )}

      {enemies.map((enemy) => (
        <button
          key={enemy.id}
          type="button"
          onClick={() => squish(enemy.id)}
          aria-label="Aplastar invasor"
          className="fixed z-20 cursor-crosshair print:hidden"
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
        </button>
      ))}
    </>
  )
}
