import { useEffect, useRef, useState } from "react"
import { play } from "cuelume"

import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { DUKE_SPRITE, FERRIS_SPRITE, GOPHER_SPRITE } from "@/data/guard-sprites"
import type { SpriteSheetConfig } from "@/data/sprites"
import { useResumeZergStore } from "@/lib/resume-zerg-store"

const SPRITES = [FERRIS_SPRITE, GOPHER_SPRITE, DUKE_SPRITE]
const WAVE_SIZE = 24
const SPEED = 140 // px/second
const SCALE = 0.4
const RUSH_DURATION_MS = 25000
const ARRIVE_EPSILON = 6

interface Enemy {
  id: number
  sprite: SpriteSheetConfig
  x: number
  y: number
  targetX: number
  targetY: number
}

let nextId = 1

function randomPoint() {
  return { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }
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
 * plain DOM `SpriteAnimation`s (no Three.js) that wander the page and can
 * be clicked to squish. No pathfinding — same "walks straight over the
 * content" philosophy as `ResumeWalker`.
 */
export function ResumeZergRush() {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [kills, setKills] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const enemiesRef = useRef<Enemy[]>([])
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const endTimeoutRef = useRef<number | null>(null)
  const messageTimeoutRef = useRef<number | null>(null)

  // Subscribed rather than selected + keyed off in a dependency array: the
  // store's `waveToken` is an external event ("start a wave now"), not
  // render-derived state, so the spawn side effect belongs in the
  // subscription callback, not synchronously in an effect body reacting to
  // a selector value.
  useEffect(() => {
    return useResumeZergStore.subscribe((state, prevState) => {
      if (state.waveToken === prevState.waveToken) return

      const wave = Array.from({ length: WAVE_SIZE }, () => {
        const spawn = spawnPoint()
        const target = randomPoint()
        return {
          id: nextId++,
          sprite: SPRITES[Math.floor(Math.random() * SPRITES.length)],
          x: spawn.x,
          y: spawn.y,
          targetX: target.x,
          targetY: target.y,
        }
      })
      enemiesRef.current = wave
      setEnemies(wave)
      setKills(0)
      setMessage(null)
      setRunning(true)

      if (endTimeoutRef.current !== null) window.clearTimeout(endTimeoutRef.current)
      endTimeoutRef.current = window.setTimeout(() => {
        const survivors = enemiesRef.current.length
        enemiesRef.current = []
        setEnemies([])
        setRunning(false)
        setMessage(
          survivors === 0
            ? `¡Portafolio defendido! ${WAVE_SIZE}/${WAVE_SIZE} derrotados.`
            : `Se retiraron los invasores — ${WAVE_SIZE - survivors}/${WAVE_SIZE} derrotados.`
        )
      }, RUSH_DURATION_MS)
    })
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

      let changed = false
      enemiesRef.current = enemiesRef.current.map((enemy) => {
        const dx = enemy.targetX - enemy.x
        const dy = enemy.targetY - enemy.y
        const distance = Math.hypot(dx, dy)

        if (distance <= ARRIVE_EPSILON) {
          const next = randomPoint()
          changed = true
          return { ...enemy, targetX: next.x, targetY: next.y }
        }

        const travel = Math.min(distance, SPEED * delta)
        changed = true
        return { ...enemy, x: enemy.x + (dx / distance) * travel, y: enemy.y + (dy / distance) * travel }
      })

      if (changed) setEnemies(enemiesRef.current)
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
    setKills((current) => current + 1)
    play("chime")
  }

  if (enemies.length === 0 && !message) return null

  return (
    <>
      {enemies.length > 0 && (
        <p className="fixed top-16 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground dark:border-ring print:hidden">
          Invasores derrotados: {kills}/{WAVE_SIZE}
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
